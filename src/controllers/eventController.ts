import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Get events for owner (related accommodations)
export const getOwnerEvents = async (req: Request, res: Response) => {
  const events = await prisma.event.findMany({
    where: {
      user: { USEN_ID: parseInt(req.params.userId), USEC_TYPE: 'OWNER' }
    }
  });
  res.json(events);
};

// Get events for tenant (related lease/accommodation)
export const getTenantEvents = async (req: Request, res: Response) => {
  const lease = await prisma.lease.findFirst({
    where: { USEN_ID: parseInt(req.params.userId), LEAB_ACTIVE: true },
  });

  if (!lease) return res.json([]);

  const events = await prisma.event.findMany({
    where: { ACCN_ID: lease.ACCN_ID }
  });
  res.json(events);
};

// CRUD operations
export const createEvent = async (req: Request, res: Response) => {
  const event = await prisma.event.create({ data: req.body });
  res.json(event);
};

export const updateEvent = async (req: Request, res: Response) => {
  const event = await prisma.event.update({
    where: { EVEN_ID: parseInt(req.params.id) },
    data: req.body,
  });
  res.json(event);
};

export const deleteEvent = async (req: Request, res: Response) => {
  await prisma.event.delete({ where: { EVEN_ID: parseInt(req.params.id) } });
  res.json({ message: 'Événement supprimé.' });
};
