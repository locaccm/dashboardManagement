import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import profileRoutes from "./routes/profileRoutes";
import { setupSwagger } from "./swagger";
import leaseRoutes from "./routes/leaseRoutes";
import accommodationRoutes from "./routes/accommodationRoutes";
import eventRoutes from "./routes/eventRoutes";
import messageRoutes from "./routes/messageRoutes";

const app = express();

// CORS middleware
app.use(cors()); //NOSONAR

// Middleware JSON
app.use(express.json());

// Register all API routes
app.use("/events", eventRoutes);
app.use("/messages", messageRoutes);
app.use("/profiles", profileRoutes);
app.use("/leases", leaseRoutes);
app.use("/accommodations", accommodationRoutes);

// Initialize Swagger docs
setupSwagger(app);

export default app;
