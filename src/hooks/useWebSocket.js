import { useEffect, useState, useCallback } from "react";
import wsService from "../services/WebSocketService";

export const useWebSocket = (userId, postId) => {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [position, setPosition] = useState(null);
  const [maxWaitingTime, setMaxWaitingTime] = useState(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(null);
  const [earlyChargingOffer, setEarlyChargingOffer] = useState(null);

  useEffect(() => {
    if (!userId) {
      return;
    }

    wsService.connect(
      userId,
      () => {
        setConnected(true);

        // ✅ Subscribe to booking status changes (waiting -> booking)
        wsService.subscribeToBookingStatus((data) => {
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
            setBookingConfirmed({
              bookingId: data.bookingId,
              postId: data.postId,
              message: data.message,
            });
          }
        });

        // ✅ Subscribe to early charging offer (A rút sạc sớm)
        wsService.subscribeToEarlyChargingOffer((data) => {
          setMessages((prev) => [
            ...prev,
            {
              type: "early-charging-offer",
              text: data.message || "Trạm sạc sẵn sàng sớm!",
              data,
              time: new Date(),
            },
          ]);

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
            setPosition(data.position);

            try {
              localStorage.setItem(
                "initialQueueRank",
                data.position.toString()
              );
            } catch (error) {
              // Error saving rank
            }
          }
        });

        // ✅ Subscribe to old notifications channel (optional, keep for backward compatibility)
        if (postId) {
          wsService.subscribeToNotifications(userId, postId, (message) => {
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
                setPosition(parsedPosition);

                try {
                  localStorage.setItem(
                    "initialQueueRank",
                    parsedPosition.toString()
                  );
                } catch (error) {
                  // Error saving rank
                }

                break;
              }
            }

            // ✅ Parse EndTime message (from updateMaxWaitingTime)
            const endTimeMatch = message.match(/EndTime:\s*(.+)/i);
            if (endTimeMatch) {
              const endTimeStr = endTimeMatch[1].trim();
              setMaxWaitingTime(endTimeStr);

              try {
                localStorage.setItem("maxWaitingTime", endTimeStr);
              } catch (error) {
                // Error saving maxWaitingTime
              }
            }
          });
        }

        // Subscribe to topic (optional)
        // Parse topic payloads and update maxWaitingTime when payload contains expectedEndTime / maxWaitingTime
        wsService.subscribeToTopic(postId, (message) => {
          console.log("📢 [useWebSocket] Topic message received:", message);

          // Normalize message to string body if message is an object
          let body = message;
          try {
            if (
              typeof message === "object" &&
              message !== null &&
              message.body
            ) {
              body = message.body;
            }
          } catch {
            /* ignore */
          }

          // Try parse JSON first
          let parsed = null;
          if (typeof body === "string") {
            try {
              parsed = JSON.parse(body);
            } catch {
              // Not JSON - keep as raw string
              parsed = null;
            }
          }

          // If parsed JSON contains expectedEndTime or maxWaitingTime, update state/localStorage
          const timeCandidate =
            (parsed && (parsed.expectedEndTime || parsed.maxWaitingTime)) ||
            null;

          if (timeCandidate) {
            const timeValue = parsed.expectedEndTime || parsed.maxWaitingTime;
            console.log(
              "⏰ [useWebSocket] Topic contains expected time, updating maxWaitingTime:",
              timeValue
            );
            setMaxWaitingTime(timeValue);
            try {
              localStorage.setItem("maxWaitingTime", timeValue);
              console.log(
                "💾 [useWebSocket] Saved maxWaitingTime from topic to localStorage:",
                timeValue
              );
            } catch (err) {
              console.error(
                "❌ [useWebSocket] Error saving maxWaitingTime:",
                err
              );
            }
          } else {
            // Fallback: check old-style EndTime string inside message text
            if (typeof body === "string") {
              const endTimeMatch = body.match(/EndTime:\s*(.+)/i);
              if (endTimeMatch) {
                const endTimeStr = endTimeMatch[1].trim();
                console.log(
                  "⏰ [useWebSocket] Topic EndTime parsed (fallback):",
                  endTimeStr
                );
                setMaxWaitingTime(endTimeStr);
                try {
                  localStorage.setItem("maxWaitingTime", endTimeStr);
                } catch (err) {
                  console.error(
                    "❌ [useWebSocket] Error saving maxWaitingTime:",
                    err
                  );
                }
              }
            }
          }

          setMessages((prev) => [
            ...prev,
            { type: "broadcast", text: body, time: new Date() },
          ]);
        });
      },
      () => {
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
