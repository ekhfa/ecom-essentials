import axios from "axios";
import { resetPasswordService } from "../page";
import { act } from "react-dom/test-utils";
import toast from "react-hot-toast";

jest.mock("axios");
jest.mock("react-hot-toast");

describe("passwordResetService", () => {
  test("should handle successful password reset", async () => {
    const formData = {
      email: "ekhfah@gmail.com",
      password: "12345",
      confirmPassword: "12345",
    };

    const mockResponse = {
      status: 200,
      data: { message: "Password Reset successfully!" },
    };

    (axios.post as jest.Mock).mockResolvedValue(mockResponse);

    const routerMock = { push: jest.fn() };

    (toast.success as jest.Mock).mockImplementation(() => {});

    const consoleLogMock = jest
      .spyOn(console, "log")
      .mockImplementation(() => {});

    await act(async () => {
      await resetPasswordService(formData, routerMock);
    });

    expect(axios.post as jest.Mock).toHaveBeenCalledWith(
      "http://localhost:9090/password-reset",
      formData
    );
    expect(consoleLogMock).toHaveBeenCalledWith(
      "Password Reset service called with formData:",
      formData
    );
    expect(consoleLogMock).toHaveBeenCalledWith(
      "Password Reset service response:",
      mockResponse
    );
    expect(consoleLogMock).toHaveBeenCalledWith("Password Reset successfully!");
    expect(toast.success).toHaveBeenCalledWith("Password Reset successfully!");
    expect(routerMock.push).toHaveBeenCalledWith("/user/registration/login");

    consoleLogMock.mockRestore();
    (toast.success as jest.Mock).mockRestore();
  });
});
