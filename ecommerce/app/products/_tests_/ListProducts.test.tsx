import React from "react";
import axios from "axios";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import ListProducts from "../page";

jest.mock("axios");

const mockProducts = [
  {
    id: 1,
    title: "Product 1",
    description: "Description 1",
    categories: "Electronics",
    price: 50,
    quantity: 10,
    image: null,
  },
];

const mockUserResponse = {
  role: "admin",
};

describe("ListProducts Component", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("fetches and displays products", async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: { products: mockProducts, totalPages: 1 },
    });
    (axios.post as jest.Mock).mockResolvedValueOnce({ data: mockUserResponse });

    render(<ListProducts />);

    await waitFor(() => {
      expect(screen.getByText("Product 1")).toBeInTheDocument();
    });
  });

  test("handles error fetching products", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error");
    (axios.get as jest.Mock).mockRejectedValueOnce(
      new Error("Error fetching products")
    );

    render(<ListProducts />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching products:",
        expect.any(Error)
      );
    });
  });

  test("filters products based on category", async () => {
    const mockFilteredProducts = [
      {
        id: 2,
        title: "Product 2",
        description: "Description 2",
        categories: "Snacks",
        price: 30,
        quantity: 15,
        image: null,
      },
    ];

    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: { products: mockFilteredProducts, totalPages: 1 },
    });

    render(<ListProducts />);

    fireEvent.click(screen.getByText("Snacks"));

    await waitFor(() => {
      expect(screen.getByText("Product 2")).toBeInTheDocument();
      expect(screen.queryByText("Product 1")).toBeNull();
    });
  });
});
