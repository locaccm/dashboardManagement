/* eslint-disable jsdoc/check-tag-names */
import { Router } from "express";
import {
  getAllProfiles,
  getProfileById,
} from "../controllers/profileController";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Profiles
 *   description: User profile management
 */

/**
 * @swagger
 * /profiles:
 *   get:
 *     summary: Get all profiles
 *     tags: [Profiles]
 *     responses:
 *       200:
 *         description: Profiles fetched successfully
 *       500:
 *         description: Failed to fetch profiles
 */
router.get("/", getAllProfiles);

/**
 * @swagger
 * /profiles/{id}:
 *   get:
 *     summary: Get profile by ID
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *       500:
 *         description: Failed to fetch profile
 */
router.get("/:id", getProfileById);

export default router;
