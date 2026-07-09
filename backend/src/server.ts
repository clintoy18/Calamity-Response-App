import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import reliefRoutes from "./routes/relief.route";
import emergenciesRoutes from "./routes/emergencies.route";
import authRoutes from "./routes/auth.route";
import adminRoutes from "./routes/admin.route";
import fileRoutes from "./routes/files.route";
import earthquakeRoutes from "./routes/earthquake.route";
import botRoutes from "./routes/bot.route"; // <-- import bot routes
import ashfallRoutes from "./routes/ashfall.route";
import { connectDB } from "./config/db";
import { validateBotConfig } from "./config/bot.config"; // <-- import bot config validation
import { botController } from "./controllers/bot.controller"; // <-- import bot controller

const app = express();
const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1);

app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type","Authorization","X-Requested-With","Cache-Control","Pragma"]
}));

app.use(express.json());

// Mount routes
app.use("/api", reliefRoutes);
app.use("/api/emergencies", emergenciesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/bot", botRoutes); // <-- mount bot routes
app.use("/api/ashfall", ashfallRoutes);
// app.use("/api/earthquakes", earthquakeRoutes);


connectDB().then(async () => {
  // Validate and initialize bot
  try {
    validateBotConfig();
    await botController.initializeBot();
  } catch (error) {
    console.error("⚠️ Bot initialization failed:", error);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🚀`);
  });
});
