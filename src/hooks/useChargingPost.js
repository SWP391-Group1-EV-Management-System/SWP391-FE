import { useState, useEffect } from "react";

// Hook lấy thông tin charging post công khai
const useChargingPost = (postId) => {
  const [postData, setPostData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!postId) {
      return;
    }

    // Lấy dữ liệu charging post
    const fetchChargingPost = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

        const response = await fetch(`${apiUrl}/api/charging/post/${postId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "omit",
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setPostData(data);
      } catch (err) {
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
