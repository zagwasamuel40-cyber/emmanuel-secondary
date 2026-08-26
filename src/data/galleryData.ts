import { useState, useEffect } from "react";

export interface GalleryItem {
  id: string;
  url: string;
  caption: string;
  category: "Staff" | "Facilities" | "Events" | "Students" | "Other";
}

const initialGallery: GalleryItem[] = [
  {
    id: "GAL-001",
    url: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80",
    caption: "Our Dedicated Teaching Staff",
    category: "Staff"
  },
  {
    id: "GAL-002",
    url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80",
    caption: "Modern Science Laboratory",
    category: "Facilities"
  },
  {
    id: "GAL-003",
    url: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=600&q=80",
    caption: "Annual Inter-House Sports",
    category: "Events"
  }
];

export function useGallery() {
  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    const saved = localStorage.getItem("ess_gallery");
    if (saved) return JSON.parse(saved);
    return initialGallery;
  });

  useEffect(() => {
    localStorage.setItem("ess_gallery", JSON.stringify(gallery));
  }, [gallery]);

  return [gallery, setGallery] as const;
}
