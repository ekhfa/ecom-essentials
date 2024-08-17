"use client";
import React, { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import Link from "next/link";
import Card from "@/components/Card";
import CategoryFilter from "@/components/CategoryFilter";
import Pagination from "@/components/Pagination";
import PriceFilter from "@/components/PriceFilter";
import { parseCookies } from "nookies";

interface Product {
  id: number;
  title: string;
  description: string;
  categories: string;
  price: number;
  quantity: number;
  image: File | null | string;
}

interface Filters {
  minPrice: number | "";
  maxPrice: number | "";
  selectedCategory: string | null;
}

const ListProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    minPrice: "",
    maxPrice: "",
    selectedCategory: null,
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const predefinedCategories = [
    "Electronics",
    "Snacks",
    "Groceries",
    "Makeup",
    "Sports",
  ];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (min: number, max: number) => {
    setFilters({ ...filters, minPrice: min, maxPrice: max });
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ ...filters, minPrice: "", maxPrice: "" });
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string | null) => {
    setFilters({ ...filters, selectedCategory: category });
    setCurrentPage(1);
  };

  const fetchUserData = async () => {
    try {
      const token = parseCookies().token;
      setIsLoggedIn(!!token);

      if (!token) {
        return;
      }

      const url = `http://localhost:9090/user-profile`;

      const userProfileResponse = await axios.get(url, {
        withCredentials: true,
      });

      const userRole = userProfileResponse.data?.role;
      console.log(userRole);

      if (userRole === "admin") {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchProducts = async (page: number) => {
    setIsLoading(true);
    try {
      let url = `http://localhost:9090/products?page=${page}`;

      if (filters.minPrice !== "" && filters.maxPrice !== "") {
        url += `&min=${filters.minPrice}&max=${filters.maxPrice}`;
      }

      if (filters.selectedCategory) {
        url += `&category=${filters.selectedCategory}`;
      }
      if (isLoggedIn && isAdmin && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      console.log(url);
      const response = await axios.get(url);
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
      setCurrentPage(page);
      await fetchUserData();
    } catch (error: any) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [
    currentPage,
    filters.minPrice,
    filters.maxPrice,
    filters.selectedCategory,
    startDate,
    endDate,
    isLoggedIn,
    isAdmin,
  ]);

  return (
    <section className="py-4">
      <CategoryFilter
        categories={predefinedCategories}
        onCategoryChange={handleCategoryChange}
      />

      <PriceFilter
        onFilterChange={handleFilterChange}
        onFilterClear={handleClearFilters}
      />
      {isLoggedIn && isAdmin && (
        <div className="flex items-center justify-center mt-4">
          <input
            type="date"
            className="border-2 border-stone-500 rounded-lg p-2 mr-2"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="border-2 border-stone-500 rounded-lg p-2 mr-2"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button
            //onClick={handleDateRangeChange}
            className="bg-gray-300 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-400 focus:outline-none"
          >
            Clear Date Range
          </button>
        </div>
      )}

      <div className="max-w-screen-xl container mx-auto px-4 mt-8">
        <div className="md:flex-row -mx-4 flex flex-wrap">
          {products.map((product) => (
            <Card key={product.id}>
              <Link href={`/products/${product.id}`} passHref>
                <div className="flex flex-col h-full justify-between">
                  <div className="bg-sky-300">
                    <img
                      className="object-fill h-48 w-96"
                      src={
                        product.image
                          ? "http://localhost:9090/images/" + product.image
                          : "http://localhost:9090/images/no-image.jpeg"
                      }
                    />
                  </div>

                  <div className="mt-4">
                    <h2 className="text-xl font-semibold">{product.title}</h2>
                    <p className="mt-2 text-md">
                      Category: {product.categories}
                    </p>
                    <p className="mt-2 text-lg">
                      {product.description.substring(0, 25)}...
                    </p>
                    <p className="mt-2 text-lg font-semibold">
                      ${product.price}
                    </p>
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      </div>
      <div className="flex justify-center items-center mt-8">
        {!isLoading && (
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </section>
  );
};

export default ListProducts;
