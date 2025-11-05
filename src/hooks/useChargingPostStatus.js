import { useEffect, useState, useRef } from "react";
import wsService from "../services/WebSocketService";

/**
 * Hook để kết nối WebSocket và nhận real-time status của charging post
 * Sử dụng WebSocketService có sẵn (không cần userId - public access)
 * @param {string} postId - ID của trụ sạc
 * @returns {Object} { status, isConnected }
 */
const useChargingPostStatus = (postId) => {
  const [status, setStatus] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const hasConnectedRef = useRef(false); // Track if already connected
  const reconnectAttempts = useRef(0); // Track reconnection attempts
  const maxReconnectAttempts = 3; // Limit reconnection attempts

  useEffect(() => {
    if (!postId) {
      console.warn("⚠️ [useChargingPostStatus] No postId provided");
      return;
    }

    // Skip if already connected to this postId
    if (hasConnectedRef.current) {
      console.log("⚠️ [useChargingPostStatus] Already connected, skipping...");
      return;
    }

    // Skip if max reconnect attempts reached
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.warn(
        `⚠️ [useChargingPostStatus] Max reconnect attempts (${maxReconnectAttempts}) reached. Backend might be offline.`
      );
      return;
    }

    console.log(
      "🚀 [useChargingPostStatus] Setting up WebSocket for postId:",
      postId
    );
    hasConnectedRef.current = true;
    reconnectAttempts.current++;

    // Check if already connected
    if (wsService.isConnected()) {
      console.log(
        "✅ [useChargingPostStatus] WebSocket already connected, subscribing only..."
      );
      setIsConnected(true);

      // Just subscribe to post status updates
      wsService.subscribeToPostStatus(postId, (data) => {
        console.log("📩 [useChargingPostStatus] Status update:", data);
        setStatus(data);
        reconnectAttempts.current = 0; // Reset on successful message
      });
    } else {
      // Connect to WebSocket (no userId needed for public post status)
      // Use a dummy userId or "guest" for public access
      wsService.connect(
        "public-station-" + postId, // Unique identifier for this connection
        () => {
          console.log("✅ [useChargingPostStatus] WebSocket connected!");
          setIsConnected(true);
          reconnectAttempts.current = 0; // Reset on successful connection

          // Subscribe to post status updates
          wsService.subscribeToPostStatus(postId, (data) => {
            console.log("📩 [useChargingPostStatus] Status update:", data);
            setStatus(data);
          });
        },
        (error) => {
          console.warn(
            "❌ [useChargingPostStatus] WebSocket connection failed!",
            error
          );
          console.warn(
            `   Attempt ${reconnectAttempts.current}/${maxReconnectAttempts}`
          );
          setIsConnected(false);
          hasConnectedRef.current = false; // Reset để có thể retry

          if (reconnectAttempts.current >= maxReconnectAttempts) {
            console.error(
              "🛑 [useChargingPostStatus] Max reconnect attempts reached. Please check if backend is running."
            );
          }
        }
      );
    }

    // Cleanup on unmount
    return () => {
      console.log("🔌 [useChargingPostStatus] Cleaning up WebSocket");
      wsService.unsubscribe(`post-status-${postId}`);
      hasConnectedRef.current = false;
      // Don't disconnect - other components might be using the same connection
    };
  }, [postId]);

  return { status, isConnected };
};

export default useChargingPostStatus;
