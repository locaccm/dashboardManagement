// Set environment variables for message API and auth service
process.env.MESSAGE_API = "http://fake/messages";
process.env.AUTH_SERVICE_URL = "http://fake-auth";

import { getMessages, sendMessage } from "../controllers/messageController";
import mockAxios from "axios";
import { Request, Response } from "express";

// Mock axios globally for all tests
jest.mock("axios");

describe("Message Controller with access control", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should get messages between users with valid token and access", async () => {
    const req = {
      headers: { authorization: "Bearer valid_token" },
      query: { from: "1", to: "2" },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    // Mock access check
    (mockAxios.post as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("/access/check")) {
        return Promise.resolve({ status: 200 });
      }
    });

    // Mock message retrieval
    (mockAxios.get as jest.Mock).mockResolvedValue({
      data: [{ MESN_ID: 1, MESC_CONTENT: "Hello" }],
    });

    await getMessages(req, res);

    expect(mockAxios.post).toHaveBeenCalledWith(
      "http://fake-auth/access/check",
      { token: "valid_token", rightName: "VIEW_MESSAGES" }
    );
    expect(mockAxios.get).toHaveBeenCalledWith("http://fake/messages", {
      params: { from: "1", to: "2" },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ MESN_ID: 1, MESC_CONTENT: "Hello" }]);
  });

  it("should send message with valid token and access", async () => {
    const req = {
      headers: { authorization: "Bearer valid_token" },
      body: { sender: 1, receiver: 2, content: "Hello there!" },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    (mockAxios.post as jest.Mock).mockImplementation((url: string, data: any) => {
      if (url.includes("/access/check")) {
        return Promise.resolve({ status: 200 });
      }
      if (url === "http://fake/messages") {
        return Promise.resolve({
          data: { MESN_ID: 2, MESC_CONTENT: data.content },
        });
      }
    });

    await sendMessage(req, res);

    expect(mockAxios.post).toHaveBeenCalledWith(
      "http://fake-auth/access/check",
      { token: "valid_token", rightName: "SEND_MESSAGE" }
    );
    expect(mockAxios.post).toHaveBeenCalledWith("http://fake/messages", {
      sender: 1,
      receiver: 2,
      content: "Hello there!",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      MESN_ID: 2,
      MESC_CONTENT: "Hello there!",
    });
  });
});
