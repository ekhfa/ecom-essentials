import React from "react";
import { act } from "@testing-library/react";
import Register, { registrationService } from "../page";
import axios from "axios";
import toast from "react-hot-toast";

jest.mock("axios");
jest.mock("react-hot-toast");

describe("Register Service", () => {
  test("should handle successful registration", async () => {
    const formData = {
      name: "Ekhfa",
      email: "ekhfah@gmail.com",
      password: "1234",
      confirmPassword: "1234",
    };
    const mockResponse = {
      status: 200,
      data: { message: "Registration successful!" },
    };

    (axios.post as jest.Mock).mockResolvedValue(mockResponse);

    const routerMock = { push: jest.fn() };
    const setFormDataMock = jest.fn();
    const setRegistrationSuccessMock = jest.fn();

    await act(async () => {
      await registrationService(
        formData,
        routerMock,
        setFormDataMock,
        setRegistrationSuccessMock
      );
    });
    expect(axios.post as jest.Mock).toHaveBeenCalledWith(
      "http://localhost:9090/registration",
      formData
    );
    expect(setFormDataMock).toHaveBeenCalledWith({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    expect(setRegistrationSuccessMock).toHaveBeenCalledWith(true);
    expect(toast.success).toHaveBeenCalledWith("Registration successful!");
    expect(routerMock.push).toHaveBeenCalledWith("/user/registration/login");
  });

  test("should handle registration failure for email already exists", async () => {
    const formData = {
      name: "Ekhfa",
      email: "ekhfah@gmail.com",
      password: "1234",
      confirmPassword: "1234",
    };

    const registrationError = new Error("Email already exists") as any;
    registrationError.response = { status: 400 };
    (axios.post as jest.Mock).mockRejectedValue(registrationError);

    const routerMock = { push: jest.fn() };
    const setFormDataMock = jest.fn();
    const setRegistrationSuccessMock = jest.fn();

    await act(async () => {
      await registrationService(
        formData,
        routerMock,
        setFormDataMock,
        setRegistrationSuccessMock
      );
    });

    expect(axios.post as jest.Mock).toHaveBeenCalledWith(
      "http://localhost:9090/registration",
      formData
    );
    expect(setRegistrationSuccessMock).toHaveBeenCalledWith(false);
    expect(toast.error).toHaveBeenCalledWith(
      "Email already exists. Please use a different email."
    );
  });
});
