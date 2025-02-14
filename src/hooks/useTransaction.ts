// useTransaction.ts
import { useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';

interface UseTransactionProps {
  wallet: {
    publicKey: string;
    type: 'solana' | 'ethereum';
  };
}

export const useTransaction = ({ wallet }: UseTransactionProps) => {
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState(0);

  const initiateTransaction = (recipient: string, transactionAmount: number) => {
    setRecipientAddress(recipient);
    setAmount(transactionAmount);
    setIsTransactionModalOpen(true);
  };

  return {
    isTransactionModalOpen,
    setIsTransactionModalOpen,
    recipientAddress,
    amount,
    initiateTransaction
  };
};