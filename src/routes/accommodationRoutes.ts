import { Router } from 'express';
import * as accommodationController from '../controllers/accommodationController';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Accommodations
 *   description: API for managing accommodations
 */

/**
 * @swagger
 * /accommodations:
 *   get:
 *     summary: Get accommodations for a user
 *     tags: [Accommodations]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: List of accommodations
 *       400:
 *         description: userId is required
 */
router.get('/', accommodationController.getAccommodations);

/**
 * @swagger
 * /accommodations:
 *   post:
 *     summary: Create a new accommodation
 *     tags: [Accommodations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ACCC_NAME
 *               - ACCC_TYPE
 *               - ACCC_ADDRESS
 *               - ACCC_DESC
 *               - USEN_ID
 *             properties:
 *               ACCC_NAME:
 *                 type: string
 *               ACCC_TYPE:
 *                 type: string
 *               ACCC_ADDRESS:
 *                 type: string
 *               ACCC_DESC:
 *                 type: string
 *               USEN_ID:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Accommodation created
 *       400:
 *         description: Missing fields
 */
router.post('/', accommodationController.createAccommodation);

/**
 * @swagger
 * /accommodations/{id}:
 *   put:
 *     summary: Update an accommodation
 *     tags: [Accommodations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ACCC_NAME:
 *                 type: string
 *               ACCC_TYPE:
 *                 type: string
 *               ACCC_ADDRESS:
 *                 type: string
 *               ACCC_DESC:
 *                 type: string
 *     responses:
 *       200:
 *         description: Accommodation updated
 *       404:
 *         description: Not found
 */
router.put('/:id', accommodationController.updateAccommodation);

/**
 * @swagger
 * /accommodations/{id}:
 *   delete:
 *     summary: Delete an accommodation
 *     tags: [Accommodations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted successfully
 *       404:
 *         description: Not found
 */
router.delete('/:id', accommodationController.deleteAccommodation);

export default router;
