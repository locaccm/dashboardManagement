/* eslint-env jest */
import request from "supertest";
import app from "../index";
import mockAxios from "../tests/__mocks__/axios";

// Mock axios globally
jest.mock("axios");

// Set environment variables before the tests
beforeAll(() => {
  process.env.ACCOMMODATION_API = "http://fake";
  process.env.AUTH_SERVICE_URL = "http://fake-auth";
});

describe("Accommodation Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------- GET ----------
  it("should fetch accommodations for a given userId", async () => {
    // Grant access for the required permission
    mockAxios.post.mockImplementationOnce((url, data) => {
      if (
        url.includes("/access/check") &&
        data.rightName === "VIEW_ACCOMMODATIONS"
      ) {
        return Promise.resolve({ status: 200 });
      }
      return Promise.resolve({ status: 403 });
    });
    // Mock API response
    mockAxios.get.mockImplementationOnce((url, config) => {
      if (url.includes("/read") && config?.params?.userId === "123") {
        return Promise.resolve({
          data: [{ ACCN_ID: 1, ACCC_NAME: "Appartement Test" }],
        });
      }
      return Promise.resolve({ data: [] });
    });

    const res = await request(app)
      .get("/accommodations")
      .query({ userId: "123" })
      .set("Authorization", "Bearer valid_token");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ ACCN_ID: 1, ACCC_NAME: "Appartement Test" }]);
  });

  it("should return 401 if no token provided (GET)", async () => {
    const res = await request(app)
      .get("/accommodations")
      .query({ userId: "123" });
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "No token provided" });
  });

  it("should return 403 if access denied (GET)", async () => {
    // Deny access for the required permission
    mockAxios.post.mockImplementationOnce(() =>
      Promise.resolve({ status: 403 }),
    );
    const res = await request(app)
      .get("/accommodations")
      .query({ userId: "123" })
      .set("Authorization", "Bearer invalid_token");
    expect(res.status).toBe(403);
  });

  it("should return 500 if axios throws on get (GET)", async () => {
    mockAxios.post.mockImplementationOnce(() =>
      Promise.resolve({ status: 200 }),
    );
    mockAxios.get.mockImplementationOnce(() =>
      Promise.reject(new Error("fail")),
    );

    const res = await request(app)
      .get("/accommodations")
      .query({ userId: "123" })
      .set("Authorization", "Bearer valid_token");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to fetch accommodations" });
  });

  // ---------- POST ----------
  it("should create a new accommodation", async () => {
    // Grant access for the required permission
    mockAxios.post.mockImplementationOnce((url, data) => {
      if (
        url.includes("/access/check") &&
        data.rightName === "CREATE_ACCOMMODATION"
      ) {
        return Promise.resolve({ status: 200 });
      }
      return Promise.resolve({ status: 403 });
    });
    // Mock creation API response
    mockAxios.post.mockImplementationOnce(() =>
      Promise.resolve({ data: { ACCN_ID: 2, ACCC_NAME: "Test Flat" } }),
    );

    const res = await request(app)
      .post("/accommodations")
      .set("Authorization", "Bearer valid_token")
      .send({
        ACCC_NAME: "Test Flat",
        ACCC_TYPE: "Studio",
        ACCC_ADDRESS: "123 Main St",
        ACCC_DESC: "Nice studio",
        USEN_ID: 1,
      });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ ACCN_ID: 2, ACCC_NAME: "Test Flat" });
  });

  it("should return 401 on POST if no token", async () => {
    const res = await request(app).post("/accommodations").send({});
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "No token provided" });
  });

  it("should return 403 if not authorized (POST)", async () => {
    mockAxios.post.mockImplementationOnce(() =>
      Promise.resolve({ status: 403 }),
    );
    const res = await request(app)
      .post("/accommodations")
      .set("Authorization", "Bearer invalid_token")
      .send({});
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
      .post("/accommodations")
      .set("Authorization", "Bearer valid_token")
      .send({
        ACCC_NAME: "Test Flat",
        ACCC_TYPE: "Studio",
        ACCC_ADDRESS: "123 Main St",
        ACCC_DESC: "Nice studio",
        USEN_ID: 1,
      });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to create accommodation" });
  });

  // ---------- PUT ----------
  it("should update an accommodation", async () => {
    mockAxios.post.mockImplementationOnce((url, data) => {
      if (
        url.includes("/access/check") &&
        data.rightName === "UPDATE_ACCOMMODATION"
      ) {
        return Promise.resolve({ status: 200 });
      }
      return Promise.resolve({ status: 403 });
    });
    mockAxios.put.mockImplementationOnce(() =>
      Promise.resolve({ data: { ACCN_ID: 1, ACCC_NAME: "Updated" } }),
    );

    const res = await request(app)
      .put("/accommodations/1")
      .set("Authorization", "Bearer valid_token")
      .set("user-id", "1")
      .send({ ACCC_NAME: "Updated" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ACCN_ID: 1, ACCC_NAME: "Updated" });
  });

  it("should return 401 on PUT if no token", async () => {
    const res = await request(app)
      .put("/accommodations/1")
      .send({ ACCC_NAME: "Updated" });
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "No token provided" });
  });

  it("should return 403 if not authorized (PUT)", async () => {
    mockAxios.post.mockImplementationOnce(() =>
      Promise.resolve({ status: 403 }),
    );
    const res = await request(app)
      .put("/accommodations/1")
      .set("Authorization", "Bearer invalid_token")
      .send({});
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
      .put("/accommodations/1")
      .set("Authorization", "Bearer valid_token")
      .set("user-id", "1")
      .send({ ACCC_NAME: "Updated" });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to update accommodation" });
  });

  // ---------- DELETE ----------
  it("should delete an accommodation", async () => {
    mockAxios.post.mockImplementationOnce((url, data) => {
      if (
        url.includes("/access/check") &&
        data.rightName === "DELETE_ACCOMMODATION"
      ) {
        return Promise.resolve({ status: 200 });
      }
      return Promise.resolve({ status: 403 });
    });
    mockAxios.delete.mockImplementationOnce(() =>
      Promise.resolve({ data: { message: "Deleted" } }),
    );

    const res = await request(app)
      .delete("/accommodations/1")
      .set("Authorization", "Bearer valid_token")
      .set("user-id", "1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Deleted" });
  });

  it("should return 401 on DELETE if no token", async () => {
    const res = await request(app).delete("/accommodations/1");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "No token provided" });
  });

  it("should return 403 if not authorized (DELETE)", async () => {
    mockAxios.post.mockImplementationOnce(() =>
      Promise.resolve({ status: 403 }),
    );
    const res = await request(app)
      .delete("/accommodations/1")
      .set("Authorization", "Bearer invalid_token")
      .set("user-id", "1");
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
      .delete("/accommodations/1")
      .set("Authorization", "Bearer valid_token")
      .set("user-id", "1");
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to delete accommodation" });
  });
});
