import React, { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, AlertCircle, ExternalLink, Film } from "lucide-react";

export interface VideoInfo {
  type: "youtube" | "vimeo" | "html5";
  url: string;
  embedUrl?: string;
  videoId?: string;
  isDirect: boolean;
}

export function parseVideoSource(url: string): VideoInfo {
  if (!url) return { type: "html5", url: "", isDirect: false };

  const trimmed = url.trim();

  // YouTube match: regular watch, youtu.be shortlinks, embed links, shorts
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    return {
      type: "youtube",
      url: trimmed,
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0&modestbranding=1`,
      videoId: ytMatch[1],
      isDirect: false,
    };
  }

  // Vimeo match
  const vimeoMatch = trimmed.match(
    /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|))(\d+)/
  );
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: "vimeo",
      url: trimmed,
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?title=0&byline=0&portrait=0`,
      videoId: vimeoMatch[1],
      isDirect: false,
    };
  }

  // Direct video file (blob:, data:video, .mp4, .webm, .ogg, .mov, etc.)
  return {
    type: "html5",
    url: trimmed,
    isDirect: true,
  };
}

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
  autoPlay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  title,
  className = "",
  autoPlay = false,
  controls = true,
  loop = false,
  muted = false,
}) => {
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoInfo = parseVideoSource(src);

  if (!src) {
    return (
      <div className={`w-full aspect-video bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 text-xs ${className}`}>
        <Film size={24} className="mr-2 opacity-50" />
        No video source available
      </div>
    );
  }

  // YouTube Player
  if (videoInfo.type === "youtube" && videoInfo.embedUrl) {
    return (
      <div className={`relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg border border-slate-800 ${className}`}>
        <iframe
          src={videoInfo.embedUrl}
          title={title || "YouTube video player"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    );
  }

  // Vimeo Player
  if (videoInfo.type === "vimeo" && videoInfo.embedUrl) {
    return (
      <div className={`relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg border border-slate-800 ${className}`}>
        <iframe
          src={videoInfo.embedUrl}
          title={title || "Vimeo video player"}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    );
  }

  // HTML5 Video Player for uploaded files, blob URLs, and direct links
  return (
    <div className={`relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg border border-slate-800 group ${className}`}>
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-950">
          <AlertCircle size={32} className="text-amber-500 mb-2" />
          <p className="text-xs font-semibold text-slate-200">Video format or stream preview unavailable</p>
          <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
            The video source may require download or external playback.
          </p>
          {src.startsWith("http") && (
            <a
              href={src}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors"
            >
              <ExternalLink size={12} /> Open Video Source
            </a>
          )}
        </div>
      ) : (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          controls={controls}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline
          preload="metadata"
          onError={() => setHasError(true)}
          className="w-full h-full object-contain"
        >
          Your browser does not support the video tag.
        </video>
      )}

      {title && (
        <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none truncate">
          {title}
        </div>
      )}
    </div>
  );
};
