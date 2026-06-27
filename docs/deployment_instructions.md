# Deployment Instructions

## System Requirements
- Node.js (v16.x or newer)
- MongoDB Server (Local instance or MongoDB Atlas)

---

## 1. Environment Configuration

### Backend
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/vehicle_rental
JWT_SECRET=supersecretkey_change_in_production
```

### Frontend
Vite automatically uses `.env` files in the `frontend/` directory. If the backend is running on a different URL in production, create an `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://your-production-domain.com/api
```
*(Note: Current code assumes `http://localhost:5000` for ease of testing. In production, change Axios base URLs accordingly).*

---

## 2. Local Setup & Testing

**Backend:**
1. Open terminal and `cd backend`
2. Run `npm install`
3. Run `npm run dev` (if nodemon installed) or `node server.js`
4. In a separate terminal, run the database seeder to populate sample vehicles:
   `node seed.js`
5. Verify backend runs on `http://localhost:5000`

**Frontend:**
1. Open terminal and `cd frontend`
2. Run `npm install`
3. Run `npm run dev`
4. Visit `http://localhost:5173` to view the application.

---

## 3. Production Deployment (e.g., Render, Vercel, Heroku)

### Backend Deployment (Render / Heroku)
1. Push the repository to GitHub.
2. In your hosting provider, connect your GitHub repository and point the build to the `backend/` folder.
3. Set the **Build Command** to `npm install`.
4. Set the **Start Command** to `node server.js`.
5. Add your `.env` Environment Variables in the hosting provider dashboard (`MONGO_URI` etc).

### Frontend Deployment (Vercel / Netlify)
1. Connect your GitHub repository to Vercel/Netlify.
2. Set the **Root Directory** to `frontend/`.
3. The platform will automatically detect Vite. 
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add any `.env` variables required (e.g., your deployed backend URL).
5. Deploy and verify the live URL.

---

## 4. Post-Deployment Validation Checklist

- [ ] Open the live Frontend URL. Does the UI load successfully?
- [ ] Check the "Dashboard" tab. Do statistics load without errors? (Validates Backend DB connection).
- [ ] Check the "Calendar & Availability" tab. Does changing dates properly update the availability status of vehicles?
- [ ] Go to "Maintenance". Block a vehicle. Does it show up in the blocks list, and does its status change to "Maintenance" (🟡)?
- [ ] Open Postman and run the `GET /api/status/summary` endpoint against the production backend URL to verify API is publicly accessible.
