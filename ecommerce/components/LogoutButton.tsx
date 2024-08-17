"use client";
import React from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Router from "next/router";
import toast from "react-hot-toast";

const LogoutButton: React.FC = () => {
  const router = useRouter();
  const handleLogout = async () => {
    try {
      const response = await axios.post("http://localhost:9090/logout", null, {
        withCredentials: true,
      });
      if (response.status === 200) {
        console.log("Logout successful");
        toast.success("Logout Sucessful!");
        router.push("/");
        //window.location.reload();
      } else {
        console.error("Logout failed");
        toast.error("Logout failed!");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Logout failed!");
    }
  };

  return (
    <button onClick={handleLogout} className="cursor-pointer">
      Log Out
    </button>
  );
};

export default LogoutButton;
