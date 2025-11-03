import { UserSession, ConversationStep } from "../types/bot.types";

class SessionManager {
  private sessions: Map<string, UserSession>;
  private cooldowns: Map<string, Date>;

  constructor() {
    this.sessions = new Map();
    this.cooldowns = new Map();
  }

  /**
   * Check if user is in cooldown period (24 hours after last submission)
   */
  isInCooldown(senderId: string): boolean {
    const lastSubmission = this.cooldowns.get(senderId);
    if (!lastSubmission) return false;

    const now = Date.now();
    const cooldownPeriod = 24 * 60 * 60 * 1000; // 24 hours in ms
    const timeSinceSubmission = now - lastSubmission.getTime();

    return timeSinceSubmission < cooldownPeriod;
  }

  /**
   * Get remaining cooldown time in hours and minutes
   */
  getRemainingCooldown(senderId: string): string {
    const lastSubmission = this.cooldowns.get(senderId);
    if (!lastSubmission) return "0 hours";

    const now = Date.now();
    const cooldownPeriod = 24 * 60 * 60 * 1000;
    const timeSinceSubmission = now - lastSubmission.getTime();
    const remaining = cooldownPeriod - timeSinceSubmission;

    if (remaining <= 0) return "0 hours";

    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

    return `${hours} hour${hours !== 1 ? 's' : ''} and ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }

  /**
   * Set cooldown after successful submission
   */
  setCooldown(senderId: string): void {
    this.cooldowns.set(senderId, new Date());
    console.log(`⏱️ Cooldown set for user ${senderId}`);
  }

  /**
   * Initialize a new session for a user
   */
  initializeSession(senderId: string): UserSession {
    const session: UserSession = {
      needs: [],
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
      isVerified: false,
      currentStep: "name", // NEW: Start with name
    };
    
    this.sessions.set(senderId, session);
    return session;
  }

  /**
   * Get an existing session or create a new one
   */
  getSession(senderId: string): UserSession {
    return this.sessions.get(senderId) || this.initializeSession(senderId);
  }

  /**
   * Update an existing session
   */
  updateSession(senderId: string, updates: Partial<UserSession>): UserSession {
    const session = this.getSession(senderId);
    const updatedSession = { 
      ...session, 
      ...updates, 
      updatedAt: new Date() 
    };
    
    this.sessions.set(senderId, updatedSession);
    
    return updatedSession;
  }

  /**
   * Check if a session exists
   */
  hasSession(senderId: string): boolean {
    return this.sessions.has(senderId);
  }

  /**
   * Delete a session
   */
  deleteSession(senderId: string): boolean {
    return this.sessions.delete(senderId);
  }

  /**
   * Get all sessions (for admin/debugging)
   */
  getAllSessions(): Record<string, UserSession> {
    return Object.fromEntries(this.sessions);
  }

  /**
   * Clean up old sessions (older than 24 hours)
   */
  cleanupOldSessions(): number {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    let cleaned = 0;

    for (const [senderId, session] of this.sessions.entries()) {
      if (now - session.createdAt.getTime() > oneDayMs) {
        this.sessions.delete(senderId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} old sessions`);
    }

    return cleaned;
  }

  /**
   * Clean up expired cooldowns (older than 24 hours)
   */
  cleanupExpiredCooldowns(): number {
    const now = Date.now();
    const cooldownPeriod = 24 * 60 * 60 * 1000;
    let cleaned = 0;

    for (const [senderId, lastSubmission] of this.cooldowns.entries()) {
      if (now - lastSubmission.getTime() > cooldownPeriod) {
        this.cooldowns.delete(senderId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired cooldowns`);
    }

    return cleaned;
  }
}

// Singleton instance
export const sessionManager = new SessionManager();

// Run cleanup every hour
setInterval(() => {
  sessionManager.cleanupOldSessions();
  sessionManager.cleanupExpiredCooldowns();
}, 60 * 60 * 1000);