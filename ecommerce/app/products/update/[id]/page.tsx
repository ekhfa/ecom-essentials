"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface UpdateProps {
  params: { id: number };
}

interface UpdateFormData {
  title: string;
  description: string;
  categories: string;
  price: number;
  quantity: number;
  image: File | null;
}

const Update: React.FC<UpdateProps> = ({ params }) => {
  const router = useRouter();
  const [product, setProduct] = useState<UpdateFormData | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateFormData>({
    title: "",
    description: "",
    categories: "",
    price: 0,
    quantity: 0,
    image: null,
  });

  useEffect(() => {
    fetchSingleProduct();
  }, [params.id]);

  const fetchSingleProduct = async () => {
    try {
      if (params.id) {
        const response = await axios.get(
          `http://localhost:9090/products/${params.id}`
        );
        setProduct(response.data);
        setFormData(response.data);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      const formDataToSend = prepareFormData(formData);
      const url = `http://localhost:9090/product/update/${params.id}`;

      const response = await axios.put(url, formDataToSend, {
        withCredentials: true,
      });

      console.log("Product updated:", response.data);
      setTimeout(() => {
        router.push(`/products/${params.id}`);
      }, 1000);
    } catch (error: any) {
      console.error("An error occurred while updating:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];

    if (file) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        image: file,
      }));

      updateImagePreview(file);
    }
  };

  const updateImagePreview = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const prepareFormData = (formData: UpdateFormData): FormData => {
    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("price", formData.price.toString());
    formDataToSend.append("categories", formData.categories);
    formDataToSend.append("quantity", formData.quantity.toString());
    formDataToSend.append("description", formData.description);

    if (formData.image instanceof File) {
      formDataToSend.append("image", formData.image);
    }

    return formDataToSend;
  };

  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="py-4 px-4 mx-auto max-w-2xl lg:py-8">
        <h2 className="mb-4 text-xl font-bold text-center text-gray-900 dark:text-white">
          Update product
        </h2>
        {product && (
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Current Product Image
            </label>
            <img
              className="object-fill h-24 w-24"
              src={
                imagePreview
                  ? imagePreview
                  : product && product.image
                  ? "http://localhost:9090/images/" + product.image
                  : "http://localhost:9090/images/no-image.jpeg"
              }
              alt="Product Preview"
            />
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 mt-4">
            <div className="sm:col-span-2 flex flex-col">
              <label
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                htmlFor="file_input"
              >
                Upload Your Product Picture
              </label>

              <input
                id="file_input"
                type="file"
                accept="image/*" // Restrict to image files
                onChange={handleFileChange}
                className="block w-full text-lg text-gray-900 border border-gray-300 rounded-sm cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
              />
              <div className="flex gap-4">
                <div className="flex flex-col w-1/2 mt-6">
                  <label
                    htmlFor="title"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    placeholder="Type product name"
                    required
                  />
                </div>

                <div className="flex flex-col w-1/2 mt-6">
                  <label
                    htmlFor="price"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Price
                  </label>
                  <input
                    type="number"
                    name="price"
                    id="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    placeholder="$2999"
                    required
                  />
                </div>
              </div>
            </div>
            <div>
              <label
                htmlFor="categories"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Category
              </label>
              <input
                type="text"
                id="categories"
                name="categories"
                value={formData.categories}
                onChange={handleInputChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                placeholder="Type product Category"
                required
              />
            </div>
            <div>
              <label
                htmlFor="quantity"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                id="quantity"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                placeholder="12"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="description"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Description
              </label>
              <textarea
                name="description"
                id="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                placeholder="Your description here"
              ></textarea>
            </div>
          </div>
          <div className="flex justify-center items-center h-full">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center px-5 py-2.5 mt-4 sm:mt-6 text-sm font-medium text-center text-white bg-primary-700 rounded-lg focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 hover:bg-primary-800"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Update;
