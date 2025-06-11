process.env.EVENT_API = "http://fake/events";
process.env.AUTH_SERVICE_URL = "http://fake-auth";

import mockAxios from "axios";
import { Request, Response } from "express";
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController";

// Mock axios globally
jest.mock("axios");

beforeAll(() => {});

describe("eventController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      sendStatus: jest.fn(),
    };
  });

  // ---- getEvents ----
  it("should return all events with valid token and rights", async () => {
    req = { headers: { authorization: "Bearer valid_token" } };
    (mockAxios.post as jest.Mock).mockResolvedValue({ status: 200 });
    (mockAxios.get as jest.Mock).mockResolvedValue({
      data: [{ id: 1, title: "Event 1" }],
    });

    await getEvents(req as Request, res as Response);

    expect(mockAxios.post).toHaveBeenCalledWith(
      "http://fake-auth/access/check",
      { token: "valid_token", rightName: "VIEW_EVENTS" },
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ id: 1, title: "Event 1" }]);
  });

  it("should return 401 if no token (getEvents)", async () => {
    req = { headers: {} };
    await getEvents(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "No token provided" });
  });

  it("should return 403 if access denied (getEvents)", async () => {
    req = { headers: { authorization: "Bearer invalid_token" } };
    (mockAxios.post as jest.Mock).mockResolvedValue({ status: 403 });
    await getEvents(req as Request, res as Response);
    expect(res.sendStatus).toHaveBeenCalledWith(403);
  });

  it("should return 500 if axios fails (getEvents)", async () => {
    req = { headers: { authorization: "Bearer valid_token" } };
    (mockAxios.post as jest.Mock).mockResolvedValue({ status: 200 });
    (mockAxios.get as jest.Mock).mockRejectedValue(new Error("fail"));
    await getEvents(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch events" });
  });

  // ---- getEventById ----
  it("should return event by id with valid token and rights", async () => {
    req = {
      headers: { authorization: "Bearer valid_token" },
      params: { id: "42" },
    };
    (mockAxios.post as jest.Mock).mockResolvedValue({ status: 200 });
    (mockAxios.get as jest.Mock).mockResolvedValue({
      data: { id: 42, title: "Event Test" },
    });
    await getEventById(req as Request, res as Response);
    expect(mockAxios.get).toHaveBeenCalledWith("http://fake/events/42");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ id: 42, title: "Event Test" });
  });

  it("should return 401 if no token (getEventById)", async () => {
    req = { headers: {}, params: { id: "42" } };
    await getEventById(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "No token provided" });
  });

  it("should return 403 if access denied (getEventById)", async () => {
    req = {
      headers: { authorization: "Bearer invalid_token" },
      params: { id: "42" },
    };
    (mockAxios.post as jest.Mock).mockResolvedValue({ status: 403 });
    await getEventById(req as Request, res as Response);
    expect(res.sendStatus).toHaveBeenCalledWith(403);
  });

  it("should return 500 if axios fails (getEventById)", async () => {
    req = {
      headers: { authorization: "Bearer valid_token" },
      params: { id: "42" },
    };
    (mockAxios.post as jest.Mock).mockResolvedValue({ status: 200 });
    (mockAxios.get as jest.Mock).mockRejectedValue(new Error("fail"));
    await getEventById(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch event" });
  });

  // ---- createEvent ----
  it("should create an event with valid token and rights", async () => {
    req = {
      headers: { authorization: "Bearer valid_token" },
      body: { title: "X" },
    };
    (mockAxios.post as jest.Mock).mockResolvedValueOnce({ status: 200 });
    (mockAxios.post as jest.Mock).mockResolvedValueOnce({
      data: { id: 99, title: "X" },
    });
    await createEvent(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 99, title: "X" });
  });

  it("should return 401 if no token (createEvent)", async () => {
    req = { headers: {}, body: {} };
    await createEvent(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "No token provided" });
  });

  it("should return 403 if access denied (createEvent)", async () => {
    req = { headers: { authorization: "Bearer invalid_token" }, body: {} };
    (mockAxios.post as jest.Mock).mockResolvedValue({ status: 403 });
    await createEvent(req as Request, res as Response);
    expect(res.sendStatus).toHaveBeenCalledWith(403);
  });

  it("should return 500 if axios fails (createEvent)", async () => {
    req = { headers: { authorization: "Bearer valid_token" }, body: {} };
    (mockAxios.post as jest.Mock).mockResolvedValueOnce({ status: 200 });
    (mockAxios.post as jest.Mock).mockRejectedValueOnce(new Error("fail"));
    await createEvent(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to create event" });
  });

  // ---- updateEvent ----
  it("should update an event with valid token and rights", async () => {
    req = {
      headers: { authorization: "Bearer valid_token" },
      params: { id: "1" },
      body: { title: "X" },
    };
    (mockAxios.post as jest.Mock).mockResolvedValue({ status: 200 });
    (mockAxios.put as jest.Mock).mockResolvedValue({
      data: { id: 1, title: "X" },
    });
    await updateEvent(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ id: 1, title: "X" });
  });

  it("should return 401 if no token (updateEvent)", async () => {
    req = { headers: {}, params: { id: "1" }, body: {} };
    await updateEvent(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "No token provided" });
  });

  it("should return 403 if access denied (updateEvent)", async () => {
    req = {
      headers: { authorization: "Bearer invalid_token" },
      params: { id: "1" },
      body: {},
    };
    (mockAxios.post as jest.Mock).mockResolvedValue({ status: 403 });
    await updateEvent(req as Request, res as Response);
    expect(res.sendStatus).toHaveBeenCalledWith(403);
  });

  it("should return 500 if axios fails (updateEvent)", async () => {
    req = {
      headers: { authorization: "Bearer valid_token" },
      params: { id: "1" },
      body: {},
    };
    (mockAxios.post as jest.Mock).mockResolvedValue({ status: 200 });
    (mockAxios.put as jest.Mock).mockRejectedValue(new Error("fail"));
    await updateEvent(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to update event" });
  });

  // ---- deleteEvent ----
  it("should delete an event with valid token and rights", async () => {
    req = {
      headers: { authorization: "Bearer valid_token" },
      params: { id: "3" },
    };
    (mockAxios.post as jest.Mock).mockResolvedValue({ status: 200 });
    (mockAxios.delete as jest.Mock).mockResolvedValue({
      data: { message: "Deleted" },
    });
    await deleteEvent(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Deleted" });
  });

  it("should return 401 if no token (deleteEvent)", async () => {
    req = { headers: {}, params: { id: "3" } };
    await deleteEvent(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "No token provided" });
  });

  it("should return 403 if access denied (deleteEvent)", async () => {
    req = {
      headers: { authorization: "Bearer invalid_token" },
      params: { id: "3" },
    };
    (mockAxios.post as jest.Mock).mockResolvedValue({ status: 403 });
    await deleteEvent(req as Request, res as Response);
    expect(res.sendStatus).toHaveBeenCalledWith(403);
  });

  it("should return 500 if axios fails (deleteEvent)", async () => {
    req = {
      headers: { authorization: "Bearer valid_token" },
      params: { id: "3" },
    };
    (mockAxios.post as jest.Mock).mockResolvedValue({ status: 200 });
    (mockAxios.delete as jest.Mock).mockRejectedValue(new Error("fail"));
    await deleteEvent(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to delete event" });
  });
});
