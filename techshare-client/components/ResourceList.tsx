"use client";

import { useEffect, useState } from "react";

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  url?: string;
}

export default function ResourceList() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await fetch('/api/resources');
      const data = await response.json();
      setResources(data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Đang tải tài nguyên...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {resources.map((resource) => (
        <div key={resource.id} className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="text-2xl sm:text-3xl mb-3">
            {resource.category === 'video' ? '' : resource.category === 'document' ? '' : ''}
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">{resource.title}</h3>
          <p className="text-gray-600 text-xs sm:text-sm mb-4">{resource.description}</p>
          {resource.url && (
            <a 
              href={resource.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 text-sm font-medium inline-flex items-center gap-1 hover:underline"
            >
              Xem chi tiết <span>→</span>
            </a>
          )}
        </div>
      ))}
    </div>
  );
}