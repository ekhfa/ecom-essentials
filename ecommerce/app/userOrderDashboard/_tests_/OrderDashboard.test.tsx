import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import axios from "axios";
import OrderDashboard from "../page";

jest.mock("axios");

describe("OrderDashboard", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test("renders Order Dashboard products successfully", async () => {
    const mockProducts = [
      {
        id: 1,
        title: "Product 1",
        price: 10,
        quantity: 5,
        status: "In Stock",
        product: {
          id: 101,
          title: "Product 1",
          price: 10,
        },
      },
    ];

    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: { products: mockProducts },
    });

    render(<OrderDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Order Dashboard")).toBeInTheDocument();
    });

    expect(screen.getByText("Product 1")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("$10")).toBeInTheDocument();
    expect(screen.getByText("In Stock")).toBeInTheDocument();
  });
});
