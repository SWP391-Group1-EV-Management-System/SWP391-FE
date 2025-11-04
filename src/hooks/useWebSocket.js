import { useEffect, useState, useCallback } from "react";
import wsService from "../services/WebSocketService";

export const useWebSocket = (userId, postId) => {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [position, setPosition] = useState(null);
  const [maxWaitingTime, setMaxWaitingTime] = useState(null); // ✅ Thêm state cho endTime

  useEffect(() => {
    console.log("🎯 [useWebSocket] Hook called with:");
    console.log("   - userId:", userId);
    console.log("   - postId:", postId);

    if (!userId || !postId) {
      console.warn("⚠️ [useWebSocket] Missing userId or postId, skipping connection");
      return;
    }

    // Connect to WebSocket
    console.log("🔌 [useWebSocket] Calling wsService.connect with userId:", userId);
    wsService.connect(
      userId,
      () => setConnected(true),
      () => setConnected(false)
    );

    // Wait for connection then subscribe
    const timer = setTimeout(() => {
      if (wsService.isConnected()) {
        console.log("✅ [useWebSocket] WebSocket is connected, subscribing...");
        console.log("   - userId:", userId);
        console.log("   - postId:", postId);

        // Subscribe to notifications
        wsService.subscribeToNotifications(userId, postId, (message) => {
          console.log("📩 [useWebSocket] Notification callback triggered!");
          console.log("   - Raw message:", message);
          console.log("   - Message type:", typeof message);
          console.log("   - Message length:", message?.length);

          setMessages((prev) => [...prev, { type: "notification", text: message, time: new Date() }]);

          // ✅ Parse EndTime message (from updateMaxWaitingTime)
          const endTimeMatch = message.match(/EndTime:\s*(.+)/i);
          if (endTimeMatch) {
            const endTimeStr = endTimeMatch[1].trim();
            console.log("⏰ [useWebSocket] EndTime parsed:", endTimeStr);
            setMaxWaitingTime(endTimeStr);

            // ✅ Lưu vào localStorage
            try {
              localStorage.setItem("maxWaitingTime", endTimeStr);
              console.log("💾 [useWebSocket] Saved maxWaitingTime to localStorage:", endTimeStr);
            } catch (error) {
              console.error("❌ [useWebSocket] Error saving maxWaitingTime:", error);
            }
            return; // ✅ Không parse position nếu là EndTime message
          }

          // ✅ Try multiple regex patterns to parse position
          let newPosition = null;

          // Pattern 1: "vị trí số X"
          const posMatch1 = message.match(/vị trí số (\d+)/i);
          if (posMatch1) {
            newPosition = parseInt(posMatch1[1]);
            console.log("🎯 [useWebSocket] Position parsed (pattern 1):", newPosition);
          }

          // Pattern 2: "số X" (fallback)
          if (!newPosition) {
            const posMatch2 = message.match(/số (\d+)/i);
            if (posMatch2) {
              newPosition = parseInt(posMatch2[1]);
              console.log("🎯 [useWebSocket] Position parsed (pattern 2):", newPosition);
            }
          }

          // Pattern 3: Any number at the end
          if (!newPosition) {
            const posMatch3 = message.match(/(\d+)$/);
            if (posMatch3) {
              newPosition = parseInt(posMatch3[1]);
              console.log("🎯 [useWebSocket] Position parsed (pattern 3):", newPosition);
            }
          }

          if (newPosition !== null) {
            console.log("✅ [useWebSocket] Setting position:", newPosition);
            setPosition(newPosition);

            // ✅ Lưu vào localStorage
            try {
              localStorage.setItem("initialQueueRank", newPosition.toString());
              console.log("💾 [useWebSocket] Updated rank in localStorage:", newPosition);
            } catch (error) {
              console.error("❌ [useWebSocket] Error saving rank:", error);
            }
          } else {
            console.warn("⚠️ [useWebSocket] Could not parse position from message:", message);
          }
        });

        // Subscribe to topic (optional)
        wsService.subscribeToTopic(postId, (message) => {
          console.log("📢 [useWebSocket] Topic message received:", message);
          setMessages((prev) => [...prev, { type: "broadcast", text: message, time: new Date() }]);
        });
      } else {
        console.warn("⚠️ [useWebSocket] WebSocket not connected after timeout!");
      }
    }, 1000);

    // Cleanup on unmount
    return () => {
      clearTimeout(timer);
      wsService.unsubscribeAll();
      wsService.disconnect();
      setConnected(false);
    };
  }, [userId, postId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return { connected, messages, position, maxWaitingTime, clearMessages };
};
