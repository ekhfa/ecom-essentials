import React from "react";
import axios from "axios";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";

import {
  getProductById,
  getUserRole,
  deleteProduct,
  getUserId,
  purchaseProduct,
} from "../page";

jest.mock("axios");
jest.mock("react-hot-toast");

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

describe("Single Product", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("getProductById returns data on success", async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: { mockProducts } });
    const result = await getProductById(1);
    expect(result).toEqual({ data: { mockProducts } });
  });

  test("getUserRole admin successfully", async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: { role: "admin" } });
    const result = await getUserRole();
    expect(result).toEqual("admin");
  });

  test("getUserRole user successfully", async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: { role: "user" } });
    const result = await getUserRole();
    expect(result).toEqual("user");
  });

  test("getUserId returns user ID on success", async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: { id: 123 } });
    const result = await getUserId();
    expect(result).toEqual(123);
  });

  test("purchaseProduct Successfully", async () => {
    const mockResponse = { success: true };
    const axiosPostMock = jest
      .spyOn(axios, "post")
      .mockResolvedValueOnce({ data: mockResponse });

    const result = await purchaseProduct(1, 123, 2);

    expect(result).toEqual(mockResponse);
    expect(axiosPostMock).toHaveBeenCalledWith(
      expect.stringContaining("/product/buy/1"),
      { userId: 123, quantity: 2 },
      expect.objectContaining({ withCredentials: true })
    );

    axiosPostMock.mockRestore();
  });
  test("DeleteProduct Successfully", async () => {
    const mockResponse = { success: true };
    const axiosDeleteMock = jest
      .spyOn(axios, "delete")
      .mockResolvedValueOnce({ data: mockResponse });

    const result = await deleteProduct(1);

    expect(result).toEqual(mockResponse);
    expect(axiosDeleteMock).toHaveBeenCalledWith(
      expect.stringContaining("/product/delete/1"),
      expect.objectContaining({ withCredentials: true })
    );

    axiosDeleteMock.mockRestore();
  });
});
