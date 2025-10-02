import express from "express";
import cors from "cors";
import reliefRoutes from "./routes/relief.route";
import emergenciesRoutes from "./routes/emergencies.route"; // <-- import emergencies route
import donorsRoutes from "./routes/donor.route"; // <-- import donors router

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mount routes
app.use("/api", reliefRoutes);
app.use("/api/emergencies", emergenciesRoutes); // <-- mount emergencies route
app.use("/api/donors", donorsRoutes); // <-- mount donors route
app.listen(PORT, () => {
  console.log("\n🌍 CEBU EARTHQUAKE RELIEF DISTRIBUTION SYSTEM");
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
