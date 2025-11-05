import { useEffect, useState, useCallback } from "react";
import wsService from "../services/WebSocketService";

export const useWebSocket = (userId, postId) => {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [position, setPosition] = useState(null);
  const [maxWaitingTime, setMaxWaitingTime] = useState(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(null); // ✅ Thay đổi từ statusChanged
  const [earlyChargingOffer, setEarlyChargingOffer] = useState(null); // ✅ NEW: Early charging offer

  useEffect(() => {
    console.log("🎯 [useWebSocket] Hook called with:");
    console.log("   - userId:", userId);
    console.log("   - postId:", postId);

    if (!userId) {
      console.warn("⚠️ [useWebSocket] Missing userId, skipping connection");
      return;
    }

    // Connect to WebSocket with onConnect callback
    console.log(
      "🔌 [useWebSocket] Calling wsService.connect with userId:",
      userId
    );
    wsService.connect(
      userId,
      () => {
        console.log(
          "✅ [useWebSocket] WebSocket connected! Subscribing immediately..."
        );
        console.log("   - userId:", userId);
        console.log("   - postId:", postId);
        setConnected(true);

        // ✅ Subscribe NGAY LẬP TỨC khi connect (không đợi setTimeout)
        // ✅ Subscribe to booking status changes (waiting -> booking)
        wsService.subscribeToBookingStatus((data) => {
          console.log("🎉 [useWebSocket] Booking status update received!");
          console.log("   - Full data:", data);
          console.log("   - Status:", data.status);
          console.log("   - BookingId:", data.bookingId);
          console.log("   - Message:", data.message);

          setMessages((prev) => [
            ...prev,
            {
              type: "booking-status",
              text: data.message || "Booking confirmed",
              data,
              time: new Date(),
            },
          ]);

          if (data.status === "CONFIRMED") {
            console.log(
              "✅ [useWebSocket] BOOKING CONFIRMED! Setting bookingConfirmed state"
            );
            setBookingConfirmed({
              bookingId: data.bookingId,
              postId: data.postId,
              message: data.message,
            });
          }
        });

        // ✅ Subscribe to early charging offer (A rút sạc sớm)
        wsService.subscribeToEarlyChargingOffer((data) => {
          console.log("🔋 [useWebSocket] Early charging offer received!");
          console.log("   - Full data:", data);
          console.log("   - PostId:", data.postId);
          console.log("   - Message:", data.message);
          console.log("   - Minutes early:", data.minutesEarly);
          console.log("   - Expected time:", data.expectedTime);

          setMessages((prev) => [
            ...prev,
            {
              type: "early-charging-offer",
              text: data.message || "Trạm sạc sẵn sàng sớm!",
              data,
              time: new Date(),
            },
          ]);

          // Set early charging offer state để trigger dialog
          setEarlyChargingOffer({
            postId: data.postId,
            message: data.message,
            minutesEarly: data.minutesEarly,
            expectedTime: data.expectedTime,
            availableNow: data.availableNow,
          });
        });

        // ✅ Subscribe to position updates
        wsService.subscribeToPositionUpdate((data) => {
          console.log("📍 [useWebSocket] Position update received!");
          console.log("   - Full data:", data);
          console.log("   - Position:", data.position);
          console.log("   - PostId:", data.postId);
          console.log("   - Message:", data.message);

          setMessages((prev) => [
            ...prev,
            {
              type: "position-update",
              text: data.message || `Position: ${data.position}`,
              data,
              time: new Date(),
            },
          ]);

          if (data.position !== null && data.position !== undefined) {
            console.log(
              "✅ [useWebSocket] Setting position STATE:",
              data.position
            );

            // ✅ CRITICAL: Update position state
            setPosition((prevPosition) => {
              console.log("🔄 [useWebSocket] Position state changing:");
              console.log("   - From:", prevPosition);
              console.log("   - To:", data.position);
              return data.position;
            });

            // Save to localStorage
            try {
              localStorage.setItem(
                "initialQueueRank",
                data.position.toString()
              );
              console.log(
                "💾 [useWebSocket] Updated rank in localStorage:",
                data.position
              );
            } catch (error) {
              console.error("❌ [useWebSocket] Error saving rank:", error);
            }
          } else {
            console.warn(
              "⚠️ [useWebSocket] Position is null/undefined, not updating"
            );
          }
        });

        // ✅ Subscribe to old notifications channel (optional, keep for backward compatibility)

        // ✅ Subscribe to old notifications channel (optional, keep for backward compatibility)
        if (postId) {
          wsService.subscribeToNotifications(userId, postId, (message) => {
            console.log(
              "📩 [useWebSocket] Old notification callback triggered!"
            );
            console.log("   - Raw message:", message);

            setMessages((prev) => [
              ...prev,
              { type: "notification", text: message, time: new Date() },
            ]);

            // ✅ Parse position from text message (e.g., "Bạn đang ở vị trí số 1")
            const positionPatterns = [
              /vị trí số (\d+)/i,
              /vị trí (\d+)/i,
              /position[:\s]+(\d+)/i,
              /số (\d+)/i,
            ];

            for (const pattern of positionPatterns) {
              const match = message.match(pattern);
              if (match) {
                const parsedPosition = parseInt(match[1]);
                console.log(
                  "🎯 [useWebSocket] Position parsed from old channel:",
                  parsedPosition
                );

                setPosition((prevPosition) => {
                  console.log(
                    "🔄 [useWebSocket] Position state changing (old channel):"
                  );
                  console.log("   - From:", prevPosition);
                  console.log("   - To:", parsedPosition);
                  return parsedPosition;
                });

                try {
                  localStorage.setItem(
                    "initialQueueRank",
                    parsedPosition.toString()
                  );
                  console.log(
                    "💾 [useWebSocket] Updated rank from old channel:",
                    parsedPosition
                  );
                } catch (error) {
                  console.error("❌ [useWebSocket] Error saving rank:", error);
                }

                break; // Stop after first match
              }
            }

            // ✅ Parse EndTime message (from updateMaxWaitingTime)
            const endTimeMatch = message.match(/EndTime:\s*(.+)/i);
            if (endTimeMatch) {
              const endTimeStr = endTimeMatch[1].trim();
              console.log("⏰ [useWebSocket] EndTime parsed:", endTimeStr);
              setMaxWaitingTime(endTimeStr);

              try {
                localStorage.setItem("maxWaitingTime", endTimeStr);
                console.log(
                  "💾 [useWebSocket] Saved maxWaitingTime to localStorage:",
                  endTimeStr
                );
              } catch (error) {
                console.error(
                  "❌ [useWebSocket] Error saving maxWaitingTime:",
                  error
                );
              }
            }
          });
        }

        // Subscribe to topic (optional)
        wsService.subscribeToTopic(postId, (message) => {
          console.log("📢 [useWebSocket] Topic message received:", message);
          setMessages((prev) => [
            ...prev,
            { type: "broadcast", text: message, time: new Date() },
          ]);
        });
      },
      () => {
        console.log("❌ [useWebSocket] WebSocket connection failed!");
        setConnected(false);
      }
    );

    // Cleanup on unmount
    return () => {
      wsService.unsubscribeAll();
      wsService.disconnect();
      setConnected(false);
    };
  }, [userId, postId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    connected,
    messages,
    position,
    maxWaitingTime,
    bookingConfirmed,
    earlyChargingOffer,
    clearMessages,
  };
};
