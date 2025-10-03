import express from "express";
import cors from "cors";
import reliefRoutes from "./routes/relief.route";
import emergenciesRoutes from "./routes/emergencies.route"; // emergencies route
import { prisma } from "./config/prisma";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mount routes
app.use("/api", reliefRoutes);
app.use("/api/emergencies", emergenciesRoutes);

// Function to update existing Emergency records with default contactPerson
async function updateExistingEmergencies() {
  try {
    const result = await prisma.emergency.updateMany({
      where: { contactPerson: null },
      data: {
        contactPerson: "Unknown Contact",
        updatedAt: new Date(), // update timestamp
      },
    });
    console.log(`✅ Updated ${result.count} emergency records.`);
  } catch (err) {
    console.error("❌ Error updating emergencies:", err);
  }
}

// Start server
app.listen(PORT, async () => {
  console.log("\n🌍 CEBU EARTHQUAKE RELIEF DISTRIBUTION SYSTEM");
  console.log(`✅ Server running at http://localhost:${PORT}`);

  // Run the update script after server starts
  await updateExistingEmergencies();

  // Disconnect Prisma to avoid hanging connections
  await prisma.$disconnect();
});
