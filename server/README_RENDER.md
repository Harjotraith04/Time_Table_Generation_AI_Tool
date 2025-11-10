Render deployment notes

1. Create a new Web Service on Render
   - Connect your GitHub repo
   - Set the root directory for the service to `/server`
   - Environment: Node
   - Plan: Starter (or choose as needed)

2. Build & Start commands
   - Build Command: leave empty (no build step required for this Node Express server)
   - Start Command: `npm run start` (server's package.json defines this as `node server.js`)

3. Environment Variables
   - Set the following variables in Render's dashboard (Environment > Environment Variables):
     - MONGODB_URI = <your-mongodb-atlas-connection-string>
     - JWT_SECRET = <your_jwt_secret>
     - CLIENT_URL = https://<your-vercel-site>.vercel.app
     - NODE_ENV = production
     - GEMINI_API_KEY = <optional, if using Gemini>

4. Health Check
   - Set the Health Check path to `/api/health` so Render can verify the service is up.

5. Regions
   - Choose a region close to your user base. (e.g., OREGON, SINGAPORE)

6. Logs & Monitoring
   - Use Render's logs to monitor startup. If MongoDB connection fails, ensure `MONGODB_URI` is set correctly and network access to Atlas allows Render's IPs.

7. Socket.io
   - Socket.io connections should point to the full Render URL (e.g., `https://timetable-backend.onrender.com`). If you use relative endpoints, set the client to use `VITE_API_URL` and derive socket endpoint from it.

8. Database migrations and initial seed
   - If you have seed scripts, run them post-deploy via Render's dashboard "Run Command" feature or include a migration step in deployment.

9. Rollbacks
   - Render supports manual rollbacks to previous deploys in the dashboard.
