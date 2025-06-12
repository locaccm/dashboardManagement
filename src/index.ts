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
import { validateApiUrl } from "./utils/envValidator";

// Dynamically build the allow-list
const allowedDomains = [
  "localhost",
  "fake-auth",
  "fake-accommodation",
  "fake-event",
];

// Only validate URLs outside of test env
if (process.env.NODE_ENV !== "test") {
  validateApiUrl(process.env.EVENT_API, allowedDomains);
  validateApiUrl(process.env.ACCOMMODATION_API, allowedDomains);
  validateApiUrl(process.env.AUTH_SERVICE_URL, allowedDomains);
}

const app = express();

app.use(cors()); //NOSONAR
app.use(express.json());

app.use("/events", eventRoutes);
app.use("/messages", messageRoutes);
app.use("/profiles", profileRoutes);
app.use("/leases", leaseRoutes);
app.use("/accommodations", accommodationRoutes);

setupSwagger(app);

export default app;
