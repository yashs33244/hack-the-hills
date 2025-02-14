import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { TransactionModal } from "./TransactionModel";

export const TransactionButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-500 hover:bg-blue-600 text-white"
      >
        New Transaction
      </Button>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default TransactionButton;
