const express = require('express');
const router = express.Router();
const db = require('../db'); // Imports your new MySQL connection

// 1. GET ALL VEHICLES
router.get('/', (req, res) => {
    const sqlQuery = "SELECT * FROM vehicles";

    db.query(sqlQuery, (error, results) => {
        if (error) {
            console.error("Error fetching vehicles:", error);
            return res.status(500).json({ error: "Failed to fetch vehicles" });
        }
        res.json(results);
    });
});

// 1.5 GET VEHICLES AVAILABILITY (Date Range check)
router.get('/availability', async (req, res) => {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
        return res.status(400).json({ error: "Missing startDate or endDate parameters" });
    }

    try {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ error: "Invalid date format" });
        }

        // Import Mongoose models
        const Booking = require('../models/Booking');
        const Maintenance = require('../models/Maintenance');

        // 1. Fetch active overlapping bookings from MongoDB
        const activeBookings = await Booking.find({
            status: 'Active',
            $or: [
                { startDate: { $lte: end }, endDate: { $gte: start } }
            ]
        });

        // 2. Fetch active overlapping maintenance from MongoDB
        const activeMaintenance = await Maintenance.find({
            status: { $ne: 'Completed' },
            $or: [
                { startDate: { $lte: end }, endDate: { $gte: start } }
            ]
        });

        // Create sets of booked and maintenance vehicle IDs for O(1) lookup
        const bookedVehicleIds = new Set(activeBookings.map(b => b.vehicleId?.toString()));
        const maintenanceVehicleIds = new Set(activeMaintenance.map(m => m.vehicleId?.toString()));

        // 3. Fetch all vehicles from MySQL
        const sqlQuery = "SELECT * FROM vehicles";
        db.query(sqlQuery, (error, results) => {
            if (error) {
                console.error("Error fetching vehicles for availability:", error);
                return res.status(500).json({ error: "Failed to fetch vehicles" });
            }

            // Map each vehicle to include availability status
            const vehiclesWithAvailability = results.map(v => {
                const vehicleIdStr = v.id.toString();
                let availabilityStatus = 'Available';

                if (maintenanceVehicleIds.has(vehicleIdStr)) {
                    availabilityStatus = 'Maintenance';
                } else if (bookedVehicleIds.has(vehicleIdStr)) {
                    availabilityStatus = 'Booked';
                }

                return {
                    _id: v.id,
                    id: v.id,
                    name: v.name,
                    vehicleType: v.vehicleType,
                    licensePlate: v.licensePlate,
                    status: v.status, // Database base status
                    imageUrl: v.imageUrl,
                    availabilityStatus
                };
            });

            res.json(vehiclesWithAvailability);
        });
    } catch (err) {
        console.error("Error in vehicle availability route:", err);
        res.status(550).json({ error: "Server Error", details: err.message });
    }
});

// 2. GET A SINGLE VEHICLE BY ID
router.get('/:id', (req, res) => {
    const vehicleId = req.params.id;
    const sqlQuery = "SELECT * FROM vehicles WHERE id = ?";

    db.query(sqlQuery, [vehicleId], (error, results) => {
        if (error) return res.status(500).json(error);
        if (results.length === 0) return res.status(404).json({ message: "Vehicle not found" });

        res.json(results[0]);
    });
});

// 3. CREATE A NEW VEHICLE
router.post('/', (req, res) => {
    const { name, vehicleType, licensePlate, status, imageUrl } = req.body;

    const sqlQuery = "INSERT INTO vehicles (name, vehicleType, licensePlate, status, imageUrl) VALUES (?, ?, ?, ?, ?)";
    const values = [name, vehicleType, licensePlate, status, imageUrl];

    db.query(sqlQuery, values, (error, results) => {
        if (error) {
            console.error("Error creating vehicle:", error);
            return res.status(500).json(error);
        }
        res.status(201).json({
            message: "Vehicle added successfully!",
            id: results.insertId
        });
    });
});

// 4. UPDATE A VEHICLE
router.put('/:id', (req, res) => {
    const vehicleId = req.params.id;
    const { name, vehicleType, licensePlate, status, imageUrl } = req.body;

    const sqlQuery = "UPDATE vehicles SET name=?, vehicleType=?, licensePlate=?, status=?, imageUrl=? WHERE id=?";
    const values = [name, vehicleType, licensePlate, status, imageUrl, vehicleId];

    db.query(sqlQuery, values, (error, results) => {
        if (error) return res.status(500).json(error);
        if (results.affectedRows === 0) return res.status(404).json({ message: "Vehicle not found" });

        res.json({ message: "Vehicle updated successfully!" });
    });
});

// 5. DELETE A VEHICLE
router.delete('/:id', (req, res) => {
    const vehicleId = req.params.id;
    const sqlQuery = "DELETE FROM vehicles WHERE id = ?";

    db.query(sqlQuery, [vehicleId], (error, results) => {
        if (error) return res.status(500).json(error);
        if (results.affectedRows === 0) return res.status(404).json({ message: "Vehicle not found" });

        res.json({ message: "Vehicle deleted successfully!" });
    });
});

// 6. SEED VEHICLES IN MYSQL
router.post('/seed', (req, res) => {
    const checkQuery = "SELECT COUNT(*) AS count FROM vehicles";
    db.query(checkQuery, (error, results) => {
        if (error) {
            console.log("Vehicles table might not exist. Attempting to create it...");
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS vehicles (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    vehicleType VARCHAR(50) NOT NULL,
                    licensePlate VARCHAR(50) NOT NULL UNIQUE,
                    status VARCHAR(50) DEFAULT 'Available',
                    imageUrl VARCHAR(500)
                )
            `;
            db.query(createTableQuery, (createErr) => {
                if (createErr) {
                    console.error("Error creating vehicles table:", createErr);
                    return res.status(500).json({ error: "Failed to seed: vehicles table could not be created." });
                }
                doSeed(res);
            });
        } else {
            if (results && results[0] && results[0].count > 0) {
                return res.json({ message: "Database already seeded.", count: results[0].count });
            }
            doSeed(res);
        }
    });
});

const doSeed = (res) => {
    const defaultVehicles = [
        ["Toyota Innova Crysta", "Car", "CAR-6506", "Available", "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80"],
        ["Maruti Swift", "Car", "CAR-8313", "Available", "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=600&q=80"],
        ["Volvo 9400 B11R", "Bus", "BUS-6791", "Available", "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80"],
        ["Tata Starbus Ultra", "Bus", "BUS-2931", "Available", "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=80"]
    ];

    const sqlQuery = "INSERT INTO vehicles (name, vehicleType, licensePlate, status, imageUrl) VALUES ?";
    db.query(sqlQuery, [defaultVehicles], (insertErr, results) => {
        if (insertErr) {
            console.error("Error seeding vehicles:", insertErr);
            return res.status(500).json({ error: "Failed to seed vehicles: " + insertErr.message });
        }
        res.json({ message: "Vehicles seeded successfully!", inserted: results.affectedRows });
    });
};

module.exports = router;