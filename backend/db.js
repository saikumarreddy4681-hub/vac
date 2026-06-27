const mysql = require('mysql2');
const pg = require('pg');
const mongoose = require('mongoose');

const databaseUrl = process.env.DATABASE_URL || '';
const isPostgres = databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://');

let useMongooseFallback = (process.env.NODE_ENV === 'production' && !isPostgres);

let connection = null;
let pgClient = null;

if (!useMongooseFallback) {
    if (isPostgres) {
        console.log('[DB] Connecting to PostgreSQL (Neon)...');
        try {
            pgClient = new pg.Pool({
                connectionString: databaseUrl,
                ssl: {
                    rejectUnauthorized: false
                }
            });
            console.log('[DB] Neon PostgreSQL pool initialized.');
        } catch (err) {
            console.error('[DB] Failed to initialize Neon PostgreSQL:', err.message);
            useMongooseFallback = true;
        }
    } else {
        try {
            connection = mysql.createConnection({
                host: process.env.MYSQL_HOST || 'localhost',
                user: process.env.MYSQL_USER || 'root',
                password: process.env.MYSQL_PASSWORD || 'saikumar@4681P',
                database: process.env.MYSQL_DATABASE || 'vehicle_available_calender',
                connectTimeout: 2000
            });

            connection.connect(error => {
                if (error) {
                    console.warn('[DB] Local MySQL connection failed. Falling back to Mongoose for vehicles.');
                    useMongooseFallback = true;
                }
            });
        } catch (err) {
            console.warn('[DB] Failed to initialize MySQL connection. Falling back to Mongoose.', err.message);
            useMongooseFallback = true;
        }
    }
}

// Helper to get Mongoose Vehicle model
const getVehicleModel = () => {
    try {
        return mongoose.model('Vehicle');
    } catch {
        return require('./models/Vehicle');
    }
};

// Mongoose query runner translating SQL to Mongoose actions
const runMongooseQuery = (sql, values, callback) => {
    const Vehicle = getVehicleModel();
    const queryClean = sql.trim().toLowerCase();

    // 1. SELECT COUNT(*)
    if (queryClean.startsWith('select count(*)')) {
        Vehicle.countDocuments()
            .then(count => {
                callback(null, [{ count }]);
            })
            .catch(err => {
                callback(err);
            });
        return;
    }

    // 2. SELECT * FROM vehicles WHERE id = ?
    if (queryClean.startsWith('select * from vehicles where id =') || queryClean.includes('where id = ?')) {
        const id = values[0];
        Vehicle.findById(id)
            .then(vehicle => {
                if (!vehicle) {
                    callback(null, []);
                } else {
                    const result = vehicle.toObject();
                    result.id = result._id.toString();
                    callback(null, [result]);
                }
            })
            .catch(err => {
                if (err.name === 'CastError') {
                    callback(null, []);
                } else {
                    callback(err);
                }
            });
        return;
    }

    // 3. SELECT * FROM vehicles
    if (queryClean.startsWith('select * from vehicles')) {
        Vehicle.find()
            .then(vehicles => {
                const results = vehicles.map(v => {
                    const obj = v.toObject();
                    obj.id = obj._id.toString();
                    return obj;
                });
                callback(null, results);
            })
            .catch(err => {
                callback(err);
            });
        return;
    }

    // 4. INSERT INTO vehicles
    if (queryClean.startsWith('insert into vehicles')) {
        if (Array.isArray(values[0]) && Array.isArray(values[0][0])) {
            // Bulk insert (used in seeding: values = [[ [name, type, plate, status, url], ... ]])
            const bulkData = values[0].map(item => ({
                name: item[0],
                vehicleType: item[1],
                licensePlate: item[2],
                status: item[3] || 'Available',
                imageUrl: item[4]
            }));
            Vehicle.insertMany(bulkData)
                .then(inserted => {
                    callback(null, { affectedRows: inserted.length, insertId: inserted[0]._id.toString() });
                })
                .catch(err => {
                    callback(err);
                });
            return;
        } else {
            // Single insert: values = [name, type, plate, status, url]
            const [name, vehicleType, licensePlate, status, imageUrl] = values;
            Vehicle.create({ name, vehicleType, licensePlate, status, imageUrl })
                .then(created => {
                    callback(null, { insertId: created._id.toString(), affectedRows: 1 });
                })
                .catch(err => {
                    callback(err);
                });
            return;
        }
    }

    // 5. UPDATE vehicles
    if (queryClean.startsWith('update vehicles')) {
        if (values.length === 6) {
            const [name, vehicleType, licensePlate, status, imageUrl, id] = values;
            Vehicle.findByIdAndUpdate(id, { name, vehicleType, licensePlate, status, imageUrl }, { new: true })
                .then(updated => {
                    callback(null, { affectedRows: updated ? 1 : 0 });
                })
                .catch(err => {
                    callback(err);
                });
        } else if (values.length === 2) {
            const [status, id] = values;
            Vehicle.findByIdAndUpdate(id, { status }, { new: true })
                .then(updated => {
                    callback(null, { affectedRows: updated ? 1 : 0 });
                })
                .catch(err => {
                    callback(err);
                });
        } else {
            callback(new Error('Unsupported UPDATE query parameters'));
        }
        return;
    }

    // 6. DELETE FROM vehicles
    if (queryClean.startsWith('delete from vehicles')) {
        const id = values[0];
        Vehicle.findByIdAndDelete(id)
            .then(deleted => {
                callback(null, { affectedRows: deleted ? 1 : 0 });
            })
            .catch(err => {
                callback(err);
            });
        return;
    }

    // Seeding CREATE TABLE command
    if (queryClean.startsWith('create table')) {
        callback(null);
        return;
    }

    callback(new Error('Unsupported MySQL query in Mongoose fallback mode: ' + sql));
};

const dbWrapper = {
    query: function(sql, values, callback) {
        if (typeof values === 'function') {
            callback = values;
            values = [];
        }

        if (useMongooseFallback) {
            runMongooseQuery(sql, values, callback);
            return;
        }

        if (isPostgres && pgClient) {
            let cleanSql = sql.trim();

            // 1. AUTO_INCREMENT -> SERIAL
            if (cleanSql.toLowerCase().includes('auto_increment')) {
                cleanSql = cleanSql.replace(/auto_increment/gi, 'SERIAL');
            }

            // 2. MySQL bulk insert: "INSERT INTO vehicles (...) VALUES ?"
            if (cleanSql.toLowerCase().startsWith('insert into vehicles') && Array.isArray(values[0]) && Array.isArray(values[0][0])) {
                const rows = values[0];
                const columns = 'name, vehicleType, licensePlate, status, imageUrl';
                const placeholders = [];
                const flatValues = [];
                let counter = 1;
                rows.forEach(row => {
                    const rowPlaceholders = [];
                    for (let i = 0; i < 5; i++) {
                        rowPlaceholders.push(`$${counter}`);
                        flatValues.push(row[i] !== undefined ? row[i] : null);
                        counter++;
                    }
                    placeholders.push(`(${rowPlaceholders.join(', ')})`);
                });
                cleanSql = `INSERT INTO vehicles (${columns}) VALUES ${placeholders.join(', ')}`;
                pgClient.query(cleanSql, flatValues, (err, res) => {
                    if (err) return callback(err);
                    callback(null, { affectedRows: res.rowCount, insertId: 1 });
                });
                return;
            }

            // 3. Convert "?" placeholders to "$1", "$2", etc.
            let placeholderIndex = 0;
            cleanSql = cleanSql.replace(/\?/g, () => {
                placeholderIndex++;
                return `$${placeholderIndex}`;
            });

            pgClient.query(cleanSql, values, (err, res) => {
                if (err) {
                    console.error('[DB] PostgreSQL query error:', err.message);
                    const isConnectionError = err.code?.startsWith('08') || 
                                              err.code === 'ECONNREFUSED' || 
                                              err.message.includes('connect') || 
                                              err.message.includes('timeout') || 
                                              err.message.includes('SSL');
                    if (isConnectionError) {
                        console.warn('[DB] PostgreSQL connection failed. Falling back to Mongoose dynamically:', err.message);
                        useMongooseFallback = true;
                        runMongooseQuery(sql, values, callback);
                    } else {
                        callback(err);
                    }
                    return;
                }
                
                const command = res.command.toLowerCase();
                if (command === 'insert') {
                    callback(null, { affectedRows: res.rowCount, insertId: res.rows[0] ? res.rows[0].id : 1 });
                } else if (command === 'update' || command === 'delete') {
                    callback(null, { affectedRows: res.rowCount });
                } else {
                    let rows = res.rows;
                    if (rows.length > 0 && rows[0].count !== undefined) {
                        rows = rows.map(r => ({ count: parseInt(r.count, 10) }));
                    }
                    callback(null, rows);
                }
            });
            return;
        }

        if (connection) {
            connection.query(sql, values, (err, results) => {
                if (err && (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST' || err.message.includes('connect'))) {
                    console.warn('[DB] MySQL query failed with connection error. Falling back to Mongoose dynamically:', err.message);
                    useMongooseFallback = true;
                    runMongooseQuery(sql, values, callback);
                } else {
                    callback(err, results);
                }
            });
        } else {
            useMongooseFallback = true;
            runMongooseQuery(sql, values, callback);
        }
    }
};

module.exports = dbWrapper;