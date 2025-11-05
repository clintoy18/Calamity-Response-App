import { sessionManager } from "../services/session.service";
import { messengerService } from "../services/messenger.service";
import { MESSAGES } from "../services/messages.service";
import { botEmergencyService } from "../services/bot-emergency.service";
import { botNotificationService } from "../services/bot-notification.service";
import {
  validateName,
  validateLocation,
  validateContactNumber,
  validatePeopleCount,
  validateNeeds,
  validateNotes,
  checkSuspiciousSubmission,
} from "../utils/validation.utils";

export class ConversationHandler {
  /**
   * Handle postback events (e.g., Get Started button)
   */
  async handlePostback(senderId: string, payload: string): Promise<void> {
    if (payload === "GET_STARTED") {
      // Check cooldown before allowing new submission
      if (sessionManager.isInCooldown(senderId)) {
        const remainingTime = sessionManager.getRemainingCooldown(senderId);
        await messengerService.sendMessage(
          senderId,
          MESSAGES.COOLDOWN_ACTIVE(remainingTime)
        );
        return;
      }

      await this.sendWelcomeMessage(senderId);
    }
  }

  /**
   * Handle quick reply selections
   */
  async handleQuickReply(senderId: string, payload: string): Promise<void> {
    // Check cooldown for HELP_YES
    if (payload === "HELP_YES") {
      if (sessionManager.isInCooldown(senderId)) {
        const remainingTime = sessionManager.getRemainingCooldown(senderId);
        await messengerService.sendMessage(
          senderId,
          MESSAGES.COOLDOWN_ACTIVE(remainingTime)
        );
        return;
      }
    }

    switch (payload) {
      case "HELP_YES":
        sessionManager.updateSession(senderId, { currentStep: "name" });
        await messengerService.sendMessage(senderId, MESSAGES.HELP_YES);
        break;

      case "HELP_NO":
        await messengerService.sendMessage(senderId, MESSAGES.HELP_NO);
        sessionManager.deleteSession(senderId);
        break;

      case "URGENCY_LOW":
      case "URGENCY_MEDIUM":
      case "URGENCY_HIGH":
      case "URGENCY_CRITICAL":
        const urgencyLevel = payload.replace("URGENCY_", "") as any;
        sessionManager.updateSession(senderId, {
          urgencyLevel,
          currentStep: "people",
        });
        await messengerService.sendMessage(senderId, MESSAGES.PEOPLE_COUNT);
        break;

      default:
    }
  }

  /**
   * Handle text messages based on current conversation step
   */
  async handleTextMessage(senderId: string, text: string): Promise<void> {
    const session = sessionManager.getSession(senderId);
    const lowerText = text.toLowerCase().trim();

    // Show typing indicator
    await messengerService.sendTypingIndicator(senderId, true);

    try {
      // Check for status check keywords
      if (
        lowerText === "status" ||
        lowerText === "check" ||
        lowerText === "check status" ||
        lowerText === "my status" ||
        lowerText === "update"
      ) {
        await this.handleStatusCheck(senderId);
        await messengerService.sendTypingIndicator(senderId, false);
        return;
      }

      // Check for help keywords
      if (lowerText === "help" || lowerText === "start" || lowerText === "restart") {
        if (sessionManager.isInCooldown(senderId)) {
          const remainingTime = sessionManager.getRemainingCooldown(senderId);
          await messengerService.sendMessage(
            senderId,
            MESSAGES.COOLDOWN_ACTIVE(remainingTime)
          );
        } else {
          await this.sendWelcomeMessage(senderId);
        }
        await messengerService.sendTypingIndicator(senderId, false);
        return;
      }

      switch (session.currentStep) {
        case "name":
          await this.handleNameInput(senderId, text);
          break;

        case "location":
          await this.handleLocationInput(senderId, text);
          break;

        case "contact":
          await this.handleContactInput(senderId, text);
          break;

        case "people":
          await this.handlePeopleCountInput(senderId, text);
          break;

        case "needs":
          await this.handleNeedsInput(senderId, text);
          break;

        case "notes":
          await this.handleNotesInput(senderId, text);
          break;

        case "image":
          await this.handleImageSkip(senderId, text);
          break;

        case "complete":
          // User trying to interact after completion
          if (sessionManager.isInCooldown(senderId)) {
            const remainingTime = sessionManager.getRemainingCooldown(senderId);
            await messengerService.sendMessage(
              senderId,
              MESSAGES.COOLDOWN_ACTIVE(remainingTime)
            );
          } else {
            await this.sendWelcomeMessage(senderId);
          }
          break;

        default:
          await this.sendWelcomeMessage(senderId);
      }
    } catch (error) {
      console.error("❌ Error handling text message:", error);
      await messengerService.sendMessage(senderId, MESSAGES.ERROR_GENERIC);
    } finally {
      await messengerService.sendTypingIndicator(senderId, false);
    }
  }

  /**
   * Handle status check request
   */
  private async handleStatusCheck(senderId: string): Promise<void> {
    try {
      const statusMessage = await botNotificationService.getUserEmergencyStatus(senderId);
      await messengerService.sendMessage(senderId, { text: statusMessage });
    } catch (error) {
      console.error("❌ Error handling status check:", error);
      await messengerService.sendMessage(senderId, MESSAGES.ERROR_GENERIC);
    }
  }

  /**
   * Handle image attachments
   */
  async handleImageAttachment(senderId: string, imageUrl: string): Promise<void> {
    const session = sessionManager.getSession(senderId);

    if (session.currentStep === "image") {
      sessionManager.updateSession(senderId, {
        imageVerification: imageUrl,
        currentStep: "complete",
      });

      await this.completeSubmission(senderId);
    } else {
      await messengerService.sendMessage(senderId, {
        text: "Please follow the conversation flow. I'll ask for a photo when needed.",
      });
    }
  }

  /**
   * Send welcome message with quick replies
   */
  private async sendWelcomeMessage(senderId: string): Promise<void> {
    sessionManager.initializeSession(senderId);
    await messengerService.sendMessage(senderId, MESSAGES.WELCOME);
  }

  /**
   * Handle name input with validation
   */
  private async handleNameInput(senderId: string, text: string): Promise<void> {
    const validation = validateName(text);

    if (!validation.valid) {
      await messengerService.sendMessage(senderId, {
        text: `❌ ${validation.error}\n\nPlease try again:`,
      });
      return;
    }

    sessionManager.updateSession(senderId, {
      contactName: text.trim(),
      currentStep: "location",
    });
    await messengerService.sendMessage(senderId, MESSAGES.LOCATION_PROMPT);
  }

  /**
   * Handle location input with validation
   */
  private async handleLocationInput(senderId: string, text: string): Promise<void> {
    const validation = validateLocation(text);

    if (!validation.valid) {
      await messengerService.sendMessage(senderId, {
        text: `❌ ${validation.error}\n\nPlease provide your actual location:`,
      });
      return;
    }

    sessionManager.updateSession(senderId, {
      placename: text.trim(),
      currentStep: "contact",
    });
    await messengerService.sendMessage(senderId, MESSAGES.CONTACT_PROMPT);
  }

  /**
   * Handle contact number input with validation
   */
  private async handleContactInput(senderId: string, text: string): Promise<void> {
    const validation = validateContactNumber(text);

    if (!validation.valid) {
      await messengerService.sendMessage(senderId, {
        text: `❌ ${validation.error}\n\nPlease try again:`,
      });
      return;
    }

    sessionManager.updateSession(senderId, {
      contactno: text.trim(),
      currentStep: "urgency",
    });
    await messengerService.sendMessage(senderId, MESSAGES.URGENCY_LEVEL);
  }

  /**
   * Handle people count input with validation
   */
  private async handlePeopleCountInput(senderId: string, text: string): Promise<void> {
    const validation = validatePeopleCount(text);

    if (!validation.valid) {
      await messengerService.sendMessage(senderId, {
        text: `❌ ${validation.error}\n\nPlease enter a valid number:`,
      });
      return;
    }

    sessionManager.updateSession(senderId, {
      numberOfPeople: validation.value,
      currentStep: "needs",
    });
    await messengerService.sendMessage(senderId, MESSAGES.NEEDS_PROMPT);
  }

  /**
   * Handle needs input with validation
   */
  private async handleNeedsInput(senderId: string, text: string): Promise<void> {
    const validation = validateNeeds(text);

    if (!validation.valid) {
      await messengerService.sendMessage(senderId, {
        text: `❌ ${validation.error}\n\nPlease try again:`,
      });
      return;
    }

    sessionManager.updateSession(senderId, {
      needs: validation.needs,
      currentStep: "notes",
    });
    await messengerService.sendMessage(senderId, MESSAGES.ADDITIONAL_NOTES);
  }

  /**
   * Handle additional notes input with validation
   */
  private async handleNotesInput(senderId: string, text: string): Promise<void> {
    const validation = validateNotes(text);

    if (!validation.valid) {
      await messengerService.sendMessage(senderId, {
        text: `❌ ${validation.error}\n\nPlease try again or type 'none':`,
      });
      return;
    }

    sessionManager.updateSession(senderId, {
      additionalNotes: text.trim() || "None",
      currentStep: "image",
    });
    await messengerService.sendMessage(senderId, MESSAGES.IMAGE_VERIFICATION);
  }

  /**
   * Handle when user skips image
   */
  private async handleImageSkip(senderId: string, text: string): Promise<void> {
    if (text.toLowerCase().includes("skip") || text.toLowerCase().includes("no") || text.toLowerCase().includes("none")) {
      sessionManager.updateSession(senderId, {
        currentStep: "complete",
      });
      await this.completeSubmission(senderId);
    } else {
      await messengerService.sendMessage(senderId, {
        text: "Please send a photo or type 'skip' to continue without one.",
      });
    }
  }

  /**
   * Complete the submission and save to database
   */
  private async completeSubmission(senderId: string): Promise<void> {
    const session = sessionManager.getSession(senderId);

    try {
      // Final validation - check if submission looks suspicious
      const suspiciousCheck = checkSuspiciousSubmission(session);

      if (suspiciousCheck.suspicious) {
        console.warn(`⚠️ Suspicious submission detected for ${senderId}:`, suspiciousCheck.reasons);
        
        await messengerService.sendMessage(senderId, {
          text: `⚠️ *Important Notice*\n\n` +
                `Our system detected that some of your information may not be accurate. ` +
                `Please remember that this is an emergency response system.\n\n` +
                `Providing false information:\n` +
                `• Delays help for people in real emergencies\n` +
                `• Wastes valuable emergency response resources\n` +
                `• May have legal consequences\n\n` +
                `If you're testing the system, please don't submit false reports. ` +
                `If you genuinely need help, please restart and provide accurate information by typing 'help'.\n\n` +
                `Thank you for understanding. 🙏`,
        });

        // Don't save suspicious submissions
        sessionManager.deleteSession(senderId);
        return;
      }

      // Save to database
      const emergency = await botEmergencyService.saveEmergencyFromBot(
        senderId,
        session
      );

      await messengerService.sendMessage(senderId, MESSAGES.SUBMISSION_COMPLETE);
      
      // Send follow-up message about status checking
      await messengerService.sendMessage(senderId, MESSAGES.STATUS_CHECK_INFO);

      // Set cooldown after successful submission
      sessionManager.setCooldown(senderId);

      // Clean up session
      sessionManager.deleteSession(senderId);

      console.log(`✅ Emergency submitted: ${emergency.id}`);
    } catch (error) {
      console.error("❌ Error completing submission:", error);
      await messengerService.sendMessage(senderId, MESSAGES.ERROR_GENERIC);
    }
  }
}

// Singleton instance
export const conversationHandler = new ConversationHandler();