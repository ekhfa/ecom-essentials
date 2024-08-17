import axios from "axios";
import { submitFormData } from "../page";

jest.mock("axios");

describe("submitFormData", () => {
  test("submits form data successfully", async () => {
    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: { success: true },
    });

    const formData = {
      title: "Test Product",
      price: 20,
      categories: "Test Category",
      quantity: 5,
      description: "This is a test product.",
      image: new File([""], "test-image.jpg", { type: "image/jpeg" }),
    };

    const response = await submitFormData(formData);

    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:9090/product/create",
      expect.any(FormData),
      {
        withCredentials: true,
      }
    );

    expect(response.data).toEqual({ success: true });
  });

  test("handles form submission failure", async () => {
    const errorMessage = "Submission failed";
    (axios.post as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    const formData = {
      title: "Test Product",
      price: 20,
      categories: "Test Category",
      quantity: 5,
      description: "This is a test product.",
      image: new File([""], "test-image.jpg", { type: "image/jpeg" }),
    };

    await expect(submitFormData(formData)).rejects.toThrow(errorMessage);
  });
});
