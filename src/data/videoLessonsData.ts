import { useState, useEffect } from "react";

export interface VideoLesson {
  id: string;
  title: string;
  subject: string;
  targetClass: string;
  teacherName: string;
  teacherId?: string;
  description: string;
  videoUrl: string;
  mediaType: "file" | "youtube" | "vimeo" | "direct";
  durationMinutes?: number;
  thumbnailUrl?: string;
  createdAt: string;
  viewsCount?: number;
  fileSize?: string;
  tags?: string[];
}

export const initialVideoLessons: VideoLesson[] = [
  {
    id: "VID-2026-001",
    title: "Physics: Laws of Thermodynamics & Heat Engines",
    subject: "Physics",
    targetClass: "SSS 3A",
    teacherName: "Dr. Mrs. Ojo",
    teacherId: "TCH/2026/012",
    description: "In-depth lecture explaining the 1st and 2nd laws of thermodynamics, entropy, and internal energy calculations with step-by-step WAEC practice problems.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    mediaType: "direct",
    durationMinutes: 45,
    thumbnailUrl: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=600&q=80",
    createdAt: "2026-09-10",
    viewsCount: 142,
    fileSize: "14.2 MB",
    tags: ["Thermodynamics", "Heat", "WAEC Revision"]
  },
  {
    id: "VID-2026-002",
    title: "Mathematics: Quadratic Equations & Formula Derivation",
    subject: "Mathematics",
    targetClass: "SSS 2B",
    teacherName: "Mr. James Balogun",
    teacherId: "TCH/2026/019",
    description: "Mastering the quadratic formula, completing the square method, and real-world projectile trajectory applications.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    mediaType: "direct",
    durationMinutes: 38,
    thumbnailUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80",
    createdAt: "2026-09-08",
    viewsCount: 210,
    fileSize: "18.5 MB",
    tags: ["Algebra", "Quadratic", "Formulas"]
  },
  {
    id: "VID-2026-003",
    title: "English Language: Oral Vowels, Diphthongs & Stress Patterns",
    subject: "English Language",
    targetClass: "All Classes",
    teacherName: "Mrs. Grace Adeyemi",
    teacherId: "TCH/2026/042",
    description: "Comprehensive phonetics guide covering monophthongs, diphthongs, word stress, and pronunciation drills for West African examination candidates.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    mediaType: "direct",
    durationMinutes: 52,
    thumbnailUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80",
    createdAt: "2026-09-05",
    viewsCount: 318,
    fileSize: "24.1 MB",
    tags: ["Oral English", "Phonetics", "Grammar"]
  },
  {
    id: "VID-2026-004",
    title: "Basic Science: Chemical Reactions & Laboratory Safety",
    subject: "Basic Science",
    targetClass: "JSS 1A",
    teacherName: "Mr. Samuel Eze",
    teacherId: "TCH/2026/028",
    description: "Introductory science lesson showcasing Bunsen burner techniques, chemical change demonstrations, and mandatory laboratory PPE protocol.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    mediaType: "direct",
    durationMinutes: 30,
    thumbnailUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80",
    createdAt: "2026-09-02",
    viewsCount: 95,
    fileSize: "12.0 MB",
    tags: ["Laboratory", "Science", "Safety"]
  }
];

export function useVideoLessons() {
  const [lessons, setLessons] = useState<VideoLesson[]>(() => {
    try {
      const saved = localStorage.getItem("ess_video_lessons");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to parse stored video lessons:", e);
    }
    return initialVideoLessons;
  });

  useEffect(() => {
    try {
      localStorage.setItem("ess_video_lessons", JSON.stringify(lessons));
    } catch (e) {
      console.warn("LocalStorage quota reached when storing video lessons:", e);
    }
  }, [lessons]);

  const addVideoLesson = (lesson: Omit<VideoLesson, "id" | "createdAt">) => {
    const newLesson: VideoLesson = {
      ...lesson,
      id: `VID-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString().split("T")[0],
      viewsCount: 0
    };
    setLessons(prev => [newLesson, ...prev]);
    return newLesson;
  };

  const deleteVideoLesson = (id: string) => {
    setLessons(prev => prev.filter(l => l.id !== id));
  };

  const incrementViews = (id: string) => {
    setLessons(prev =>
      prev.map(l => (l.id === id ? { ...l, viewsCount: (l.viewsCount || 0) + 1 } : l))
    );
  };

  return {
    lessons,
    setLessons,
    addVideoLesson,
    deleteVideoLesson,
    incrementViews
  };
}
