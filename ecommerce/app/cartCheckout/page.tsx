"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import io from "socket.io-client";

interface Product {
  id: number;
  image: string;
  title: string;
  price: number;
  quantity: number;
  product: {
    id: number;
    title: string;
    price: number;
  };
}

const page = () => {
  const router = useRouter();
  const [cartProducts, setCartProducts] = useState<Product[]>([]);
  const socket = io("http://localhost:9090/");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `http://localhost:9090/product/get-cart/checkout`,
          { withCredentials: true }
        );
        console.log("Cart Checkout Product:", response.data.products);
        setCartProducts(response.data.products);
      } catch (error) {
        console.log(error);
      }
    };
    fetchProducts();
  }, []);

  const handleConfirmPurchase = async () => {
    try {
      const productIdList = cartProducts.map((item) => item.product.id);
      const userProfileResponse = await axios.get(
        `http://localhost:9090/user-profile`,
        { withCredentials: true }
      );
      const userId = userProfileResponse.data?.id;

      if (!userId) {
        console.error("User ID not found");
        return;
      }

      for (const productId of productIdList) {
        const existingProduct = cartProducts.find(
          (item) => item.product.id === productId
        );

        if (existingProduct) {
          const productIndex = cartProducts.findIndex(
            (item) => item.product.id === productId
          );
          const updatedCartProducts = [...cartProducts];
          updatedCartProducts[productIndex].quantity += 1; // Update quantity as needed

          setCartProducts(updatedCartProducts);
        } else {
          const response = await axios.post(
            `http://localhost:9090/product/add-to-cart`,
            { productId },
            { withCredentials: true }
          );
          const newCartItem = response.data.product;

          setCartProducts((prevCartProducts) => [
            ...prevCartProducts,
            newCartItem,
          ]);
        }
      }

      console.log("Purchase confirmed successfully");
      socket.emit("orderPlaced", productIdList, userId);
      router.push("/");
    } catch (error) {
      console.log("Error Purchasing Product", error);
    }
  };

  const handleBackFromCheckout = async () => {
    try {
      const userProfileResponse = await axios.get(
        `http://localhost:9090/user-profile`,
        { withCredentials: true }
      );

      const userId = userProfileResponse.data?.id;

      if (!userId) {
        console.error("User ID not found");
        return;
      }

      await axios.post(
        `http://localhost:9090/product/cart/checkout/revert-checkout`,
        { userId },
        { withCredentials: true }
      );

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
          {cartProducts.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <span>{item.product.title}</span>
              <span> {item.quantity}</span>
              <span>${item.product.price}</span>
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
              (total, item) => total + item.product.price * item.quantity,
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

export default page;
