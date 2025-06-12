import axios from "axios";
import { Request, Response } from "express";

const EVENT_API = process.env.EVENT_API;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;

/**
 * Verifies if the user has the right to perform an action.
 */
const checkAccess = async (
  token: string,
  rightName: string,
): Promise<boolean> => {
  try {
    const response = await axios.post(`${AUTH_SERVICE_URL}/access/check`, {
      token,
      rightName,
    });
    return response.status === 200;
  } catch (error) {
    // Log the error for security and debugging
    console.error("Auth microservice checkAccess error:", error);
    return false;
  }
};

/**
 * Retrieves all events.
 * Requires 'VIEW_EVENTS' permission.
 */
export const getEvents = async (req: Request, res: Response): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "No token provided" });
  } else {
    const access = await checkAccess(token, "VIEW_EVENTS");
    if (!access) {
      res.sendStatus(403);
    } else {
      try {
        const response = await axios.get(`${EVENT_API}`);
        res.status(200).json(response.data);
      } catch (error) {
        // Log the error for security and debugging
        console.error("getEvents error:", error);
        res.status(500).json({ error: "Failed to fetch events" });
      }
    }
  }
};

/**
 * Retrieves a specific event by its ID.
 * Requires 'VIEW_EVENTS' permission.
 */
export const getEventById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];
  const { id } = req.params;
  if (!token) {
    res.status(401).json({ error: "No token provided" });
  } else {
    const access = await checkAccess(token, "VIEW_EVENTS");
    if (!access) {
      res.sendStatus(403);
    } else {
      try {
        const response = await axios.get(`${EVENT_API}/${id}`);
        res.status(200).json(response.data);
      } catch (error) {
        // Log the error for security and debugging
        console.error("getEventById error:", error);
        res.status(500).json({ error: "Failed to fetch event" });
      }
    }
  }
};

/**
 * Creates a new event.
 * Requires 'CREATE_EVENT' permission.
 */
export const createEvent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "No token provided" });
  } else {
    const access = await checkAccess(token, "CREATE_EVENT");
    if (!access) {
      res.sendStatus(403);
    } else {
      try {
        const response = await axios.post(`${EVENT_API}`, req.body);
        res.status(201).json(response.data);
      } catch (error) {
        // Log the error for security and debugging
        console.error("createEvent error:", error);
        res.status(500).json({ error: "Failed to create event" });
      }
    }
  }
};

/**
 * Updates an existing event by ID.
 * Requires 'UPDATE_EVENT' permission.
 */
export const updateEvent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];
  const { id } = req.params;
  if (!token) {
    res.status(401).json({ error: "No token provided" });
  } else {
    const access = await checkAccess(token, "UPDATE_EVENT");
    if (!access) {
      res.sendStatus(403);
    } else {
      try {
        const response = await axios.put(`${EVENT_API}/${id}`, req.body);
        res.status(200).json(response.data);
      } catch (error) {
        // Log the error for security and debugging
        console.error("updateEvent error:", error);
        res.status(500).json({ error: "Failed to update event" });
      }
    }
  }
};

/**
 * Deletes an event by ID.
 * Requires 'DELETE_EVENT' permission.
 */
export const deleteEvent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];
  const { id } = req.params;
  if (!token) {
    res.status(401).json({ error: "No token provided" });
  } else {
    const access = await checkAccess(token, "DELETE_EVENT");
    if (!access) {
      res.sendStatus(403);
    } else {
      try {
        const response = await axios.delete(`${EVENT_API}/${id}`);
        res.status(200).json(response.data);
      } catch (error) {
        // Log the error for security and debugging
        console.error("deleteEvent error:", error);
        res.status(500).json({ error: "Failed to delete event" });
      }
    }
  }
};
