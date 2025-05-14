import React from 'react';

interface ActivityFeedPreviewProps {
  // Add props if feed items become dynamic, e.g., items: FeedItem[];
}

export const ActivityFeedPreview: React.FC<ActivityFeedPreviewProps> = () => {
  return (
    <section className="my-6">
      <h3 className="text-md font-semibold text-[#14213D] mb-2">Activity Feed</h3>
      {/* Replace with dynamic feed rendering later */}
      <div className="space-y-2 text-sm text-gray-600">
        <p>Alice saved $50 towards "Vacation Fund".</p>
        <p>Bob joined the "Emergency Fund Boost" challenge.</p>
        <p>Charlie invited 3 friends.</p>
      </div>
    </section>
  );
};
