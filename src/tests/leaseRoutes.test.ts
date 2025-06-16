/* eslint-env jest */

// leaseRoutes.test.ts

process.env.LEASE_API = "http://fake";
process.env.AUTH_SERVICE_URL = "http://fake-auth";

import request from "supertest";
import app from "../index"; // Your Express app
import mockAxios from "axios";

jest.mock("axios");

describe("Lease Routes with access control", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (mockAxios.post as jest.Mock).mockImplementation(
      (url: string, data: any) => {
        // Access control
        if (url.includes("/access/check")) {
          // Check permission in data
          if (
            data.rightName === "CREATE_LEASE" ||
            data.rightName === "UPDATE_LEASE" ||
            data.rightName === "DELETE_LEASE"
          ) {
            return Promise.resolve({ status: 200 });
          }
          return Promise.resolve({ status: 403 });
        }
        // Create lease
        if (url === "http://fake/lease") {
          return Promise.resolve({ data: { id: 1, ...data } });
        }
        return Promise.resolve({ status: 403 });
      },
    );

    (mockAxios.put as jest.Mock).mockImplementation(
      (url: string, data: any) => {
        if (url.startsWith("http://fake/lease/")) {
          return Promise.resolve({
            data: { id: Number(url.split("/").pop()), ...data },
          });
        }
        return Promise.resolve({ status: 403 });
      },
    );

    (mockAxios.delete as jest.Mock).mockImplementation((url: string) => {
      if (url.startsWith("http://fake/lease/")) {
        return Promise.resolve({});
      }
      return Promise.resolve({ status: 403 });
    });
  });

  it("should create a lease via POST /leases with valid token", async () => {
    const leaseData = {
      LEAD_START: "2024-01-01",
      LEAD_END: "2024-12-31",
      LEAN_RENT: 900,
      LEAN_CHARGES: 50,
      USEN_ID: 1,
      ACCN_ID: 1,
    };

    const res = await request(app)
      .post("/leases")
      .set("Authorization", "Bearer valid_token")
      .send(leaseData);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 1, ...leaseData });
  });

  it("should update a lease via PUT /leases/:id with valid token", async () => {
    const leaseData = {
      LEAD_START: "2024-02-01",
      LEAD_END: "2024-12-31",
      LEAN_RENT: 950,
      LEAN_CHARGES: 40,
      USEN_ID: 2,
      ACCN_ID: 2,
    };

    const res = await request(app)
      .put("/leases/42")
      .set("Authorization", "Bearer valid_token")
      .send(leaseData);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 42, ...leaseData });
  });

  it("should delete a lease via DELETE /leases/:id with valid token", async () => {
    const res = await request(app)
      .delete("/leases/12")
      .set("Authorization", "Bearer valid_token");

    expect(res.status).toBe(204);
  });

  it("should return 401 if no token is provided", async () => {
    const res1 = await request(app).post("/leases").send({});
    expect(res1.status).toBe(401);

    const res2 = await request(app).put("/leases/10").send({});
    expect(res2.status).toBe(401);

    const res3 = await request(app).delete("/leases/10");
    expect(res3.status).toBe(401);
  });

  it("should return 403 if access is denied", async () => {
    (mockAxios.post as jest.Mock).mockResolvedValue({ status: 403 });

    const res1 = await request(app)
      .post("/leases")
      .set("Authorization", "Bearer invalid_token")
      .send({});
    expect(res1.status).toBe(403);

    const res2 = await request(app)
      .put("/leases/10")
      .set("Authorization", "Bearer invalid_token")
      .send({});
    expect(res2.status).toBe(403);

    const res3 = await request(app)
      .delete("/leases/10")
      .set("Authorization", "Bearer invalid_token");
    expect(res3.status).toBe(403);
  });
});
