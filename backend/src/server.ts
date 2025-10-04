import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import reliefRoutes from "./routes/relief.route";
import emergenciesRoutes from "./routes/emergencies.route"; // <-- import emergencies route
import authRoutes from "./routes/auth.route";
import adminRoutes from "./routes/admin.route";
import { connectDB } from "./config/db";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

// Mount routes
app.use("/api", reliefRoutes);
app.use("/api/emergencies", emergenciesRoutes); // <-- mount emergencies route
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes); // <-- mount admin route

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🚀`);
  });
});
