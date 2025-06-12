import axios from "axios";
import { Request, Response } from "express";

import { ACCOMMODATION_API, AUTH_SERVICE_URL } from "../index";

/**
 * Checks if the users has the required permission by calling the Auth microservice.
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
    // We return false on error to avoid exposing permission check failures
    return false;
  }
};

/**
 * Retrieves accommodations for a user based on optional query params.
 * Requires 'VIEW_ACCOMMODATIONS' permission.
 */
export const getAccommodations = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }
  const access = await checkAccess(token, "VIEW_ACCOMMODATIONS");
  if (!access) {
    res.sendStatus(403);
    return;
  }
  const { userId, available } = req.query;
  try {
    const response = await axios.get(`${ACCOMMODATION_API}/read`, {
      params: { userId, available },
    });
    res.status(200).json(response.data);
  } catch (error) {
    // Log the error for security and debugging
    console.error("getAccommodations error:", error);
    res.status(500).json({ error: "Failed to fetch accommodations" });
  }
};

/**
 * Creates a new accommodation.
 * Requires 'CREATE_ACCOMMODATION' permission.
 */
export const createAccommodation = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }
  const access = await checkAccess(token, "CREATE_ACCOMMODATION");
  if (!access) {
    res.sendStatus(403);
    return;
  }
  try {
    const response = await axios.post(`${ACCOMMODATION_API}/create`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    // Log the error for security and debugging
    console.error("createAccommodation error:", error);
    res.status(500).json({ error: "Failed to create accommodation" });
  }
};

/**
 * Updates an existing accommodation by ID.
 * Requires 'UPDATE_ACCOMMODATION' permission.
 */
export const updateAccommodation = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];
  const { id } = req.params;
  const userId = req.headers["user-id"];

  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  // Validate the ID before using it in the URL (for SonarQube Security)
  if (!/^\d+$/.test(id)) {
    res.status(400).json({ error: "Invalid ID format" });
    return;
  }

  const access = await checkAccess(token, "UPDATE_ACCOMMODATION");
  if (!access) {
    res.sendStatus(403);
    return;
  }
  try {
    const response = await axios.put(
      `${ACCOMMODATION_API}/update/${id}`,
      req.body,
      {
        headers: { "user-id": userId },
      },
    );
    res.status(200).json(response.data);
  } catch (error) {
    // Log the error for security and debugging
    console.error("updateAccommodation error:", error);
    res.status(500).json({ error: "Failed to update accommodation" });
  }
};

/**
 * Deletes an accommodation by ID.
 * Requires 'DELETE_ACCOMMODATION' permission.
 */
export const deleteAccommodation = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];
  const userId = req.headers["user-id"];

  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  const rawId = req.params.id;
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid ID format" });
    return;
  }

  const access = await checkAccess(token, "DELETE_ACCOMMODATION");
  if (!access) {
    res.sendStatus(403);
    return;
  }

  try {
    const response = await axios.delete(`${ACCOMMODATION_API}/delete`, {
      headers: { "user-id": userId },
      data: { id },
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.error("deleteAccommodation error:", error);
    res.status(500).json({ error: "Failed to delete accommodation" });
  }
};
