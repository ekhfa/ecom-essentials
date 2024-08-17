import axios from "axios";
import { loginService } from "../page";
import { act } from "react-dom/test-utils";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

jest.mock("axios");
jest.mock("react-hot-toast");
jest.mock("js-cookie");

describe("loginService", () => {
  test("should handle successful login", async () => {
    const formData = { email: "ekhfah@gmail.com", password: "1234" };
    const mockResponse = {
      status: 200,
      data: { message: "Login successful!", token: "mockToken" },
    };

    (axios.post as jest.Mock).mockResolvedValue(mockResponse);

    const routerMock = { push: jest.fn() };

    (toast.success as jest.Mock).mockImplementation(() => {});
    (Cookies.set as jest.Mock).mockImplementation(() => {});

    const consoleLogMock = jest
      .spyOn(console, "log")
      .mockImplementation(() => {});

    await act(async () => {
      await loginService(formData, routerMock);
    });

    expect(axios.post as jest.Mock).toHaveBeenCalledWith(
      "http://localhost:9090/login",
      formData
    );
    expect(consoleLogMock).toHaveBeenCalledWith(
      "Login service called with formData:",
      formData
    );
    expect(consoleLogMock).toHaveBeenCalledWith(
      "Login service response:",
      mockResponse
    );
    expect(consoleLogMock).toHaveBeenCalledWith("Login successful!");
    expect(toast.success).toHaveBeenCalledWith("Login successful!");
    expect(Cookies.set as jest.Mock).toHaveBeenCalledWith(
      "token",
      "mockToken",
      {
        expires: 1 / 24,
      }
    );
    expect(routerMock.push).toHaveBeenCalledWith("/");

    consoleLogMock.mockRestore();
    (toast.success as jest.Mock).mockRestore();
    (Cookies.set as jest.Mock).mockRestore();
  });

  test("should handle login failure", async () => {
    const formData = { email: "test@example.com", password: "wrongPassword" };
    const loginError = new Error("Login failed") as any;
    loginError.response = { status: 401 };

    (axios.post as jest.Mock).mockRejectedValue(loginError);
    const routerMock = { push: jest.fn() };
    await act(async () => {
      await loginService(formData, routerMock);
    });

    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:9090/login",
      formData
    );
    expect(toast.error).toHaveBeenCalledWith("Login failed");
  });
});
