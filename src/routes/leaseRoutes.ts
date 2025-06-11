import { Router } from "express";
import * as leaseController from "../controllers/leaseController";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Leases
 *   description: API for managing leases
 */

/**
 * @swagger
 * /leases:
 *   post:
 *     summary: Create a lease
 *     tags: [Leases]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - LEAD_START
 *               - LEAD_END
 *               - LEAN_RENT
 *               - LEAN_CHARGES
 *               - USEN_ID
 *               - ACCN_ID
 *             properties:
 *               LEAD_START:
 *                 type: string
 *                 format: date
 *               LEAD_END:
 *                 type: string
 *                 format: date
 *               LEAN_RENT:
 *                 type: number
 *               LEAN_CHARGES:
 *                 type: number
 *               USEN_ID:
 *                 type: integer
 *               ACCN_ID:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Lease created
 *       400:
 *         description: Invalid input
 */
router.post("/", leaseController.createLease);

/**
 * @swagger
 * /leases/{id}:
 *   put:
 *     summary: Update a lease
 *     tags: [Leases]
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
 *               LEAD_START:
 *                 type: string
 *                 format: date
 *               LEAD_END:
 *                 type: string
 *                 format: date
 *               LEAN_RENT:
 *                 type: number
 *               LEAN_CHARGES:
 *                 type: number
 *               LEAD_PAYMENT:
 *                 type: string
 *                 format: date
 *               USEN_ID:
 *                 type: integer
 *               ACCN_ID:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Lease updated
 *       404:
 *         description: Not found
 */
router.put("/:id", leaseController.updateLease);

/**
 * @swagger
 * /leases/{id}:
 *   delete:
 *     summary: Delete a lease
 *     tags: [Leases]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Lease deleted
 *       404:
 *         description: Not found
 */
router.delete("/:id", leaseController.deleteLease);

export default router;
