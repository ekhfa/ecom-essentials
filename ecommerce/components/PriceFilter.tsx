"use client";
import React, { useState } from "react";

interface PriceFilterProps {
  onFilterChange: (min: number, max: number) => void;
  onFilterClear: () => void;
}

const PriceFilter: React.FC<PriceFilterProps> = ({ onFilterChange }) => {
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");

  const handleMinPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMinPrice(event.target.value === "" ? "" : Number(event.target.value));
  };

  const handleMaxPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMaxPrice(event.target.value === "" ? "" : Number(event.target.value));
  };

  const handleFilterClick = () => {
    const min = minPrice === "" ? 0 : minPrice;
    const max = maxPrice === "" ? Infinity : maxPrice;
    onFilterChange(min, max);
  };

  const handleClearFiltersClick = () => {
    setMinPrice("");
    setMaxPrice("");
    onFilterChange(0, Infinity);
  };

  return (
    <div className="flex items-center justify-center mt-4">
      <input
        type="number"
        placeholder="Min"
        value={minPrice}
        onChange={handleMinPriceChange}
        className="border-2 border-stone-500 rounded-lg px-2 py-1 w-20 mr-2"
      />
      <input
        type="number"
        placeholder="Max"
        value={maxPrice}
        onChange={handleMaxPriceChange}
        className="border-2 border-stone-500 rounded-lg px-2 py-1 w-20 mr-2"
      />
      <button
        onClick={handleFilterClick}
        className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 focus:outline-none"
      >
        Filter by Price
      </button>
      <button
        onClick={handleClearFiltersClick}
        className="ml-2 bg-gray-300 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-400 focus:outline-none"
      >
        Clear Filter
      </button>
    </div>
  );
};

export default PriceFilter;
