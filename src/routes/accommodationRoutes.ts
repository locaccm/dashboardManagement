import express from 'express';
import {
  getOwnerAccommodations,
  getTenantAccommodation,
  createAccommodation,
  updateAccommodation,
  deleteAccommodation
} from '../controllers/accommodationController';

const router = express.Router();

router.get('/owner/:userId', getOwnerAccommodations);
router.get('/tenant/:userId', getTenantAccommodation);
router.post('/', createAccommodation);
router.put('/:id', updateAccommodation);
router.delete('/:id', deleteAccommodation);

export default router;
