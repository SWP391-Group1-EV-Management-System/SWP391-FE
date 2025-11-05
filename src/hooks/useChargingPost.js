import { useState, useEffect } from "react";

/**
 * Hook để lấy thông tin charging post (trụ sạc) công khai
 * Endpoint: GET /api/charging-post/{postId}
 * Response: PostResponseDTO với thông tin trụ, sessions, bookings, waiting list
 */
const useChargingPost = (postId) => {
  const [postData, setPostData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!postId) {
      console.warn("⚠️ [useChargingPost] No postId provided");
      return;
    }

    const fetchChargingPost = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

        // ✅ Dùng fetch để tránh axios interceptors
        const response = await fetch(`${apiUrl}/api/charging/post/${postId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "omit", // Public endpoint, không cần credentials
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setPostData(data);
        console.log("✅ [useChargingPost] Charging post data loaded:", data);
      } catch (err) {
        console.error("❌ [useChargingPost] Error fetching post:", err);
        setError(err.message || "Failed to fetch charging post data");
      } finally {
        setLoading(false);
      }
    };

    fetchChargingPost();
  }, [postId]);

  return {
    postData,
    loading,
    error,
  };
};

export default useChargingPost;
