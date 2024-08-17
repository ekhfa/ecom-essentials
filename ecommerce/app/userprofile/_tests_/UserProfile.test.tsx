import React from "react";
import axios from "axios";
import { render, screen, waitFor } from "@testing-library/react";
import About from "../page";

jest.mock("axios");

describe("About component", () => {
  test("fetches user profile successfully", async () => {
    const mockUser = {
      name: "John Doe",
      email: "john.doe@example.com",
      role: "user",
    };

    (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockUser });

    const consoleLogMock = jest
      .spyOn(console, "log")
      .mockImplementation(() => {});

    render(<About />);

    await waitFor(() => {
      expect(screen.getByText("User Profile")).toBeInTheDocument();
      expect(screen.queryByText("Loading...")).toBeNull();
    });

    consoleLogMock.mockRestore();

    expect(screen.getByText(/Full name/i).nextSibling?.textContent).toBe(
      mockUser.name
    );
    expect(screen.getByText(/Email address/i).nextSibling?.textContent).toBe(
      mockUser.email
    );
    expect(screen.getByText(/Role/i).nextSibling?.textContent).toBe(
      mockUser.role
    );

    expect(axios.get).toHaveBeenCalledWith(
      "http://localhost:9090/user-profile",
      {
        withCredentials: true,
      }
    );
  });
});
