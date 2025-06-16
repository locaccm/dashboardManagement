/* eslint-disable jsdoc/check-tag-names */
import { Router } from "express";
import { getMessages, sendMessage } from "../controllers/messageController";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Managing messages between users
 */

router.get("/", getMessages);
router.post("/", sendMessage);

export default router;
