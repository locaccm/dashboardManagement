import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

console.log("PROFILE_API =", process.env.PROFILE_API); // Debug log to check environment setup

import express from 'express';
import profileRoutes from './routes/profileRoutes';
import { setupSwagger } from './swagger';
import leaseRoutes from './routes/leaseRoutes';
import accommodationRoutes from './routes/accommodationRoutes';
import eventRoutes from "./routes/eventRoutes";
import messageRoutes from "./routes/messageRoutes";

const app = express();
app.use(express.json()); // Parse incoming JSON requests

// Register all API routes
app.use("/events", eventRoutes);
app.use("/messages", messageRoutes);
app.use('/profiles', profileRoutes);
app.use('/leases', leaseRoutes);
app.use('/accommodations', accommodationRoutes);

// Initialize Swagger docs
setupSwagger(app);

const PORT = process.env.PORT || 4000;

// Start the server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app; // Export the app for testing
