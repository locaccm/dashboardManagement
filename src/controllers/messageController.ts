import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getUserMessages = async (req: Request, res: Response) => {
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { MESN_SENDER: parseInt(req.params.userId) },
        { MESN_RECEIVER: parseInt(req.params.userId) }
      ]
    },
    include: { sender: true, receiver: true },
  });
  res.json(messages);
};

export const sendMessage = async (req: Request, res: Response) => {
  const message = await prisma.message.create({ data: req.body });
  res.json(message);
};
