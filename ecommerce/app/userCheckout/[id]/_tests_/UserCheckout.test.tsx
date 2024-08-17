import React from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import CheckoutPage, {
  fetchProduct,
  confirmPurchase,
  revertCheckout,
} from "../page";
import toast from "react-hot-toast";

jest.mock("axios");
jest.mock("react-hot-toast");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const useRouterMock = useRouter as jest.Mock;

describe("fetchProduct", () => {
  test("fetches successfully data from an API", async () => {
    const mockedProduct = {
      id: 1,
      name: "Test Product",
      price: 10,
      quantity: 2,
      status: "available",
    };

    (axios.get as jest.Mock).mockResolvedValue({
      data: { product: mockedProduct },
    });

    const result = await fetchProduct(1);

    expect(result).toEqual(mockedProduct);
  });

  test("handles API errors", async () => {
    (axios.get as jest.Mock).mockRejectedValue(new Error("API Error"));

    try {
      await fetchProduct(1);

      fail("Expected an error but got none.");
    } catch (error: any) {
      expect(error.message).toBe("Failed to fetch product");
    }
  });

  test("Update product status", async () => {
    (axios.put as jest.Mock).mockResolvedValue({});

    await expect(confirmPurchase(1)).resolves.toBeUndefined();
  });

  test("Revert checkout status", async () => {
    (axios.post as jest.Mock).mockResolvedValue({});

    await expect(revertCheckout(1)).resolves.toBeUndefined();
  });

  const mockParams = { id: 1 };
  test("fetches and renders product details", async () => {
    const mockedProduct = {
      id: 1,
      name: "Test Product",
      price: 10,
      quantity: 2,
      status: "available",
    };

    (axios.get as jest.Mock).mockResolvedValue({
      data: { product: mockedProduct },
    });

    render(<CheckoutPage params={mockParams} />);

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });
  });
});
