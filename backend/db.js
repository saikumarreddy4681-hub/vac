const mysql = require('mysql2');

// Create the connection to the database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'saikumar@4681P',
    database: 'vehicle_available_calender'
});

// Open the MySQL connection
db.connect(error => {
    if (error) {
        console.error('Error connecting to the MySQL database:', error);
        return;
    }
    console.log('Successfully connected to the MySQL database from Node.js!');
});

// Export the connection so other files can use it
module.exports = db;