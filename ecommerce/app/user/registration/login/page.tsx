"use client";
import React, { useState, ChangeEvent, useRef, useEffect } from "react";
import Link from "next/link";
import axios, { AxiosResponse } from "axios";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  useGoogleLogin,
} from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginResponse {
  message: string;
  token: string;
}

interface Router {
  push(route: string): void;
}

export const loginService = async (
  formData: LoginFormData,
  router: Router
): Promise<void> => {
  try {
    const url = "http://localhost:9090/login";
    console.log("Login service called with formData:", formData);
    const response: AxiosResponse<LoginResponse> = await axios.post(
      url,
      formData
    );
    console.log("Login service response:", response);

    if (response.status === 200 || response.status === 201) {
      console.log("Login successful!");
      toast.success("Login successful!");
      Cookies.set("token", response.data.token, { expires: 1 / 24 });
      router.push("/");
    } else {
      console.error("Login failed");
      toast.error("Login failed");
    }
  } catch (error: any) {
    console.log(error);
    toast.error("Login failed");
  }
};

const login: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    console.log("Input Changed - Name:", name, "Value:", value);
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted with data:", formData);
    await loginService(formData, router);
  };

  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    var decodedGoogleUser = jwtDecode(credentialResponse.credential);
    console.log(decodedGoogleUser);
    try {
      const response = await axios.post(
        "http://localhost:9090/google-auth",
        decodedGoogleUser
      );
      if (response.status === 200 || response.status === 201) {
        console.log("Google Login successful!");
        toast.success("Google Login successful!");

        Cookies.set("token", response.data.token, { expires: 1 / 24 });
        router.push("/");
      } else {
        console.error("Google Login failed");
        toast.success("Google Login Failed!");
      }
    } catch (error) {
      console.log(error);
      toast.success("Google Login Failed!");
    }
  };

  const handleGoogleLoginError = () => {
    toast.error("Google Login failed");
    console.log("Login failed");
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-6 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700 border">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white text-center">
              Sign In
            </h1>
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <GoogleOAuthProvider clientId="679964972003-j48n55fotsid9ld6v8nvto3g9ihnqa0e.apps.googleusercontent.com">
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={handleGoogleLoginError}
                  useOneTap
                />
              </GoogleOAuthProvider>

              <div className="mt-4 grid grid-cols-3 items-center text-gray-400">
                <hr className="border-gray-400" />
                <p className="text-center text-sm">OR</p>
                <hr className="border-gray-400" />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Your email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="name@company.com"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="remember"
                      aria-describedby="remember"
                      type="checkbox"
                      className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                      required
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="remember"
                      className="text-gray-500 dark:text-gray-300"
                    >
                      Remember me
                    </label>
                  </div>
                </div>
                <Link href="/user/registration/password/reset" passHref>
                  <span className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">
                    Forgotten password?
                  </span>
                </Link>
              </div>
              <button
                type="submit"
                className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              >
                Sign in
              </button>
              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Don't have an account yet?
                <Link href="/user/registration" passHref>
                  <span className="cursor-pointer font-medium text-primary-600 dark:text-primary-500">
                    <span className="hover:underline"> Sign Up</span>
                  </span>
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default login;
