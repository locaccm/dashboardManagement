import axios from "axios";
import mockAxios from "axios";

jest.mock("axios"); // Mock axios globally

describe("Axios Mock Test", () => {
  beforeEach(() => {
    // Set up mock implementation for axios.get
    (mockAxios.get as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("/read")) {
        return Promise.resolve({
          data: [{ ACCN_ID: 1, ACCC_NAME: "Appartement Test" }],
        });
      }
      if (url.endsWith("/profiles")) {
        return Promise.resolve({
          data: [{ id: 1, name: "John Doe" }],
        });
      }
      if (url.includes("/messages")) {
        return Promise.resolve({
          data: [{ MESN_ID: 1, MESC_CONTENT: "Hello" }],
        });
      }

      // Fallback mocked data
      return Promise.resolve({ data: {} });
    });
  });

  it("should return mocked accommodation data", async () => {
    const res = await axios.get("http://fake/read");
    expect(res.data).toEqual([{ ACCN_ID: 1, ACCC_NAME: "Appartement Test" }]);
  });

  it("should return mocked profile data", async () => {
    const res = await axios.get("http://fake/profiles");
    expect(res.data).toEqual([{ id: 1, name: "John Doe" }]);
  });

  it("should return mocked message data", async () => {
    const res = await axios.get("http://fake/messages?from=1&to=2");
    expect(res.data).toEqual([{ MESN_ID: 1, MESC_CONTENT: "Hello" }]);
  });
});
