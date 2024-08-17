"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "@/components/Card";
import Link from "next/link";
import { parseCookies } from "nookies";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import BackButton from "@/components/BackButton";

interface Product {
  image: string;
  id: number;
  title: string;
  description: string;
  categories: string;
  price: number;
  quantity: number;
}

export const getProductById = async (productId: number) => {
  return await axios.get(`http://localhost:9090/products/${productId}`, {
    withCredentials: true,
  });
};

export const getUserRole = async () => {
  const userProfileResponse = await axios.get(
    `http://localhost:9090/user-profile`,
    { withCredentials: true }
  );
  return userProfileResponse.data?.role;
};

export const getUserId = async () => {
  const userProfileResponse = await axios.get(
    `http://localhost:9090/user-profile`,
    { withCredentials: true }
  );
  return userProfileResponse.data?.id;
};

export const purchaseProduct = async (
  productId: number,
  userId: number,
  quantity: number
) => {
  try {
    const response = await axios.post(
      `http://localhost:9090/product/buy/${productId}`,
      { userId, quantity },
      { withCredentials: true }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteProduct = async (productId: number) => {
  try {
    const response = await axios.delete(
      `http://localhost:9090/product/delete/${productId}`,
      { withCredentials: true }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addToCart = async (
  productId: number,
  userId: number,
  quantity: number
) => {
  return await axios.post(
    `http://localhost:9090/product/add-to-cart/${productId}`,
    { userId, quantity },
    { withCredentials: true }
  );
};

const SingleProduct = ({ params }: { params: { id: number } }) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const fetchData = async () => {
    try {
      if (params.id) {
        const response = await getProductById(params.id);
        setProduct(response.data);
        console.log("Fetched Product Successfully");
      }
      await fetchUserData();
    } catch (error: any) {
      console.log("Error Fetching Product");
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchUserData = async () => {
    try {
      const token = parseCookies().token;
      setIsLoggedIn(!!token);

      if (!token) {
        return;
      }

      const userRole = await getUserRole();
      console.log("Fetched User Role Successfully");

      if (userRole === "admin") {
        setIsAdmin(true);
      }
    } catch (error: any) {
      console.log("Error fetching user data");
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      if (product && product.id) {
        await deleteProduct(product.id);
        console.log("Product deleted successfully");
        toast.error("Product deleted successfully");

        setProduct(null);
        setIsDeleting(false);

        setTimeout(() => {
          router.push(`/products/`);
        }, 1000);
      }
    } catch (error: any) {
      console.log("Error Deleting Product");
    }
  };

  const handleBuy = async () => {
    try {
      const userId = await getUserId();
      console.log("Fetched User Id Successfully");

      if (!userId) {
        console.error("User ID not found");
        return;
      }

      await purchaseProduct(params.id, userId, selectedQuantity);
      console.log("Product added to Checkout");
      toast.success("Product added  to Checkout");
      setSelectedQuantity(1);
      router.push(`/userCheckout/${params.id}`);
    } catch (error) {
      console.log("Error adding to Checkout");
    }
  };

  const increaseQuantity = () => {
    setSelectedQuantity((prevQuantity) => prevQuantity + 1);
  };

  const decreaseQuantity = () => {
    setSelectedQuantity((prevQuantity) =>
      prevQuantity > 1 ? prevQuantity - 1 : 1
    );
  };

  const handleAddToCart = async () => {
    try {
      const userId = await getUserId();
      if (!userId) {
        console.error("User ID not found");
        return;
      }

      await addToCart(params.id, userId, selectedQuantity);
      console.log("Product added to Cart");
      toast.success("Product added  to Cart!");
    } catch (error: any) {
      console.log("Error adding product to the Cart");
    }
  };

  return (
    <section className="py-12">
      <div className="max-w-screen-xl container mx-auto px-4">
        <BackButton />
        <div className="md:flex-row -mx-4 flex justify-center items-center h-full">
          {product ? (
            <Card>
              <Link href={`/products/${product.id}`} passHref>
                <div className="flex flex-col h-full justify-between">
                  <div className="bg-sky-300">
                    <img
                      className="object-fill h-48 w-96"
                      src={"http://localhost:9090/images/" + product.image}
                    />
                  </div>

                  <div className="mt-4">
                    <h2 className="text-xl font-semibold">{product.title}</h2>
                    <p className="mt-2 text-md">
                      Category: {product.categories}
                    </p>
                    <p className="mt-2 text-lg">{product.description}</p>

                    <p className="mt-2 text-lg">Price: ${product.price}</p>
                    <div className="flex items-center mt-4 justify-center">
                      <button
                        type="button"
                        onClick={decreaseQuantity}
                        className="text-sm bg-gray-200 py-1 px-2 rounded-l focus:outline-none"
                      >
                        -
                      </button>
                      <span className="px-2">{selectedQuantity}</span>
                      <button
                        type="button"
                        onClick={increaseQuantity}
                        className="text-sm bg-gray-200 py-1 px-2 rounded-r focus:outline-none"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    {isLoggedIn && isAdmin && (
                      <>
                        <Link href={`/products/update/${product.id}`} passHref>
                          <button className="px-4 mt-4 bg-buttonColor hover:bg-buttonColor text-white py-2 px-4 rounded-md shadow-md">
                            Update
                          </button>
                        </Link>

                        <button
                          className="px-4 mt-4 bg-buttonColor hover:bg-buttonColor text-white py-2 px-4 rounded-md shadow-md"
                          onClick={handleDelete}
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                      </>
                    )}
                  </div>

                  <div className="flex justify-between">
                    {isLoggedIn && !isAdmin && (
                      <>
                        <button
                          className="px-4 mt-4 bg-buttonColor hover:bg-buttonColor text-white py-2 px-4 rounded-md shadow-md"
                          onClick={handleBuy}
                        >
                          Buy Now
                        </button>

                        <button
                          className="px-4 mt-4 bg-buttonColor hover:bg-buttonColor text-white py-2 px-4 rounded-md shadow-md"
                          onClick={handleAddToCart}
                        >
                          Add to Cart
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            </Card>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default SingleProduct;
