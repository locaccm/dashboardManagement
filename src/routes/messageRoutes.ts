/* eslint-disable jsdoc/check-tag-names */
import { Router } from "express";
import { getMessages, sendMessage } from "../controllers/messageController";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Gestion des messages entre utilisateurs
 */

router.get("/", getMessages);
router.post("/", sendMessage);

export default router;
