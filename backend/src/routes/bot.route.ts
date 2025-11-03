import { Router } from "express";
import { botController } from "../controllers/bot.controller";
import { sessionManager } from "../services/session.service";

const router = Router();

/**
 * GET /webhook - Verify webhook with Facebook
 */
router.get("/webhook", (req, res) => {
  botController.verifyWebhook(req, res);
});

/**
 * POST /webhook - Handle incoming messages from Facebook
 */
router.post("/webhook", (req, res) => {
  botController.handleWebhook(req, res);
});

/**
 * GET /sessions - Get all active sessions (for debugging/admin)
 */
router.get("/sessions", (req, res) => {
  const sessions = sessionManager.getAllSessions();
  res.json({
    success: true,
    count: Object.keys(sessions).length,
    sessions,
  });
});

/**
 * POST /sessions/cleanup - Manually trigger session cleanup
 */
router.post("/sessions/cleanup", (req, res) => {
  const cleaned = sessionManager.cleanupOldSessions();
  res.json({
    success: true,
    message: `Cleaned up ${cleaned} old sessions`,
  });
});

/**
 * GET /health - Bot health check
 */
router.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "operational",
    service: "Aidvocate Emergency Response Bot",
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /cooldowns - Get all active cooldowns (for debugging/admin)
 */
router.get("/cooldowns", (req, res) => {
  const cooldowns: Record<string, { lastSubmission: string; remainingTime: string }> = {};
  
  // Access private cooldowns map via a new public method
  // You'd need to add this method to SessionManager
  
  res.json({
    success: true,
    count: Object.keys(cooldowns).length,
    cooldowns,
  });
});

export default router;