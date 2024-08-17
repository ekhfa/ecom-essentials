import React, { useState } from "react";

interface CategoryFilterProps {
  categories: string[];
  onCategoryChange: (category: string | null) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  onCategoryChange,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category === selectedCategory ? null : category);
    onCategoryChange(category === selectedCategory ? null : category);
  };

  const handleClearFilter = () => {
    setSelectedCategory(null);
    onCategoryChange(null);
  };

  return (
    <div className="flex items-center justify-center mt-4">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => handleCategoryChange(category)}
          className={`${
            selectedCategory === category
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700"
          } px-3 py-1 rounded-lg border border-gray-300 border-2 border-stone-500 hover:bg-blue-600 hover:text-white focus:outline-none mr-2`}
        >
          {category}
        </button>
      ))}
      <button
        onClick={handleClearFilter}
        className="bg-gray-300 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-400 focus:outline-none"
      >
        Clear Filter
      </button>
    </div>
  );
};

export default CategoryFilter;
