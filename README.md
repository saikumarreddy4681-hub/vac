# Vehicle Rental Booking System

A complete full-stack web application designed for a Vehicle Rental Management System. This project integrates a frontend React application, a Node.js/Express backend, and comprehensive testing and deployment documentation.

## Modules

### 1. Frontend Module (Student 1)
Located in the `frontend/` directory.
- **Technologies**: React.js, Tailwind CSS, Vite
- **Features**: Vehicle Availability Calendar, Vehicle Status Color Coding (🟢 Available, 🔴 Booked, 🟡 Maintenance), Dynamic Filters, Date Range Selection, Dashboard, and an Admin Maintenance Blocking interface.

### 2. Backend Module (Student 2)
Located in the `backend/` directory.
- **Technologies**: Node.js, Express.js, MongoDB (Mongoose)
- **Features**: RESTful APIs for Vehicles, Bookings, and Maintenance. Includes robust conflict checking logic to prevent double bookings, along with API endpoints for aggregating status and usage reports.

### 3. Testing & Deployment (Student 3)
Located in the `docs/` and `postman/` directories.
- **Postman Collection**: `postman/Vehicle_Rental_System.postman_collection.json` containing all backend endpoints for easy testing.
- **Testing Checklist**: `docs/testing_checklist.md` covering all functional and API testing scenarios.
- **Deployment Instructions**: `docs/deployment_instructions.md` outlining the steps for deploying both the frontend and backend to production environments.

## Getting Started

1. Navigate to the `backend/` folder, run `npm install`, start MongoDB, run `node seed.js` to populate mock vehicles, and run `node server.js` to start the API.
2. Navigate to the `frontend/` folder, run `npm install`, and start the development server with `npm run dev`.
