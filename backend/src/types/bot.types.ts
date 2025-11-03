export type UrgencyLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type SessionStatus = "pending" | "in-progress" | "responded";
export type ConversationStep = 
  | "name" // NEW: Added name step
  | "location" 
  | "contact" 
  | "urgency" 
  | "people" 
  | "needs" 
  | "notes" 
  | "image" 
  | "complete";

export interface UserSession {
  contactName?: string; // NEW
  placename?: string;
  contactno?: string;
  needs: string[];
  numberOfPeople?: number;
  urgencyLevel?: UrgencyLevel;
  additionalNotes?: string;
  status: SessionStatus;
  createdAt: Date;
  updatedAt: Date;
  isVerified: boolean;
  imageVerification?: string;
  currentStep: ConversationStep;
}

export interface FBQuickReply {
  content_type: "text";
  title: string;
  payload: string;
}

export interface FBMessage {
  text: string;
  quick_replies?: readonly FBQuickReply[];
}

export interface MessagingEvent {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: {
    mid: string;
    text?: string;
    quick_reply?: { payload: string };
    attachments?: Array<{
      type: string;
      payload: { url: string };
    }>;
  };
  postback?: {
    payload: string;
  };
}

export interface WebhookBody {
  object: string;
  entry: Array<{
    id: string;
    time: number;
    messaging: MessagingEvent[];
  }>;
}