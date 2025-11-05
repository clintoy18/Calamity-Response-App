import Emergency from "../models/Emergency";
import { messengerService } from "./messenger.service";

class BotNotificationService {
  /**
   * Send verification notification to user
   */
  async notifyVerified(emergencyId: string): Promise<void> {
    try {
      const emergency = await Emergency.findOne({ id: emergencyId });
      
      if (!emergency || !emergency.messengerUserId) {
        console.log("⚠️ Cannot notify - no messenger user ID");
        return;
      }

      // Check if already notified (simple check using lastNotifiedStatus)
      if (emergency.lastNotifiedStatus === "verified") {
        console.log("ℹ️ Verification notification already sent");
        return;
      }

      const message = {
        text: `✅ *Your emergency report has been VERIFIED!*\n\n` +
              `👤 Contact: ${emergency.contactName || "Not provided"}\n` +
              `📍 Location: ${emergency.placename}\n` +
              `🆘 Status: ${this.formatStatus(emergency.status)}\n` +
              `👥 People: ${emergency.numberOfPeople}\n` +
              `⚡ Urgency: ${emergency.urgencyLevel}\n\n` +
              `Our response team has confirmed your report. Help is being coordinated. ` +
              `You can check your status anytime by typing "status" or "check".\n\n` +
              `Stay safe! 🙏`,
      };

      await messengerService.sendMessage(emergency.messengerUserId, message);

      // Mark as notified
      emergency.lastNotifiedStatus = "verified";
      await emergency.save();

      console.log(`✅ Verification notification sent to ${emergency.messengerUserId}`);
    } catch (error) {
      console.error("❌ Error sending verification notification:", error);
    }
  }

  /**
   * Send status update notification (in-progress)
   */
  async notifyInProgress(emergencyId: string): Promise<void> {
    try {
      const emergency = await Emergency.findOne({ id: emergencyId });
      
      if (!emergency || !emergency.messengerUserId) return;

      if (emergency.lastNotifiedStatus === "in-progress") {
        console.log("ℹ️ In-progress notification already sent");
        return;
      }

      const message = {
        text: `🚨 *UPDATE: Responders are on their way!*\n\n` +
              `👤 Contact: ${emergency.contactName || "Not provided"}\n` +
              `📍 Location: ${emergency.placename}\n` +
              `⏱️ Status: IN PROGRESS\n\n` +
              `Emergency responders have been dispatched to your location. ` +
              `Please stay where you are if it's safe to do so.\n\n` +
              `If your situation changes, type "update" to send new information.\n\n` +
              `Hang tight - help is coming! 💪`,
      };

      await messengerService.sendMessage(emergency.messengerUserId, message);

      emergency.lastNotifiedStatus = "in-progress";
      await emergency.save();

      console.log(`🚨 In-progress notification sent to ${emergency.messengerUserId}`);
    } catch (error) {
      console.error("❌ Error sending in-progress notification:", error);
    }
  }

  /**
   * Send response completion notification
   */
  async notifyResponded(emergencyId: string): Promise<void> {
    try {
      const emergency = await Emergency.findOne({ id: emergencyId });
      
      if (!emergency || !emergency.messengerUserId) return;

      if (emergency.lastNotifiedStatus === "responded") {
        console.log("ℹ️ Response notification already sent");
        return;
      }

      const message = {
        text: `✅ *Your emergency has been RESPONDED to!*\n\n` +
              `👤 Contact: ${emergency.contactName || "Not provided"}\n` +
              `📍 Location: ${emergency.placename}\n` +
              `✔️ Status: COMPLETED\n\n` +
              `Our responders have reached your location and provided assistance. ` +
              `We hope you're safe now.\n\n` +
              `If you need further assistance, feel free to reach out. ` +
              `We're here to help! 🙏\n\n` +
              `Take care and stay safe! ❤️`,
      };

      await messengerService.sendMessage(emergency.messengerUserId, message);

      emergency.lastNotifiedStatus = "responded";
      await emergency.save();

      console.log(`✅ Response notification sent to ${emergency.messengerUserId}`);
    } catch (error) {
      console.error("❌ Error sending response notification:", error);
    }
  }

  /**
   * Format status for display
   */
  private formatStatus(status: string): string {
    const statusMap: Record<string, string> = {
      pending: "⏳ Pending Review",
      "in-progress": "🚨 Responders Dispatched",
      responded: "✅ Completed",
    };
    return statusMap[status] || status;
  }

  /**
   * Get user's emergency status
   */
  async getUserEmergencyStatus(messengerUserId: string): Promise<string> {
    try {
      // Get the most recent emergency for this user
      const emergency = await Emergency.findOne({ 
        messengerUserId 
      }).sort({ createdAt: -1 });

      if (!emergency) {
        return `📋 *No Emergency Reports Found*\n\n` +
               `You haven't submitted any emergency reports yet. ` +
               `If you need help, click "Get Started" to create a new report.`;
      }

      const timeSinceSubmission = this.getTimeSince(emergency.createdAt);
      const verificationStatus = emergency.isVerified ? "✅ Verified" : "⏳ Pending Verification";

      let statusMessage = `📋 *Your Emergency Report Status*\n\n` +
                         `👤 Name: ${emergency.contactName || "Not provided"}\n` +
                         `📍 Location: ${emergency.placename}\n` +
                         `🆘 Status: ${this.formatStatus(emergency.status)}\n` +
                         `✓ Verification: ${verificationStatus}\n` +
                         `⚡ Urgency: ${emergency.urgencyLevel}\n` +
                         `👥 People Affected: ${emergency.numberOfPeople}\n` +
                         `🕒 Submitted: ${timeSinceSubmission} ago\n\n`;

      // Add status-specific information
      if (!emergency.isVerified) {
        statusMessage += `⏳ Your report is being reviewed by our team. ` +
                        `You'll be notified once it's verified.\n\n`;
      } else if (emergency.status === "pending") {
        statusMessage += `✅ Your report has been verified. ` +
                        `Response teams are being coordinated.\n\n`;
      } else if (emergency.status === "in-progress") {
        statusMessage += `🚨 Responders are on their way! ` +
                        `Please stay safe and wait for assistance.\n\n`;
      } else if (emergency.status === "responded") {
        statusMessage += `✅ Your emergency has been addressed. ` +
                        `We hope you're safe now!\n\n`;
      }

      statusMessage += `Type "help" if you need to submit a new report.`;

      return statusMessage;
    } catch (error) {
      console.error("❌ Error getting emergency status:", error);
      return `❌ Sorry, I couldn't retrieve your status. Please try again later.`;
    }
  }

  /**
   * Get human-readable time since date
   */
  private getTimeSince(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''}`;
    
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''}`;
  }
}

// Singleton instance
export const botNotificationService = new BotNotificationService();