import { useState, useEffect } from "react";

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  status: "Unread" | "Read" | "Replied";
}

const defaultInquiries: Inquiry[] = [
  {
    id: "INQ-001",
    name: "John Doe",
    email: "johndoe@example.com",
    subject: "Admission Requirements",
    message: "Hello, I would like to know the required documents for JSS 1 admission.",
    date: new Date().toISOString(),
    status: "Unread",
  }
];

export function useInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>(() => {
    const saved = localStorage.getItem("ess_inquiries");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved inquiries", e);
      }
    }
    return defaultInquiries;
  });

  useEffect(() => {
    localStorage.setItem("ess_inquiries", JSON.stringify(inquiries));
  }, [inquiries]);

  return [inquiries, setInquiries] as const;
}
