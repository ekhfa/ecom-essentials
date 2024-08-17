"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import toast from "react-hot-toast";
import axios from "axios";

const Header: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const checkLoggedInStatus = async () => {
    try {
      const response = await axios.get(`http://localhost:9090/user-profile`, {
        withCredentials: true,
      });
      setUserRole(response.data.role);
      setIsLoggedIn(true);
      console.log(response.data.role);
    } catch (error) {
      console.error("Error fetching user role:", error);
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    checkLoggedInStatus();

    // const interval = setInterval(() => {
    //   checkLoggedInStatus();
    // }, 1000);

    // return () => clearInterval(interval);
  }, []);

  return (
    <div className="navbar bg-base-300">
      <div className="flex-1">
        <Link href="/" passHref>
          <div className="btn btn-ghost text-xl">Ecommerce</div>
        </Link>
      </div>
      <div className="dropdown dropdown-end">
        <div
          tabIndex={0}
          role="button"
          className="btn btn-ghost btn-circle avatar"
        >
          <div className="w-10 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              data-name="Layer 1"
              viewBox="0 0 29 29"
              id="user"
            >
              <path d="M14.5 2A12.514 12.514 0 0 0 2 14.5 12.521 12.521 0 0 0 14.5 27a12.5 12.5 0 0 0 0-25Zm7.603 19.713a8.48 8.48 0 0 0-15.199.008A10.367 10.367 0 0 1 4 14.5a10.5 10.5 0 0 1 21 0 10.368 10.368 0 0 1-2.897 7.213ZM14.5 7a4.5 4.5 0 1 0 4.5 4.5A4.5 4.5 0 0 0 14.5 7Z"></path>
            </svg>
          </div>
        </div>
        <ul
          tabIndex={0}
          className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
        >
          {isLoggedIn ? (
            <>
              {userRole === "admin" ? (
                <>
                  <li>
                    <Link href="/products/create" passHref>
                      <div className="justify-between">
                        Add Product
                        <span className="badge"> new </span>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/order-dashboard" passHref>
                      <div className="justify-between">Order Dashboard</div>
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/notification" passHref>
                      <div className="justify-between">Notification</div>
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link href="/userprofile" passHref>
                      <div className="justify-between">About</div>
                    </Link>
                  </li>
                  <li>
                    <Link href="/userOrderDashboard" passHref>
                      <div className="justify-between">Order Dashboard</div>
                    </Link>
                  </li>
                  <li>
                    <Link href="/userCart" passHref>
                      <div className="justify-between">Cart</div>
                    </Link>
                  </li>
                  <li>
                    <Link href="/userNotification" passHref>
                      <div className="justify-between">Notifications</div>
                    </Link>
                  </li>
                </>
              )}
              <li>
                <LogoutButton />
              </li>
            </>
          ) : null}
          {!isLoggedIn && (
            <li>
              <Link href="/user/registration/login" passHref>
                <div className="justify-between">Sign In</div>
              </Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Header;
