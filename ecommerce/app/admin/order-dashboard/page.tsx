"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import socket from "@/app/socket";
import { stat } from "fs";

const PurchasesPage = () => {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [cookies] = useCookies(["token"]);
  const [key, setKey] = useState(0);
  const token: string | undefined = cookies.token;

  const handleRealTimeOrder = (orderData: any) => {
    console.log("Real-time new order:", orderData);

    const { productDetails, ...orderDetails } = orderData;

    setPurchases((prevPurchases) => [
      { product: productDetails, ...orderDetails },
      ...prevPurchases,
    ]);
    console.log("Product details:", productDetails);
    setKey((prevKey) => prevKey + 1);
  };

  useEffect(() => {
    if (!token) return;

    socket.on("connect", () => {
      console.log("Connected to server");
      socket.emit("authenticate", token);
      socket.on("orderPlaced", handleRealTimeOrder);
    });

    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:9090/product/bought-by-user"
        );
        setPurchases(response.data);
        console.log("Fetched data");
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [token, key]);

  const handleStatusChange = async (productId: number, status: string) => {
    try {
      setPurchases((prevPurchases) =>
        prevPurchases.map((purchase) =>
          purchase.product.id === productId
            ? { ...purchase, status: status }
            : purchase
        )
      );

      console.log("Status: ", status);

      socket.emit("orderStatusChanged", { productId, status });

      const response = await axios.put(
        `http://localhost:9090/product/${productId}/status`,
        { status },
        { withCredentials: true }
      );

      console.log("Status updated to", status);
    } catch (error) {
      console.log("Error updating status:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center">
      <div>
        <h1 className="text-2xl font-bold mb-4 text-center">All Purchases</h1>
        {purchases.map((purchase, index) => (
          <div key={index} className="mb-4">
            <div className="border p-4 rounded shadow">
              <div>
                <h2 className="text-lg font-semibold mb-2">Products Bought</h2>
                {purchase.product && (
                  <div>
                    <p>
                      <strong>ID:</strong> {purchase.product.id || "N/A"}
                    </p>
                    <p>
                      <strong>Title:</strong> {purchase.product.title || "N/A"}
                    </p>
                    <div className="status-container">
                      <p>
                        <strong>Status:</strong> {purchase.product.status}
                      </p>
                      <label className="relative inline-flex items-center me-5 cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={purchase.status === "delivered"}
                          onChange={() =>
                            handleStatusChange(
                              purchase.product.id,
                              purchase.status === "delivered"
                                ? "processing"
                                : "delivered"
                            )
                          }
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                        <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                          {purchase.status === "delivered"
                            ? "Delivered"
                            : "Processing"}
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PurchasesPage;
