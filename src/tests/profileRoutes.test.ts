process.env.PROFILE_API = "http://fake";
process.env.AUTH_SERVICE_URL = "http://fake-auth";

import request from "supertest";
import app from "../index";
import mockAxios from "axios";

jest.mock("axios");

describe("Profile Routes with access control", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (mockAxios.post as jest.Mock).mockImplementation(
      (url: string, data: any) => {
        if (
          url === "http://fake-auth/access/check" &&
          data.rightName === "VIEW_PROFILES"
        ) {
          return Promise.resolve({ status: 200 }); // Allow access
        }
        return Promise.resolve({ status: 403 }); // Deny access by default
      },
    );

    (mockAxios.get as jest.Mock).mockImplementation((url: string) => {
      if (url === "http://fake/profiles") {
        return Promise.resolve({ data: [{ id: 1, name: "John Doe" }] });
      }
      if (url === "http://fake/profiles/42") {
        return Promise.resolve({ data: { id: 42, name: "Jane Doe" } });
      }
      return Promise.resolve({ data: {} });
    });
  });

  it("should return all profiles with valid token", async () => {
    const res = await request(app)
      .get("/profiles")
      .set("Authorization", "Bearer valid_token");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1, name: "John Doe" }]);
  });

  it("should return profile by ID with valid token", async () => {
    const res = await request(app)
      .get("/profiles/42")
      .set("Authorization", "Bearer valid_token");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 42, name: "Jane Doe" });
  });

  it("should return 401 if no token is provided", async () => {
    const res = await request(app).get("/profiles");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "No token provided" });
  });

  it("should return 403 if access is denied", async () => {
    (mockAxios.post as jest.Mock).mockResolvedValueOnce({ status: 403 });

    const res = await request(app)
      .get("/profiles")
      .set("Authorization", "Bearer invalid_token");

    expect(res.status).toBe(403);
  });
});
