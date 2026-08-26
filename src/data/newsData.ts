import { useState, useEffect } from "react";

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
}

const initialNews: NewsItem[] = [
  { id: "1", title: "Welcome to a New Session", content: "We are excited to welcome all our students to the new academic session. Let's make it a great one!", date: new Date().toISOString() }
];

export function useNews() {
  const [news, setNews] = useState<NewsItem[]>(() => {
    const saved = localStorage.getItem("ess_news");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return initialNews;
  });

  useEffect(() => {
    localStorage.setItem("ess_news", JSON.stringify(news));
  }, [news]);

  return [news, setNews] as const;
}
