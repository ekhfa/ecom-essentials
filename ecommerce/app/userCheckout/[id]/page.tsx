"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { propagateServerField } from "next/dist/server/lib/render-server";
import BackButton from "@/components/BackButton";
import { useCookies } from "react-cookie";
import socket from "@/app/socket";
import toast from "react-hot-toast";

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  status: string;
}
export const fetchProduct = async (productId: number): Promise<Product> => {
  try {
    const url = `http://localhost:9090/product/checkout/${productId}`;
    const response = await axios.get(url, { withCredentials: true });

    const { product } = response.data;

    if (product && typeof product === "object") {
      return product;
    } else {
      throw new Error("Invalid product data received");
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    throw new Error("Failed to fetch product");
  }
};

export const confirmPurchase = async (productId: number): Promise<void> => {
  try {
    const url = `http://localhost:9090/product/${productId}/status`;
    await axios.put(url, { status: "processing" }, { withCredentials: true });
  } catch (error) {
    console.log("Error Confirming Purchase", error);
    throw error;
  }
};

export const revertCheckout = async (userId: number): Promise<void> => {
  try {
    const url = `http://localhost:9090/product/revert-checkout`;
    await axios.post(url, { userId }, { withCredentials: true });
  } catch (error) {
    console.error("Error Reverting Checkout Status", error);
    throw error;
  }
};

const CheckoutPage = ({ params }: { params: { id: number } }) => {
  const router = useRouter();
  const [cookies, setCookie, removeCookie] = useCookies(["token"]);
  const [cartProducts, setCartProducts] = useState<Product[]>([]);
  const token = cookies.token;
  //console.log("Token", token);
  const fetchData = async () => {
    try {
      if (params.id) {
        const product = await fetchProduct(params.id);

        if (product) {
          setCartProducts([product]);
        } else {
          console.error("Invalid product data received:", product);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConfirmPurchase = async () => {
    try {
      await confirmPurchase(params.id);
      const url = `http://localhost:9090/user-profile`;

      const userProfileResponse = await axios.get(url, {
        withCredentials: true,
      });

      const userId = userProfileResponse.data?.id;

      if (!userId) {
        console.error("User ID not found");
        return;
      }

      const product = await fetchProduct(params.id);

      if (product) {
        setCartProducts([product]);

        console.log("Purchase confirmed successfully");
        toast.success("Purchase confirmed successfully");
        socket.emit("orderPlaced", {
          productId: params.id,
          userId,
          productDetails: product,
        });

        router.push("/");
      } else {
        console.error("Invalid product data received:", product);
      }
    } catch (error) {
      console.log("Error Purchasing Product", error);
    }
  };

  const handleBackFromCheckout = async () => {
    try {
      const url = `http://localhost:9090/user-profile`;
      const userProfileResponse = await axios.get(url, {
        withCredentials: true,
      });

      const userId = userProfileResponse.data?.id;

      if (!userId) {
        console.error("User ID not found");
        return;
      }

      await revertCheckout(userId);

      console.log("Checkout status reverted successfully");
    } catch (error) {
      console.error("Error reverting checkout status:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <BackButton onClick={handleBackFromCheckout} text="Back" />
      <h1 className="text-2xl font-bold mb-4 text-center">Checkout</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-100">
            <span className="font-bold">Product</span>
            <span className="font-bold">Quantity</span>
            <span className="font-bold">Price</span>
          </div>
        </div>
        <div>
          {cartProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <span>{product.name}</span>
              <span> {product.quantity}</span>
              <span>${product.price}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-between items-center">
          <span className="font-bold text-lg">Total:</span>
          <span className="font-bold text-lg">
            $
            {cartProducts.reduce(
              (total, product) => total + product.price * product.quantity,
              0
            )}
          </span>
        </div>
        <div className="mt-6 flex justify-center">
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none"
            onClick={handleConfirmPurchase}
          >
            Confirm Purchase
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
