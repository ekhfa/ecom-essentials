"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

interface Product {
  id: number;
  title: string;
  price: number;
  quantity: number;
  status: string;
  product: {
    id: number;
    title: string;
    price: number;
  };
}

const OrderDashboard = () => {
  const [dashboardProducts, setDashboardProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string>("");

  const fetchProducts = async () => {
    try {
      const url = `http://localhost:9090/product/order-dashboard`;
      const response = await axios.get(url, { withCredentials: true });
      setDashboardProducts(response.data.products);
      console.log("Fetched Order Dashboard Products");
    } catch (error: any) {
      console.log("Error Fetching Order Dashboard Products");
      setError("Error Fetching Order Dashboard Products");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Order Dashboard</h1>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-100">
            <span className="font-bold">Product</span>
            <span className="font-bold">Quantity</span>
            <span className="font-bold">Price</span>
            <span className="font-bold">Status</span>
          </div>
        </div>
        <div>
          {dashboardProducts.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <span>{item.product?.title}</span>
              <span>{item.quantity}</span>
              <span>${item.product?.price}</span>
              <span>{item.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderDashboard;
