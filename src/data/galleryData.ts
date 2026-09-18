import { useState, useEffect } from "react";

export interface GalleryItem {
  id: string;
  url: string;
  caption: string;
  category: "Staff" | "Facilities" | "Events" | "Students" | "Other";
  mediaType?: "image" | "video";
  videoSource?: "upload" | "youtube" | "vimeo" | "direct";
  thumbnail?: string;
  duration?: string;
  fileSize?: string;
  createdAt?: string;
}

const initialGallery: GalleryItem[] = [
  {
    id: "GAL-001",
    url: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80",
    caption: "Our Dedicated Teaching Staff",
    category: "Staff",
    mediaType: "image"
  },
  {
    id: "GAL-VID-001",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    caption: "Annual Inter-House Sports & Relay Race Finale Highlights",
    category: "Events",
    mediaType: "video",
    videoSource: "direct",
    thumbnail: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=600&q=80",
    duration: "2:45",
    fileSize: "14.8 MB"
  },
  {
    id: "GAL-002",
    url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80",
    caption: "Modern Science Laboratory Complex",
    category: "Facilities",
    mediaType: "image"
  },
  {
    id: "GAL-VID-002",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    caption: "Campus Tour & Digital Library Innovation Walkthrough",
    category: "Facilities",
    mediaType: "video",
    videoSource: "direct",
    thumbnail: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80",
    duration: "3:10",
    fileSize: "19.2 MB"
  },
  {
    id: "GAL-003",
    url: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=600&q=80",
    caption: "Annual Inter-House Sports Celebrations",
    category: "Events",
    mediaType: "image"
  }
];

export function useGallery() {
  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    const saved = localStorage.getItem("ess_gallery");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.warn("Error parsing ess_gallery:", e);
      }
    }
    return initialGallery;
  });

  useEffect(() => {
    try {
      localStorage.setItem("ess_gallery", JSON.stringify(gallery));
    } catch (e) {
      console.warn("Storage quota exceeded for gallery items:", e);
    }
  }, [gallery]);

  return [gallery, setGallery] as const;
}
