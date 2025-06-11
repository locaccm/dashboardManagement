import axios from 'axios';
import { Request, Response } from 'express';

const ACCOMMODATION_API = process.env.ACCOMMODATION_API;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;

const checkAccess = async (token: string, rightName: string): Promise<boolean> => {
  try {
    const response = await axios.post(`${AUTH_SERVICE_URL}/access/check`, { token, rightName });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

export const getAccommodations = async (req: Request, res: Response): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'No token provided' });
  } else {
    const access = await checkAccess(token, 'VIEW_ACCOMMODATIONS');
    if (!access) {
      res.sendStatus(403);
    } else {
      const { userId, available } = req.query;
      try {
        const response = await axios.get(`${ACCOMMODATION_API}/read`, {
          params: { userId, available },
        });
        res.status(200).json(response.data);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch accommodations' });
      }
    }
  }
};

export const createAccommodation = async (req: Request, res: Response): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'No token provided' });
  } else {
    const access = await checkAccess(token, 'CREATE_ACCOMMODATION');
    if (!access) {
      res.sendStatus(403);
    } else {
      try {
        const response = await axios.post(`${ACCOMMODATION_API}/create`, req.body);
        res.status(201).json(response.data);
      } catch (error) {
        res.status(500).json({ error: 'Failed to create accommodation' });
      }
    }
  }
};

export const updateAccommodation = async (req: Request, res: Response): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1];
  const { id } = req.params;
  const userId = req.headers['user-id'];

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
  } else {
    const access = await checkAccess(token, 'UPDATE_ACCOMMODATION');
    if (!access) {
      res.sendStatus(403);
    } else {
      try {
        const response = await axios.put(`${ACCOMMODATION_API}/update/${id}`, req.body, {
          headers: { 'user-id': userId },
        });
        res.status(200).json(response.data);
      } catch (error) {
        res.status(500).json({ error: 'Failed to update accommodation' });
      }
    }
  }
};

export const deleteAccommodation = async (req: Request, res: Response): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1];
  const { id } = req.params;
  const userId = req.headers['user-id'];

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
  } else {
    const access = await checkAccess(token, 'DELETE_ACCOMMODATION');
    if (!access) {
      res.sendStatus(403);
    } else {
      try {
        const response = await axios.delete(`${ACCOMMODATION_API}/delete/${id}`, {
          headers: { 'user-id': userId },
        });
        res.status(200).json(response.data);
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete accommodation' });
      }
    }
  }
};
