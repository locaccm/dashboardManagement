import axios from "axios";
import { Request, Response } from "express";

const PROFILE_API = process.env.PROFILE_API;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;

/**
 * Check if the user has the required permission by sending a request to the auth service.
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
 * Controller to fetch all user profiles.
 * Requires 'VIEW_PROFILES' permission.
 */
export const getAllProfiles = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  const access = await checkAccess(token, "VIEW_PROFILES");
  if (!access) {
    res.sendStatus(403);
    return;
  }

  try {
    const response = await axios.get(`${PROFILE_API}/profiles`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("AXIOS ERROR:", error);
    res.status(500).json({ error: "Failed to fetch profiles" });
  }
};

/**
 * Controller to fetch a specific profile by ID.
 * Requires 'VIEW_PROFILES' permission.
 */
export const getProfileById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];
  const { id } = req.params;

  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  const access = await checkAccess(token, "VIEW_PROFILES");
  if (!access) {
    res.sendStatus(403);
    return;
  }

  try {
    const response = await axios.get(`${PROFILE_API}/profiles/${id}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};
