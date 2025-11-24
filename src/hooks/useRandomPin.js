import { useState, useCallback } from "react";

export const useRandomPin = () => {
  const [pinData, setPinData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRandomPin = useCallback(async (userId, postId) => {
    try {
      setLoading(true);
      setError(null);

      if (!userId) throw new Error("userId is required");
      if (!postId) throw new Error("postId is required");

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

      const payload = {
        userId: userId,
        postId: postId, // ✅ Thêm postId
      };

      console.log("📤 [useRandomPin] Sending payload:", payload);

      // ✅ POST request với body JSON (phù hợp với @PostMapping + @RequestBody)
      const response = await fetch(`${apiUrl}/api/car/random_pin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("📥 [useRandomPin] Response from backend:", data);

      // ✅ Format data: maxSecond (giây) thay vì minuteMax
      const formattedData = {
        pinNow: data.currentPin, // % pin hiện tại
        maxSecond: data.maxSecond, // giây để đầy pin
        maxMinute: Math.ceil(data.maxSecond / 60), // convert sang phút (làm tròn lên)
      };

      console.log("✅ [useRandomPin] Formatted data:", formattedData);

      setPinData(formattedData);
      return formattedData;
    } catch (err) {
      console.error("❌ [useRandomPin] Error:", err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    pinData,
    loading,
    error,
    fetchRandomPin,
  };
};
