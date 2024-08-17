"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";

interface user {
  name: string;
  email: string;
  role: string;
}

const About = () => {
  const [userProfile, setUserProfile] = useState<user | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      const url = "http://localhost:9090/user-profile";
      const response = await axios.get(url, {
        withCredentials: true,
      });
      setUserProfile(response.data);
      console.log("user profile fetched successfully!");
    } catch (error: any) {
      console.error("Error fetching user profile", error.message);
      setError("Error fetching user profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <section className="py-12">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        {userProfile ? (
          <div className="bg-white overflow-hidden shadow rounded-lg border">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                User Profile
              </h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Full name
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {userProfile.name}
                  </dd>
                </div>
                <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Email address
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {userProfile.email}
                  </dd>
                </div>
                <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Role</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {userProfile.role}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        ) : (
          <p> Loading ... </p>
        )}
      </div>
    </section>
  );
};

export default About;
