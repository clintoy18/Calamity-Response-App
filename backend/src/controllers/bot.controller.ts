import { Request, Response } from "express";
import { botConfig } from "../config/bot.config";
import { WebhookBody, MessagingEvent } from "../types/bot.types";
import { conversationHandler } from "../services/conversation.service";
import { messengerService } from "../services/messenger.service";

export class BotController {
  /**
   * Verify webhook (GET request from Facebook)
   */
  async verifyWebhook(req: Request, res: Response): Promise<void> {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];


    if (mode === "subscribe" && token === botConfig.verifyToken) {
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }

  /**
   * Handle incoming webhook events (POST request from Facebook)
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    const body: WebhookBody = req.body;
    // Verify this is a page subscription
    if (body.object !== "page") {
      res.sendStatus(404);
      return;
    }

    try {
      // Process all entries
      await Promise.all(
        body.entry.map(async (entry) => {
          if (!entry.messaging) return;

          // Process all messaging events
          await Promise.all(
            entry.messaging.map(async (event: MessagingEvent) => {
              await this.processMessagingEvent(event);
            })
          );
        })
      );

      // Always respond with 200 OK
      res.status(200).send("EVENT_RECEIVED");
    } catch (error) {
      console.error("❌ Error processing webhook:", error);
      res.status(200).send("EVENT_RECEIVED"); // Still send 200 to prevent retries
    }
  }

  /**
   * Process individual messaging event
   */
  private async processMessagingEvent(event: MessagingEvent): Promise<void> {
    const senderId = event.sender?.id;

    if (!senderId) {
      return;
    }

    try {
      // Mark message as seen
      await messengerService.markSeen(senderId);

      // Handle postback (e.g., Get Started button)
      if (event.postback?.payload) {
        await conversationHandler.handlePostback(senderId, event.postback.payload);
        return;
      }

      // Handle quick reply
      if (event.message?.quick_reply?.payload) {
        await conversationHandler.handleQuickReply(
          senderId,
          event.message.quick_reply.payload
        );
        return;
      }

      // Handle image attachment
      if (event.message?.attachments) {
        const imageAttachment = event.message.attachments.find(
          (att) => att.type === "image"
        );
        
        if (imageAttachment) {
          await conversationHandler.handleImageAttachment(
            senderId,
            imageAttachment.payload.url
          );
          return;
        }
      }

      // Handle text message
      if (event.message?.text && !event.message.quick_reply) {
        await conversationHandler.handleTextMessage(senderId, event.message.text);
        return;
      }
    } catch (error) {
      console.error(`❌ Error processing event for ${senderId}:`, error);
    }
  }

  /**
   * Initialize bot settings (call on server startup)
   */
  async initializeBot(): Promise<void> {
    try {
      await messengerService.setGetStartedButton();
      await messengerService.setGreeting(
        "Welcome to Aidvocate Emergency Response Bot! Click 'Get Started' to report an emergency."
      );

    } catch (error) {
      console.error("❌ Error initializing bot:", error);
    }
  }
}

// Singleton instance
export const botController = new BotController();