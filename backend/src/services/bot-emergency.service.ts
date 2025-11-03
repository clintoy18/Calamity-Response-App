import Emergency from "../models/Emergency";
import { UserSession } from "../types/bot.types";
import { randomBytes } from "crypto";
import axios from "axios";

class BotEmergencyService {
  /**
   * Generate a unique UUID for emergency
   */
  private generateUUID(): string {
    return randomBytes(16).toString("hex");
  }

  /**
   * Geocode using Nominatim via Axios
   */
  private async geocodeLocation(place: string) {
    try {
      const url = `https://nominatim.openstreetmap.org/search`;

      const response = await axios.get(url, {
        params: {
          q: place,
          format: "json",
          limit: 1,
        },
        headers: {
          "User-Agent": "AidVocateBot/1.0 (Emergency-Humanitarian-Use)",
        },
      });

      const data = response.data;

      if (!data || data.length === 0) {
        console.warn("⚠️ Nominatim: No results for:", place);
        return null;
      }

      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        displayName: data[0].display_name,
      };
    } catch (error) {
      console.error("❌ Nominatim geocode error:", error);
      return null;
    }
  }

  /**
   * Save emergency from bot conversation
   */
  async saveEmergencyFromBot(
    senderId: string,
    session: UserSession
  ): Promise<any> {
    try {
      // Validate required fields
      if (!session.placename || !session.needs || session.needs.length === 0) {
        throw new Error("Missing required fields: placename or needs");
      }

      let lat = 0;
      let lon = 0;

      const geoData = await this.geocodeLocation(session.placename);

      if (geoData) {
        lat = geoData.lat;
        lon = geoData.lon;
        console.log(`📍 Geocoded Location → ${lat}, ${lon} (${geoData.displayName})`);
      } else {
        console.warn("⚠️ Geocoding failed. Saving with 0,0 fallback.");
      }

      const newEmergency = await Emergency.create({
        id: this.generateUUID(),
        latitude: lat,
        longitude: lon,
        placename: session.placename,
        contactno: session.contactno || "",
        contactName: session.contactName || "", // NEW
        accuracy: geoData ? 20 : 0,
        timestamp: new Date(),
        needs: session.needs,
        numberOfPeople: session.numberOfPeople || 1,
        urgencyLevel: session.urgencyLevel || "MEDIUM",
        additionalNotes: session.additionalNotes || "",
        status: "pending",
        isVerified: session.isVerified || false,
        imageVerification: session.imageVerification || "",
        messengerUserId: senderId,
        dataQualityIssues: geoData ? "OK" : "BOT_SUBMISSION",
      });

      console.log("✅ Emergency saved:", newEmergency.id);
      return newEmergency;
    } catch (error) {
      console.error("❌ Error saving emergency from bot:", error);
      throw error;
    }
  }

  /**
   * Update emergency status
   */
  async updateEmergencyStatus(
    emergencyId: string,
    status: "pending" | "in-progress" | "responded"
  ): Promise<any> {
    try {
      const emergency = await Emergency.findOneAndUpdate(
        { id: emergencyId },
        { status, updatedAt: new Date() },
        { new: true }
      );

      return emergency;
    } catch (error) {
      console.error("❌ Error updating emergency status:", error);
      throw error;
    }
  }

  /**
   * Get emergency by ID
   */
  async getEmergency(emergencyId: string): Promise<any> {
    try {
      return await Emergency.findOne({ id: emergencyId });
    } catch (error) {
      console.error("❌ Error fetching emergency:", error);
      throw error;
    }
  }
}

// Singleton instance
export const botEmergencyService = new BotEmergencyService();