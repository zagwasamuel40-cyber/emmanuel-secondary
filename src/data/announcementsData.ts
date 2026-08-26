import { useState, useEffect } from "react";

export interface Announcement {
  id: number;
  title: string;
  content?: string;
  date: string;
  active: boolean;
  category?: string;
  image?: string;
}

const initialAnnouncements: Announcement[] = [
  { 
    id: 1, 
    title: "End of Term Holiday", 
    content: "School will close for the end of term holiday on Dec 15, 2026. All students are expected to clear their lockers and submit borrowed library books.", 
    date: "Dec 15, 2026", 
    active: true, 
    category: "General",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80"
  },
  { 
    id: 2, 
    title: "New Library Books Available", 
    content: "New reference materials, science journals, and storybooks have arrived in the school library. Students are encouraged to visit during break periods.", 
    date: "Nov 10, 2026", 
    active: true, 
    category: "Academic",
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80"
  },
  { 
    id: 3, 
    title: "Science Fair Registration Open", 
    content: "All JSS and SSS students interested in participating in the annual science fair should register with their science teachers by the end of the week.", 
    date: "Oct 30, 2026", 
    active: true, 
    category: "Events",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80"
  }
];

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem("ess_announcements");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved announcements", e);
      }
    }
    return initialAnnouncements;
  });

  useEffect(() => {
    localStorage.setItem("ess_announcements", JSON.stringify(announcements));
  }, [announcements]);

  return [announcements, setAnnouncements] as const;
}
