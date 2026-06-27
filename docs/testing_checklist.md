# System Testing & QA Checklist

## 1. Functional Testing Coverage

### Vehicle Availability Display
- [x] Vehicles correctly show "Available" (🟢 Green) when there are no bookings or maintenance blocks for selected dates.
- [x] Vehicles correctly show "Booked" (🔴 Red) when there is an active booking for selected dates.
- [x] Vehicles correctly show "Maintenance" (🟡 Yellow) when there is an active maintenance block for selected dates.
- [x] Status colors update dynamically when a new booking or maintenance block is created.

### Booking Conflict Prevention
- [x] Create a booking for Vehicle A from Date X to Date Y.
- [x] Attempt to create another booking for Vehicle A during the exact same dates -> **Should fail with "Vehicle is already booked" error.**
- [x] Attempt to create another booking overlapping the dates -> **Should fail.**
- [x] Attempt to create a booking during a maintenance block -> **Should fail with "Vehicle is blocked for maintenance" error.**

### Admin Maintenance Blocking
- [x] Verify admin can select a vehicle and block it for maintenance.
- [x] Verify a maintenance block automatically marks the vehicle as "Maintenance" if the block falls on the current date.
- [x] Verify removing the maintenance block unblocks the vehicle and updates its status back to "Available".
- [x] Attempt to block a vehicle without a required reason -> **Should trigger validation error.**

### Calendar & Filtering
- [x] Change the start and end dates on the calendar view -> List should re-fetch and update vehicle availability dynamically based on selected date ranges.
- [x] Change the Filter Status to "Available Only" -> Only vehicles with 🟢 Green status are shown.
- [x] Change the Filter Status to "Booked Only" -> Only vehicles with 🔴 Red status are shown.
- [x] Change the Filter Status to "Maintenance Only" -> Only vehicles with 🟡 Yellow status are shown.

---

## 2. API Testing Coverage (Using Postman)

- `GET /api/vehicles` - **Status 200 OK**. Returns array of vehicles.
- `GET /api/vehicles/availability?startDate=...&endDate=...` - **Status 200 OK**. Returns vehicles with `availabilityStatus` appended based on dates.
- `POST /api/bookings/check-conflict` - **Status 200/409**. Returns `{ conflict: boolean }`.
- `POST /api/maintenance/block` - **Status 201 Created**. Returns the created maintenance block.
- `GET /api/maintenance` - **Status 200 OK**. Returns all blocks populated with vehicle info.
- `DELETE /api/maintenance/:id/unblock` - **Status 200 OK**. Returns success message.
- `GET /api/status/summary` - **Status 200 OK**. Returns numeric counts of total, available, booked, maintenance.

*Note: All API routes gracefully handle server errors with a 500 status and missing parameters with 400 Bad Request.*
