/* eslint-env jest */

import request from "supertest";
import app from "../index";
import mockAxios from "../tests/__mocks__/axios";

// Mock axios globally
jest.mock("axios");

// Setup environment variables before the tests
beforeAll(() => {
  process.env.EVENT_API = "http://fake/events";
  process.env.AUTH_SERVICE_URL = "http://fake-auth";
});

describe("Event Routes with Access Control", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------- GET ALL EVENTS ----------
  it("should fetch all events with valid token and rights", async () => {
    // Mock access granted for VIEW_EVENTS
    mockAxios.post.mockImplementationOnce((url, data) => {
      if (url.includes("/access/check") && data.rightName === "VIEW_EVENTS") {
        return Promise.resolve({ status: 200 });
      }
      return Promise.resolve({ status: 403 });
    });
    // Mock events fetch
    mockAxios.get.mockImplementationOnce(() =>
      Promise.resolve({ data: [{ id: 1, title: "Event 1" }] }),
    );

    const res = await request(app)
      .get("/events")
      .set("Authorization", "Bearer valid_token");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1, title: "Event 1" }]);
  });

  it("should return 401 if no token provided (GET ALL)", async () => {
    const res = await request(app).get("/events");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "No token provided" });
  });

  it("should return 403 if access denied (GET ALL)", async () => {
    mockAxios.post.mockImplementationOnce(() =>
      Promise.resolve({ status: 403 }),
    );
    const res = await request(app)
      .get("/events")
      .set("Authorization", "Bearer invalid_token");
    expect(res.status).toBe(403);
  });

  it("should return 500 if axios throws (GET ALL)", async () => {
    mockAxios.post.mockImplementationOnce(() =>
      Promise.resolve({ status: 200 }),
    );
    mockAxios.get.mockImplementationOnce(() =>
      Promise.reject(new Error("fail")),
    );
    const res = await request(app)
      .get("/events")
      .set("Authorization", "Bearer valid_token");
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to fetch events" });
  });

  // ---------- GET EVENT BY ID ----------
  it("should fetch event by ID with valid token and rights", async () => {
    mockAxios.post.mockImplementationOnce((url, data) => {
      if (url.includes("/access/check") && data.rightName === "VIEW_EVENTS") {
        return Promise.resolve({ status: 200 });
      }
      return Promise.resolve({ status: 403 });
    });
    mockAxios.get.mockImplementationOnce(() =>
      Promise.resolve({ data: { id: 42, title: "Event Test" } }),
    );
    const res = await request(app)
      .get("/events/42")
      .set("Authorization", "Bearer valid_token");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 42, title: "Event Test" });
  });

  it("should return 401 if no token provided (GET BY ID)", async () => {
    const res = await request(app).get("/events/42");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "No token provided" });
  });

  it("should return 403 if access denied (GET BY ID)", async () => {
    mockAxios.post.mockImplementationOnce(() =>
      Promise.resolve({ status: 403 }),
    );
    const res = await request(app)
      .get("/events/42")
      .set("Authorization", "Bearer invalid_token");
    expect(res.status).toBe(403);
  });

  it("should return 500 if axios throws (GET BY ID)", async () => {
    mockAxios.post.mockImplementationOnce(() =>
      Promise.resolve({ status: 200 }),
    );
    mockAxios.get.mockImplementationOnce(() =>
      Promise.reject(new Error("fail")),
    );
    const res = await request(app)
      .get("/events/42")
      .set("Authorization", "Bearer valid_token");
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to fetch event" });
  });

  // ---------- POST ----------
  it("should create an event with valid token and rights", async () => {
    mockAxios.post.mockImplementationOnce((url, data) => {
      if (url.includes("/access/check") && data.rightName === "CREATE_EVENT") {
        return Promise.resolve({ status: 200 });
      }
      return Promise.resolve({ status: 403 });
    });
    mockAxios.post.mockImplementationOnce(() =>
      Promise.resolve({ data: { id: 100, title: "New Event" } }),
    );

    const res = await request(app)
      .post("/events")
      .set("Authorization", "Bearer valid_token")
      .send({ title: "New Event" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 100, title: "New Event" });
  });

  it("should return 401 if no token provided (POST)", async () => {
    const res = await request(app).post("/events").send({ title: "Fail" });
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "No token provided" });
  });

  it("should return 403 if access denied (POST)", async () => {
    mockAxios.post.mockImplementationOnce(() =>
      Promise.resolve({ status: 403 }),
    );
    const res = await request(app)
      .post("/events")
      .set("Authorization", "Bearer invalid_token")
      .send({ title: "Fail" });
    expect(res.status).toBe(403);
  });

  it("should return 500 if axios throws (POST)", async () => {
    mockAxios.post.mockImplementationOnce(() =>
      Promise.resolve({ status: 200 }),
    );
    mockAxios.post.mockImplementationOnce(() =>
      Promise.reject(new Error("fail")),
    );
    const res = await request(app)
      .post("/events")
      .set("Authorization", "Bearer valid_token")
      .send({ title: "Fail" });
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to create event" });
  });

  // ---------- PUT ----------
  it("should update an event with valid token and rights", async () => {
    mockAxios.post.mockImplementationOnce((url, data) => {
      if (url.includes("/access/check") && data.rightName === "UPDATE_EVENT") {
        return Promise.resolve({ status: 200 });
      }
      return Promise.resolve({ status: 403 });
    });
    mockAxios.put.mockImplementationOnce(() =>
      Promise.resolve({ data: { id: 42, title: "Updated Event" } }),
    );
    const res = await request(app)
      .put("/events/42")
      .set("Authorization", "Bearer valid_token")
      .send({ title: "Updated Event" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 42, title: "Updated Event" });
  });

  it("should return 401 if no token provided (PUT)", async () => {
    const res = await request(app).put("/events/42").send({ title: "X" });
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "No token provided" });
  });

  it("should return 403 if access denied (PUT)", async () => {
    mockAxios.post.mockImplementationOnce(() =>
      Promise.resolve({ status: 403 }),
    );
    const res = await request(app)
      .put("/events/42")
      .set("Authorization", "Bearer invalid_token")
      .send({ title: "X" });
    expect(res.status).toBe(403);
  });

  it("should return 500 if axios throws (PUT)", async () => {
    mockAxios.post.mockImplementationOnce(() =>
      Promise.resolve({ status: 200 }),
    );
    mockAxios.put.mockImplementationOnce(() =>
      Promise.reject(new Error("fail")),
    );
    const res = await request(app)
      .put("/events/42")
      .set("Authorization", "Bearer valid_token")
      .send({ title: "X" });
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to update event" });
  });

  // ---------- DELETE ----------
  it("should delete an event with valid token and rights", async () => {
    mockAxios.post.mockImplementationOnce((url, data) => {
      if (url.includes("/access/check") && data.rightName === "DELETE_EVENT") {
        return Promise.resolve({ status: 200 });
      }
      return Promise.resolve({ status: 403 });
    });
    mockAxios.delete.mockImplementationOnce(() =>
      Promise.resolve({ data: { message: "Deleted" } }),
    );
    const res = await request(app)
      .delete("/events/42")
      .set("Authorization", "Bearer valid_token");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Deleted" });
  });

  it("should return 401 if no token provided (DELETE)", async () => {
    const res = await request(app).delete("/events/42");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "No token provided" });
  });

  it("should return 403 if access denied (DELETE)", async () => {
    mockAxios.post.mockImplementationOnce(() =>
      Promise.resolve({ status: 403 }),
    );
    const res = await request(app)
      .delete("/events/42")
      .set("Authorization", "Bearer invalid_token");
    expect(res.status).toBe(403);
  });

  it("should return 500 if axios throws (DELETE)", async () => {
    mockAxios.post.mockImplementationOnce(() =>
      Promise.resolve({ status: 200 }),
    );
    mockAxios.delete.mockImplementationOnce(() =>
      Promise.reject(new Error("fail")),
    );
    const res = await request(app)
      .delete("/events/42")
      .set("Authorization", "Bearer valid_token");
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to delete event" });
  });
});
