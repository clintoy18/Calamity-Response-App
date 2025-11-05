import { FBMessage, FBQuickReply } from "../types/bot.types";

export const MESSAGES = {
  WELCOME: {
    text: "Hi there! I'm Aidvocate, here to help you during emergencies. Are you currently in a situation where you need assistance?",
    quick_replies: [
      { content_type: "text", title: "Yes, I need help", payload: "HELP_YES" } as const,
      { content_type: "text", title: "No, I'm safe", payload: "HELP_NO" } as const,
    ] as const,
  } as FBMessage,

  HELP_YES: {
    text: "Thank you for letting me know. I'm here to assist you step by step. First, may I know your name?",
  } as FBMessage,

  HELP_NO: {
    text: "I'm glad you're safe! Remember, I'm always here if you ever need help. Just type 'help' anytime.\n\nYou can also type 'status' to check on any previous reports.",
  } as FBMessage,

  LOCATION_PROMPT: {
    text: "Thank you! Now, can you tell me your current location or the place where you need assistance?",
  } as FBMessage,

  CONTACT_PROMPT: {
    text: "Could you please share a contact number? This will help our team reach you quickly if needed.",
  } as FBMessage,

  URGENCY_LEVEL: {
    text: "How urgent is your situation? This helps us prioritize assistance for you.",
    quick_replies: [
      { content_type: "text", title: "LOW – Non-urgent help", payload: "URGENCY_LOW" } as const,
      { content_type: "text", title: "MEDIUM – Need help soon", payload: "URGENCY_MEDIUM" } as const,
      { content_type: "text", title: "HIGH – Immediate help needed", payload: "URGENCY_HIGH" } as const,
      { content_type: "text", title: "CRITICAL – Life threatening", payload: "URGENCY_CRITICAL" } as const,
    ] as const,
  } as FBMessage,

  PEOPLE_COUNT: {
    text: "How many people are with you that need assistance? No worries if it's just you.",
  } as FBMessage,

  NEEDS_PROMPT: {
    text: "What type of help do you need? You can list as many as necessary. Examples: Food, Water, Medical, Shelter, Rescue, First Aid, Clothing, Other.",
  } as FBMessage,

  ADDITIONAL_NOTES: {
    text: "Any additional information you'd like to share? It helps us respond more effectively.",
  } as FBMessage,

  IMAGE_VERIFICATION: {
    text: "If possible, please send a photo of your current situation. This helps us prioritize and respond faster.\n\nType 'skip' if you can't provide a photo right now.",
  } as FBMessage,

  SUBMISSION_COMPLETE: {
    text: "✅ Thank you! Your report has been submitted successfully.\n\n" +
          "📋 Reference: Your report is now in our system\n" +
          "⏳ Next: Our team will review and verify your report\n" +
          "🔔 Updates: You'll receive notifications when your status changes\n\n" +
          "Please stay safe! 🙏",
  } as FBMessage,

  STATUS_CHECK_INFO: {
    text: "💡 *Tip:* You can check your report status anytime by typing:\n" +
          "• 'status'\n" +
          "• 'check'\n" +
          "• 'my status'\n\n" +
          "We'll also notify you automatically when your report is verified or when responders are on the way!",
  } as FBMessage,

  ERROR_GENERIC: {
    text: "Sorry, something went wrong. Please try again or type 'help' to start over.",
  } as FBMessage,

  INVALID_NUMBER: {
    text: "Please enter a valid number of people.",
  } as FBMessage,

  COOLDOWN_ACTIVE: (remainingTime: string) => ({
    text: `Thank you for your concern! However, you've already submitted a report recently. To prevent duplicate submissions, you can submit again in ${remainingTime}.\n\n` +
          `📋 Want to check your current report status? Just type 'status'!\n\n` +
          `🚨 If this is a NEW emergency, please call local emergency services immediately at 911 or your local emergency hotline.`,
  } as FBMessage),
} as const;

/**
 * Create a custom message
 */
export function createMessage(text: string, quickReplies?: readonly FBQuickReply[]): FBMessage {
  return {
    text,
    ...(quickReplies && { quick_replies: quickReplies }),
  };
}

/**
 * Create a typing delay message
 */
export function createDelayedMessage(message: FBMessage, delayMs: number = 1000): Promise<FBMessage> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(message), delayMs);
  });
}