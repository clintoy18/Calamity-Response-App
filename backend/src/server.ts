import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import reliefRoutes from "./routes/relief.route";
import emergenciesRoutes from "./routes/emergencies.route"; // <-- import emergencies route
import authRoutes from "./routes/auth.route";
import adminRoutes from "./routes/admin.route";
import fileRoutes from "./routes/files.route";
import { connectDB } from "./config/db";

const app = express();
const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1);

app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // add PATCH and OPTIONS
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);
app.use(express.json());

// Mount routes
app.use("/api", reliefRoutes);
app.use("/api/emergencies", emergenciesRoutes); // <-- mount emergencies route
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes); // <-- mount admin route
app.use("/api/files", fileRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🚀`);
  });
});
