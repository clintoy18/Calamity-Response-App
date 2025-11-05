import axios from "axios";
import { botConfig } from "../config/bot.config";
import { FBMessage } from "../types/bot.types";

class MessengerService {
  private readonly baseUrl: string;
  private readonly accessToken: string;

  constructor() {
    this.baseUrl = `${botConfig.baseUrl}/${botConfig.apiVersion}`;
    this.accessToken = botConfig.pageAccessToken!;
  }

  /**
   * Send a message to a user
   */
  async sendMessage(senderId: string, message: FBMessage): Promise<void> {
    try {
      
      await axios.post(
        `${this.baseUrl}/me/messages`,
        {
          recipient: { id: senderId },
          message,
          messaging_type: "RESPONSE",
        },
        {
          params: { access_token: this.accessToken },
        }
      );

    } catch (err: any) {
      console.error(
        "❌ Failed to send message:",
        err.response?.data || err.message
      );
      throw err;
    }
  }

  /**
   * Send a typing indicator
   */
  async sendTypingIndicator(senderId: string, isTyping: boolean = true): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/me/messages`,
        {
          recipient: { id: senderId },
          sender_action: isTyping ? "typing_on" : "typing_off",
        },
        {
          params: { access_token: this.accessToken },
        }
      );
    } catch (err: any) {
      console.error("❌ Failed to send typing indicator:", err.message);
    }
  }

  /**
   * Mark message as read
   */
  async markSeen(senderId: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/me/messages`,
        {
          recipient: { id: senderId },
          sender_action: "mark_seen",
        },
        {
          params: { access_token: this.accessToken },
        }
      );
    } catch (err: any) {
      console.error("❌ Failed to mark as seen:", err.message);
    }
  }

  /**
   * Set the Get Started button
   */
  async setGetStartedButton(): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/me/messenger_profile`,
        {
          get_started: { payload: "GET_STARTED" },
        },
        {
          params: { access_token: this.accessToken },
        }
      );

    } catch (err: any) {
      console.error(
        "❌ Failed to set Get Started button:",
        err.response?.data || err.message
      );
    }
  }

  /**
   * Set greeting text
   */
  async setGreeting(text: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/me/messenger_profile`,
        {
          greeting: [
            {
              locale: "default",
              text,
            },
          ],
        },
        {
          params: { access_token: this.accessToken },
        }
      );

    } catch (err: any) {
      console.error("❌ Failed to set greeting:", err.message);
    }
  }

  /**
   * Get user profile information
   */
  async getUserProfile(userId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/${userId}`, {
        params: {
          fields: "first_name,last_name,profile_pic",
          access_token: this.accessToken,
        },
      });

      return response.data;
    } catch (err: any) {
      console.error("❌ Failed to get user profile:", err.message);
      return null;
    }
  }
}

// Singleton instance
export const messengerService = new MessengerService();