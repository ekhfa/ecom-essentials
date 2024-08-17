"use client";
import React, { useState, ChangeEvent, useRef } from "react";
import Link from "next/link";
import axios, { AxiosResponse } from "axios";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

interface User {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegistrationResponse {
  message: string;
}

interface Router {
  push(route: string): void;
}

export const registrationService = async (
  formData: User,
  router: Router,
  setFormData: React.Dispatch<React.SetStateAction<User>>,
  setRegistrationSuccess: React.Dispatch<React.SetStateAction<boolean>>
): Promise<void> => {
  try {
    const url = "http://localhost:9090/registration";
    console.log("Registration service called with formData:", formData);
    const response: AxiosResponse<RegistrationResponse> = await axios.post(
      url,
      formData
    );
    console.log("Registration service response:", response);

    if (response.status === 200 || response.status === 201) {
      console.log("Registration successful!");

      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setRegistrationSuccess(true);

      toast.success("Registration successful!");

      router.push("/user/registration/login");
    } else {
      console.error("Registration failed");
      setRegistrationSuccess(false);
      toast.error("Registration failed. Please try again.");
    }
  } catch (error: any) {
    console.log("Error", error);
    setRegistrationSuccess(false);
    if (error.response && error.response.status === 400) {
      toast.error("Email already exists. Please use a different email.");
    }
  }
};

const register: React.FC = () => {
  const router = useRouter();
  const [registrationSuccess, setRegistrationSuccess] =
    useState<boolean>(false);
  const [formData, setFormData] = useState<User>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    if (formData.password !== formData.confirmPassword) {
      console.log("Passwords do not match");
      return;
    }

    try {
      await registrationService(
        formData,
        router,
        setFormData,
        setRegistrationSuccess
      );
    } catch (error: any) {
      console.log("Error", error);
      setRegistrationSuccess(false);
    }
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
    <div>
      <div className="flex flex-col items-center justify-center px-6 pt-8 pb-16 mx-auto md:pt-12 md:pb-24 lg:pb-32">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md md:max-w-md lg:max-w-xl xl:max-w-2xl xl:p-4 dark:bg-gray-800 dark:border-gray-700 border border-borderColor">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white text-center">
              Create Account
            </h1>
            <form className="space-y-6 md:space-y-6" onSubmit={handleSubmit}>
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
                  htmlFor="name"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Type Your Name
                </label>
                <input
                  type="name"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Your Name"
                  required
                />
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
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Confirm password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <button
                  disabled={registrationSuccess}
                  type="submit"
                  className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                >
                  Create an account
                </button>
              </div>

              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Already have an account?
                <Link href="/user/registration/login" passHref>
                  <span className="cursor-pointer font-medium text-primary-600 dark:text-primary-500">
                    <span className="hover:underline"> Login here </span>
                  </span>
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default register;
