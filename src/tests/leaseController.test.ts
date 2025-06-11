// leaseController.test.ts

process.env.LEASE_API = "http://fake";
process.env.AUTH_SERVICE_URL = "http://fake-auth";

import { createLease, updateLease, deleteLease } from "../controllers/leaseController";
import mockAxios from "axios";
import { Request, Response } from "express";

// Mock axios globally for all tests
jest.mock("axios");

describe("Lease Controller with access control", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create lease with valid token and access", async () => {
    const req = {
      headers: { authorization: "Bearer valid_token" },
      body: { LEAD_START: "2024-01-01" },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      sendStatus: jest.fn(),
    } as unknown as Response;

    (mockAxios.post as jest.Mock).mockImplementation((url: string, data: any) => {
      if (url.includes("/access/check")) return Promise.resolve({ status: 200 });
      if (url.includes("/lease")) return Promise.resolve({ data: { id: 1, ...data } });
    });

    await createLease(req, res);

    expect(mockAxios.post).toHaveBeenCalledWith(
      "http://fake-auth/access/check",
      { token: "valid_token", rightName: "CREATE_LEASE" }
    );
    expect(mockAxios.post).toHaveBeenCalledWith("http://fake/lease", req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 1, LEAD_START: "2024-01-01" });
  });

  it("should update lease with valid token and access", async () => {
    const req = {
      headers: { authorization: "Bearer valid_token" },
      params: { id: "42" },
      body: { LEAD_START: "2024-02-01" },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      sendStatus: jest.fn(),
    } as unknown as Response;

    (mockAxios.post as jest.Mock).mockImplementation((url: string, data: any) => {
      if (url.includes("/access/check")) return Promise.resolve({ status: 200 });
    });
    (mockAxios.put as jest.Mock).mockResolvedValue({
      data: { id: 42, ...req.body }
    });

    await updateLease(req, res);

    expect(mockAxios.post).toHaveBeenCalledWith(
      "http://fake-auth/access/check",
      { token: "valid_token", rightName: "UPDATE_LEASE" }
    );
    expect(mockAxios.put).toHaveBeenCalledWith(
      "http://fake/lease/42",
      req.body
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ id: 42, LEAD_START: "2024-02-01" });
  });

  it("should delete lease with valid token and access", async () => {
    const req = {
      headers: { authorization: "Bearer valid_token" },
      params: { id: "12" },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      sendStatus: jest.fn(),
    } as unknown as Response;

    (mockAxios.post as jest.Mock).mockImplementation((url: string, data: any) => {
      if (url.includes("/access/check")) return Promise.resolve({ status: 200 });
    });
    (mockAxios.delete as jest.Mock).mockResolvedValue({});

    await deleteLease(req, res);

    expect(mockAxios.post).toHaveBeenCalledWith(
      "http://fake-auth/access/check",
      { token: "valid_token", rightName: "DELETE_LEASE" }
    );
    expect(mockAxios.delete).toHaveBeenCalledWith("http://fake/lease/12");
    expect(res.status).toHaveBeenCalledWith(204);
  });

  it("should return 401 if no token", async () => {
    const req = {
      headers: {},
      body: {},
      params: { id: "15" }
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      sendStatus: jest.fn(),
    } as unknown as Response;

    await createLease(req, res);
    expect(res.status).toHaveBeenCalledWith(401);

    await updateLease(req, res);
    expect(res.status).toHaveBeenCalledWith(401);

    await deleteLease(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("should return 403 if access denied", async () => {
    const req = {
      headers: { authorization: "Bearer invalid_token" },
      body: {},
      params: { id: "15" }
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      sendStatus: jest.fn(),
    } as unknown as Response;

    (mockAxios.post as jest.Mock).mockResolvedValue({ status: 403 });

    await createLease(req, res);
    expect(res.sendStatus).toHaveBeenCalledWith(403);

    await updateLease(req, res);
    expect(res.sendStatus).toHaveBeenCalledWith(403);

    await deleteLease(req, res);
    expect(res.sendStatus).toHaveBeenCalledWith(403);
  });
});
