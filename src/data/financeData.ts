import { useState, useEffect } from "react";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  status: "Completed" | "Pending" | "Failed";
}

const initialTransactions: Transaction[] = [
  { id: "TRX-1029", date: "2026-07-21", description: "School Fees - John Doe (JSS1)", amount: 45000, type: "income", status: "Completed" },
  { id: "TRX-1028", date: "2026-07-20", description: "Lab Equipment Purchase", amount: 150000, type: "expense", status: "Completed" },
  { id: "TRX-1027", date: "2026-07-19", description: "School Fees - Jane Smith (SSS3)", amount: 65000, type: "income", status: "Completed" },
  { id: "TRX-1026", date: "2026-07-18", description: "Staff Salary Payment", amount: 2500000, type: "expense", status: "Pending" },
  { id: "TRX-1025", date: "2026-07-18", description: "Hostel Fee - Michael Obi (JSS2)", amount: 30000, type: "income", status: "Completed" },
];

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const stored = localStorage.getItem("ess_transactions");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return initialTransactions;
      }
    }
    return initialTransactions;
  });

  useEffect(() => {
    localStorage.setItem("ess_transactions", JSON.stringify(transactions));
  }, [transactions]);

  return [transactions, setTransactions] as const;
}
