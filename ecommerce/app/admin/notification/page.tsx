"use client";
import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { useCookies } from "react-cookie";

const AdminNotificationPage = () => {
  const [notifications, setNotifications] = useState<string[]>([]);
  const [cookies] = useCookies(["token"]);

  const token: string | undefined = cookies.token;
  //console.log("Token", token);

  useEffect(() => {
    if (!token) return;

    const socket = io("http://localhost:9090/");

    socket.on("connect", () => {
      console.log("Connected to server");

      socket.emit("authenticate", token);
    });

    socket.on("orderPlaced", (message: string) => {
      setNotifications((prevNotifications) => [message, ...prevNotifications]);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  return (
    <div className="max-w-lg mx-auto mt-6">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Admin Notifications
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

export default AdminNotificationPage;
