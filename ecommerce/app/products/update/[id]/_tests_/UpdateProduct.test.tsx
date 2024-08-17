import React from "react";
import axios from "axios";
import {
  act,
  render,
  screen,
  waitFor,
  fireEvent,
} from "@testing-library/react";
import { useRouter } from "next/navigation";
import Update from "../page";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("axios");

const useRouterMock = useRouter as jest.Mock;

describe("Update Component", () => {
  const mockProducts = {
    id: 1,
    title: "Product 1",
    description: "Description 1",
    categories: "Electronics",
    price: 50,
    quantity: 10,
    image: null,
  };

  const mockParams = { id: 1 };

  beforeEach(() => {
    useRouterMock.mockReturnValue({
      query: mockParams,
    });

    (axios.get as jest.Mock).mockResolvedValue({ data: mockProducts });
    (axios.put as jest.Mock).mockResolvedValue({ data: "Updated" });
  });

  test("renders update form with product data", async () => {
    render(<Update params={mockParams} />);

    await waitFor(() => {
      expect(screen.getByLabelText("Product Name")).toHaveValue(
        mockProducts.title
      );
      expect(screen.getByLabelText("Price")).toHaveValue(mockProducts.price);
    });
  });

  test("submits form and updates product", async () => {
    const mockProduct = {
      title: "Updated Product",
      description: "Updated Description",
      categories: "Electronics",
      price: 60,
      quantity: 0,
      image: null,
    };

    (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockProduct });

    render(<Update params={{ id: 1 }} />);

    fireEvent.submit(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "http://localhost:9090/product/update/1",
        expect.any(FormData),
        expect.any(Object)
      );
    });
  });
});
