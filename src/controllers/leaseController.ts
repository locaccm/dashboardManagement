import axios from 'axios';
import { Request, Response } from 'express';

const LEASE_API = process.env.LEASE_API;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;

const checkAccess = async (token: string, rightName: string): Promise<boolean> => {
  try {
    const response = await axios.post(`${AUTH_SERVICE_URL}/access/check`, { token, rightName });
    return response.status === 200;
  } catch {
    return false;
  }
};

export const createLease = async (req: Request, res: Response): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'No token provided' });
  } else {
    const access = await checkAccess(token, 'CREATE_LEASE');
    if (!access) {
      res.sendStatus(403);
    } else {
      try {
        const response = await axios.post(`${LEASE_API}/lease`, req.body);
        res.status(201).json(response.data);
      } catch {
        res.status(500).json({ error: 'Failed to create lease' });
      }
    }
  }
};

export const updateLease = async (req: Request, res: Response): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1];
  const { id } = req.params;

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
  } else {
    const access = await checkAccess(token, 'UPDATE_LEASE');
    if (!access) {
      res.sendStatus(403);
    } else {
      try {
        const response = await axios.put(`${LEASE_API}/lease/${id}`, req.body);
        res.status(200).json(response.data);
      } catch {
        res.status(500).json({ error: 'Failed to update lease' });
      }
    }
  }
};

export const deleteLease = async (req: Request, res: Response): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1];
  const { id } = req.params;

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
  } else {
    const access = await checkAccess(token, 'DELETE_LEASE');
    if (!access) {
      res.sendStatus(403);
    } else {
      try {
        await axios.delete(`${LEASE_API}/lease/${id}`);
        res.status(204).send();
      } catch {
        res.status(500).json({ error: 'Failed to delete lease' });
      }
    }
  }
};
