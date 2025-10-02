import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import emergencyRoutes from "./routes/emergencies.route";

const app = express();
const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", async (_, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "connected", timestamp: new Date().toISOString() });
  } catch {
    res.status(500).json({ status: "error", message: "DB connection failed" });
  }
});

// Emergency routes
app.use("/api/emergencies", emergencyRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
