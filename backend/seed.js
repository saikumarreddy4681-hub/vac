const mongoose = require('mongoose');
const Vehicle = require('./models/Vehicle');
require('dotenv').config();

const seedVehicles = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vehicle_rental');

        console.log('Connected to DB');

        // Clear existing vehicles
        await Vehicle.deleteMany({});

        const vehicles = [
            // 🚗 Cars
            { name:"Toyota Innova Crysta", vehicleType:"Car", licensePlate:"CAR-001", status:"Available" },
            { name:"Hyundai Creta", vehicleType:"Car", licensePlate:"CAR-002", status:"Available" },
            { name:"Maruti Swift", vehicleType:"Car", licensePlate:"CAR-003", status:"Available" },
            { name:"Kia Seltos", vehicleType:"Car", licensePlate:"CAR-004", status:"Available" },
            { name:"Tata Nexon", vehicleType:"Car", licensePlate:"CAR-005", status:"Available" },

            // 🏍️ Bikes
            { name:"Royal Enfield Classic 350", vehicleType:"Bike", licensePlate:"BIK-001", status:"Available" },
            { name:"Yamaha R15", vehicleType:"Bike", licensePlate:"BIK-002", status:"Available" },
            { name:"KTM Duke 390", vehicleType:"Bike", licensePlate:"BIK-003", status:"Available" },
            { name:"Honda Activa", vehicleType:"Bike", licensePlate:"BIK-004", status:"Available" },
            { name:"Bajaj Pulsar", vehicleType:"Bike", licensePlate:"BIK-005", status:"Available" },

            // 🛺 Autos
            { name:"Bajaj RE Auto", vehicleType:"Auto", licensePlate:"AUT-001", status:"Available" },
            { name:"Piaggio Ape", vehicleType:"Auto", licensePlate:"AUT-002", status:"Available" },
            { name:"TVS King Auto", vehicleType:"Auto", licensePlate:"AUT-003", status:"Available" },
            { name:"Mahindra Alfa", vehicleType:"Auto", licensePlate:"AUT-004", status:"Available" }
        ];

        await Vehicle.insertMany(vehicles);
        console.log('Vehicles seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedVehicles();
