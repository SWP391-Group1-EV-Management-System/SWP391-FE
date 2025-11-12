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
      return;
    }

    // Skip nếu đã kết nối
    if (hasConnectedRef.current) {
      return;
    }

    // Skip nếu đã vượt quá số lần reconnect
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      return;
    }

    hasConnectedRef.current = true;
    reconnectAttempts.current++;

    // Kiểm tra đã kết nối chưa
    if (wsService.isConnected()) {
      setIsConnected(true);

      // Subscribe để nhận status updates
      wsService.subscribeToPostStatus(postId, (data) => {
        setStatus(data);
        reconnectAttempts.current = 0;
      });
    } else {
      // Kết nối WebSocket
      wsService.connect(
        "public-station-" + postId,
        () => {
          setIsConnected(true);
          reconnectAttempts.current = 0;

          // Subscribe để nhận status updates
          wsService.subscribeToPostStatus(postId, (data) => {
            setStatus(data);
          });
        },
        (error) => {
          setIsConnected(false);
          hasConnectedRef.current = false;
        }
      );
    }

    // Cleanup khi unmount
    return () => {
      wsService.unsubscribe(`post-status-${postId}`);
      hasConnectedRef.current = false;
    };
  }, [postId]);

  return { status, isConnected };
};

export default useChargingPostStatus;
