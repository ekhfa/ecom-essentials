"use client";
import React, { useEffect, useState } from "react";
import socket from "@/app/socket";
import { useCookies } from "react-cookie";

const UserNotificationPage = () => {
  const [notifications, setNotifications] = useState<string[]>([]);
  const [cookies] = useCookies(["token"]);
  const token: string | undefined = cookies.token;

  useEffect(() => {
    if (!token) return;

    socket.on("connect", () => {
      console.log("Connected to server");
      socket.emit("authenticate", token);
      socket.on(
        "orderStatusChanged",
        (data: { productId: number; status: string }) => {
          console.log("Received orderStatusChanged event:", data);
          const { productId, status } = data;
          console.log(status);
          const message = `Order status changed for Product Id ${productId} to ${status}`;
          console.log("New notification:", message);
          setNotifications((prevNotifications) => [
            message,
            ...prevNotifications,
          ]);
        }
      );
    });
  }, [notifications]);

  return (
    <div className="max-w-lg mx-auto mt-6">
      <h1 className="text-2xl font-bold mb-4 text-center">
        User Notifications
      </h1>
      <div className="space-y-4">
        {notifications.map((notification, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
          >
            <p>{notification}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserNotificationPage;
