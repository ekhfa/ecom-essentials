import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import axios from "axios";
import Cart from "../page";
import { useRouter } from "next/navigation";

jest.mock("axios");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("Cart component", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("renders Cart component with empty cart", async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: { products: [] },
    });

    await act(async () => {
      render(<Cart />);
    });

    const emptyCartMessage = screen.getByText("Your cart is empty");
    expect(emptyCartMessage).toBeInTheDocument();
  });

  test("renders Cart component with products", async () => {
    const mockCartData = [
      {
        id: 1,
        product: {
          id: 1,
          title: "Test Product",
          price: 20,
        },
        quantity: 2,
      },
    ];

    (axios.get as jest.Mock).mockResolvedValue({
      data: { products: mockCartData },
    });

    await act(async () => {
      render(<Cart />);
    });

    const productTitle = screen.getByText("Test Product");
    expect(productTitle).toBeInTheDocument();
  });
});
