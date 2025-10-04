import express from "express";

import {
  approveResponder,
  fetchResponders,
} from "../controllers/admin.controller";

const router = express.Router();

router.put("/approve/:userId", approveResponder);
router.get("/", fetchResponders);


export default router;
