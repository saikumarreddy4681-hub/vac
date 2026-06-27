const mysql = require('mysql2');
const mongoose = require('mongoose');

let useMongooseFallback = (process.env.NODE_ENV === 'production');

let connection = null;
if (!useMongooseFallback) {
    try {
        connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'saikumar@4681P',
            database: 'vehicle_available_calender',
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
        // Handle optional values parameter
        if (typeof values === 'function') {
            callback = values;
            values = [];
        }

        if (useMongooseFallback) {
            runMongooseQuery(sql, values, callback);
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