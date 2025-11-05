import { config } from "dotenv";
config();

export const botConfig = {
  verifyToken: process.env.FB_VERIFY_TOKEN,
  pageAccessToken: process.env.FB_PAGE_ACCESS_TOKEN,
  webhookSecret: process.env.FB_WEBHOOK_SECRET,
  apiVersion: "v21.0",
  baseUrl: "https://graph.facebook.com",
};

// Validate required bot configuration
export const validateBotConfig = (): void => {
  if (!botConfig.pageAccessToken) {
    throw new Error("❌ FB_PAGE_ACCESS_TOKEN environment variable is required!");
  }
};