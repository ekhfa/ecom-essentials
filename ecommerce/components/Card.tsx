import React from "react";

interface CardProps {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children }) => {
  return (
    <div className="md:w-1/2 lg:w-1/3 xl:w-1/3 mb-4 w-full px-4">
      <div className="overflow-hidden rounded-xl shadow-xl border">
        <div className="p-6 flex flex-col">{children}</div>
      </div>
    </div>
  );
};

export default Card;
