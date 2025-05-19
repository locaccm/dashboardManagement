import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Get accommodations for OWNER
export const getOwnerAccommodations = async (req: Request, res: Response) => {
  const accommodations = await prisma.accommodation.findMany({
    where: { USEN_ID: parseInt(req.params.userId) },
    include: { leases: true },
  });
  res.json(accommodations);
};

// Get current accommodation for TENANT
export const getTenantAccommodation = async (req: Request, res: Response) => {
  const lease = await prisma.lease.findFirst({
    where: { USEN_ID: parseInt(req.params.userId), LEAB_ACTIVE: true },
    include: { accommodation: true },
  });
  res.json(lease?.accommodation || null);
};

// CRUD operations
export const createAccommodation = async (req: Request, res: Response) => {
  const accommodation = await prisma.accommodation.create({ data: req.body });
  res.json(accommodation);
};

export const updateAccommodation = async (req: Request, res: Response) => {
  const accommodation = await prisma.accommodation.update({
    where: { ACCN_ID: parseInt(req.params.id) },
    data: req.body,
  });
  res.json(accommodation);
};

export const deleteAccommodation = async (req: Request, res: Response) => {
  await prisma.accommodation.delete({ where: { ACCN_ID: parseInt(req.params.id) } });
  res.json({ message: 'Logement supprimé.' });
};
