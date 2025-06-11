import axios from "axios";
import { Request, Response } from "express";

const MESSAGE_API = process.env.MESSAGE_API;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;

/**
 * Utility function to verify if the user has the required access right.
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
    return false;
  }
};

/**
 * Controller to get messages exchanged between two users.
 * Requires 'VIEW_MESSAGES' permission.
 */
export const getMessages = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "No token provided" });
  } else {
    const access = await checkAccess(token, "VIEW_MESSAGES");
    if (!access) {
      res.sendStatus(403);
    } else {
      const { from, to } = req.query;
      try {
        const response = await axios.get(`${MESSAGE_API}`, {
          params: { from, to },
        });
        res.status(200).json(response.data);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch messages" });
      }
    }
  }
};

/**
 * Controller to send a message from one user to another.
 * Requires 'SEND_MESSAGE' permission.
 */
export const sendMessage = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "No token provided" });
  } else {
    const access = await checkAccess(token, "SEND_MESSAGE");
    if (!access) {
      res.sendStatus(403);
    } else {
      const { sender, receiver, content } = req.body;
      try {
        const response = await axios.post(`${MESSAGE_API}`, {
          sender,
          receiver,
          content,
        });
        res.status(200).json(response.data);
      } catch (error) {
        res.status(500).json({ error: "Failed to send message" });
      }
    }
  }
};
