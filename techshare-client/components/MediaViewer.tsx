"use client";

import { useState } from "react";
import { FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface MediaViewerProps {
  mediaUrl: string;
  mediaType: "image" | "video";
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export default function MediaViewer({ 
  mediaUrl, 
  mediaType, 
  onClose, 
  onNext, 
  onPrev,
  hasNext,
  hasPrev 
}: MediaViewerProps) {
  const [loading, setLoading] = useState(true);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
      >
        <FaTimes size={28} />
      </button>

      {/* Nút previous */}
      {hasPrev && onPrev && (
        <button
          onClick={onPrev}
          className="absolute left-4 text-white hover:text-gray-300 z-10"
        >
          <FaChevronLeft size={40} />
        </button>
      )}

      {hasNext && onNext && (
        <button
          onClick={onNext}
          className="absolute right-4 text-white hover:text-gray-300 z-10"
        >
          <FaChevronRight size={40} />
        </button>
      )}

      <div className="max-w-[90vw] max-h-[90vh] flex items-center justify-center">
        {mediaType === "image" ? (
          <img
            src={mediaUrl}
            alt="Preview"
            className={`max-w-full max-h-[90vh] object-contain transition-opacity duration-300 ${
              loading ? "opacity-0" : "opacity-100"
            }`}
            onLoad={() => setLoading(false)}
          />
        ) : (
          <video
            src={mediaUrl}
            controls
            autoPlay
            className="max-w-full max-h-[90vh]"
            onLoadedData={() => setLoading(false)}
          />
        )}
      </div>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}