import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getUserLeases = async (req: Request, res: Response) => {
  const leases = await prisma.lease.findMany({
    where: { USEN_ID: parseInt(req.params.userId) },
    include: { accommodation: true },
  });
  res.json(leases);
};

// CRUD operations
export const createLease = async (req: Request, res: Response) => {
  const lease = await prisma.lease.create({ data: req.body });
  res.json(lease);
};

export const updateLease = async (req: Request, res: Response) => {
  const lease = await prisma.lease.update({
    where: { LEAN_ID: parseInt(req.params.id) },
    data: req.body,
  });
  res.json(lease);
};

export const deleteLease = async (req: Request, res: Response) => {
  await prisma.lease.delete({ where: { LEAN_ID: parseInt(req.params.id) } });
  res.json({ message: 'Contrat supprimé.' });
};
