import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getOwnerStats = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);

  const totalBiens = await prisma.accommodation.count({ where: { USEN_ID: userId } });
  const biensOccupes = await prisma.accommodation.count({ where: { USEN_ID: userId, ACCB_AVAILABLE: false } });
  const biensDisponibles = totalBiens - biensOccupes;

  const messagesNonLus = await prisma.message.count({
    where: { MESN_RECEIVER: userId, MESB_NEW: true }
  });

  res.json({
    totalBiens,
    biensOccupes,
    biensDisponibles,
    messagesNonLus
  });
};
