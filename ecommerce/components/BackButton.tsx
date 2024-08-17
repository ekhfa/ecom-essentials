"use client";
import React from "react";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  text?: string;
  className?: string;
  onClick?: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({
  text = "Back",
  className = "",
  onClick,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onClick) {
      onClick();
      router.back();
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${className}`}
    >
      {text}
    </button>
  );
};

export default BackButton;
