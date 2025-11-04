import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import "../../assets/styles/ChatBox.css";
import aiRobotIcon from "../../assets/images/ai-robot.png";
import ecoLogo from "../../assets/images/logo.png";
import { useLocationTracking } from "../../hooks/useLocationTracking";
import { setDriverStatus } from "../../utils/statusUtils";

const ChatBox = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // ✅ Load chat history từ localStorage
  const [messages, setMessages] = useState(() => {
    try {
      const savedMessages = localStorage.getItem("chat_messages");
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        console.log("💬 Restored", parsed.length, "messages from localStorage");
        return parsed;
      }
    } catch (error) {
      console.warn("⚠️ Failed to load chat history:", error);
    }
    return [];
  });

  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showStopButton, setShowStopButton] = useState(false);
  const messagesEndRef = useRef(null);
  const loadingTimerRef = useRef(null);
  const readerRef = useRef(null);

  // ✅ GPS Tracking - Bật khi chatbox mở, tắt khi đóng
  const {
    location: userLocation,
    trackingStatus,
    isTracking,
    lastUpdateTime,
    clearStorage,
  } = useLocationTracking(isOpen);

  // Danh sách các trang không hiển thị ChatBox
  const hiddenPaths = ["/login", "/register", "/forgot-password", "/welcome", "/about"];
  const shouldHide = hiddenPaths.some((path) => location.pathname.startsWith(path));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Save messages vào localStorage mỗi khi có thay đổi
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem("chat_messages", JSON.stringify(messages));
        console.log("💾 Saved", messages.length, "messages to localStorage");
      } catch (error) {
        console.warn("⚠️ Failed to save chat history:", error);
      }
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      // Cleanup: Đóng stream và clear timer khi unmount
      if (readerRef.current) {
        readerRef.current.cancel();
        readerRef.current = null;
      }
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
    };
  }, []);

  // ✅ Log GPS tracking status (có thể bỏ sau khi test xong)
  useEffect(() => {
    if (isOpen && isTracking && userLocation) {
      console.log("📍 Current GPS:", {
        lat: userLocation.latitude.toFixed(6),
        lon: userLocation.longitude.toFixed(6),
        accuracy: `${userLocation.accuracy}m`,
        lastUpdate: lastUpdateTime ? new Date(lastUpdateTime).toLocaleString("vi-VN") : "N/A",
      });
    }
  }, [isOpen, isTracking, userLocation, lastUpdateTime]);

  // ✅ Hiển thị thông tin khi load từ localStorage (sau khi F5)
  useEffect(() => {
    console.log("🔍 Component mounted - Checking GPS data:", {
      isOpen,
      userLocation,
      trackingStatus,
      lastUpdateTime,
    });

    if (userLocation) {
      console.log("💾 GPS data loaded from localStorage:", {
        lat: userLocation.latitude.toFixed(6),
        lon: userLocation.longitude.toFixed(6),
        savedAt: lastUpdateTime ? new Date(lastUpdateTime).toLocaleString("vi-VN") : "N/A",
      });
    } else {
      console.log("⚠️ No GPS data in localStorage");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy 1 lần khi mount

  // ✅ Expose clear functions ra window để có thể clear từ console
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.clearGPSCache = () => {
        clearStorage();
        console.log("✅ GPS cache cleared! Refresh page to reset.");
      };

      window.clearChatHistory = () => {
        localStorage.removeItem("chat_messages");
        setMessages([]);
        console.log("✅ Chat history cleared!");
      };
    }
    return () => {
      if (typeof window !== "undefined") {
        delete window.clearGPSCache;
        delete window.clearChatHistory;
      }
    };
  }, [clearStorage]);

  const handleStopLoading = () => {
    // Dừng stream
    if (readerRef.current) {
      readerRef.current.cancel();
      readerRef.current = null;
    }

    // Clear timer
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }

    setIsLoading(false);
    setShowStopButton(false);

    // Thêm message thông báo đã dừng
    setMessages((prev) => [
      ...prev.filter((msg) => !msg.isProcessing),
      {
        id: `bot-stopped-${Date.now()}`,
        text: "⏹️ Đã dừng xử lý.",
        sender: "bot",
        time: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Ẩn ChatBox ở các trang public
  if (shouldHide) {
    return null;
  }

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoading) {
      const userMessage = inputMessage.trim();
      const newUserMessage = {
        id: `user-${Date.now()}`,
        text: userMessage,
        sender: "user",
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, newUserMessage]);
      setInputMessage("");
      setIsLoading(true);

      try {
        const response = await fetch("http://localhost:8000/send_message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ message: userMessage }),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        const jobId = data.job_id;
        if (!jobId) throw new Error("Không nhận được job_id từ server");

        console.log(" Job created:", jobId);

        const processingMessageId = `bot-processing-${Date.now()}`;
        setMessages((prev) => [
          ...prev,
          {
            id: processingMessageId,
            text: " Đang suy nghĩ...",
            sender: "bot",
            time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
            isProcessing: true,
          },
        ]);

        const sseUrl = `http://localhost:8000/stream/${jobId}`;

        console.log("📡 Connecting to SSE with credentials:", sseUrl);

        // ⏱️ Bắt đầu timer 10 giây để hiện nút Stop
        loadingTimerRef.current = setTimeout(() => {
          setShowStopButton(true);
        }, 10000);

        // ✅ Dùng fetch() thay vì EventSource để gửi được cookies
        fetch(sseUrl, {
          method: "GET",
          credentials: "include", // Gửi cookies (JWT)
          headers: {
            Accept: "text/event-stream",
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const reader = response.body.getReader();
            readerRef.current = reader; // Lưu reader để có thể cancel sau
            const decoder = new TextDecoder();
            let buffer = "";
            let currentEvent = null;

            const processLine = (line) => {
              if (line.startsWith("event:")) {
                currentEvent = line.substring(6).trim();
              } else if (line.startsWith("data:")) {
                const data = line.substring(5).trim();

                try {
                  const parsed = JSON.parse(data);

                  // ✅ IN RA TẤT CẢ DỮ LIỆU NHẬN ĐƯỢC
                  console.log("📦 Full parsed data:", parsed);

                  if (currentEvent === "heartbeat") {
                    console.log("💓 Heartbeat:", parsed.message);
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === processingMessageId ? { ...msg, text: `🤖 ${parsed.message}` } : msg
                      )
                    );
                  } else if (currentEvent === "message") {
                    if (parsed.status === "completed" && parsed.result) {
                      console.log("✉️ Received final result");
                      console.log("🎯 Action:", parsed.action);
                      console.log("🆔 ActionId:", parsed.actionId); // ✅ IN RA ACTION ID
                      console.log("🔢 Rank:", parsed.rank); // ✅ IN RA RANK

                      // ✅ Xử lý action nếu có
                      if (parsed.action) {
                        const action = parsed.action.toLowerCase();
                        const actionId = parsed.actionId; // ✅ LẤY ACTION ID
                        const rank = parsed.rank; // ✅ LẤY RANK (số thứ tự)

                        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                        console.log("🔍 ACTION DETECTED:");
                        console.log("   Type:", action);
                        console.log("   ID:", actionId);
                        console.log("   Rank:", rank);
                        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

                        // Lưu status vào localStorage
                        if (action === "booking") {
                          setDriverStatus("booking");

                          // ✅ Lưu bookingId, status và rank nếu có
                          if (actionId) {
                            localStorage.setItem("bookingId", actionId);
                            localStorage.setItem("bookingStatus", "booking"); // ✅ Set status = "booking"

                            // ✅ Lưu rank nếu có
                            if (rank !== undefined && rank !== null) {
                              localStorage.setItem("initialQueueRank", rank.toString());
                            }

                            console.log("💾 Saved to localStorage:");
                            console.log("   - bookingId:", actionId);
                            console.log("   - bookingStatus: booking");
                            console.log("   - initialQueueRank:", rank);
                          }

                          console.log("📍 Navigating to booking page...");

                          // Navigate sau 1.5 giây để user đọc message
                          setTimeout(() => {
                            navigate("/app/booking");
                          }, 1500);
                        } else if (action === "waiting") {
                          setDriverStatus("waiting");

                          // ✅ Lưu waitingListId, status và rank nếu có
                          if (actionId) {
                            localStorage.setItem("waitingListId", actionId);
                            localStorage.setItem("bookingStatus", "waiting"); // ✅ Set status = "waiting"

                            // ✅ Lưu rank nếu có
                            if (rank !== undefined && rank !== null) {
                              localStorage.setItem("initialQueueRank", rank.toString());
                            }

                            console.log("💾 Saved to localStorage:");
                            console.log("   - waitingListId:", actionId);
                            console.log("   - bookingStatus: waiting");
                            console.log("   - initialQueueRank:", rank);
                          }

                          console.log("⏳ Navigating to waiting list page...");

                          // Navigate sau 1.5 giây
                          setTimeout(() => {
                            navigate("/app/waiting");
                          }, 1500);
                        }
                      }

                      // Clear timer và ẩn nút stop
                      if (loadingTimerRef.current) {
                        clearTimeout(loadingTimerRef.current);
                        loadingTimerRef.current = null;
                      }
                      setShowStopButton(false);

                      setMessages((prev) => [
                        ...prev.filter((msg) => msg.id !== processingMessageId),
                        {
                          id: `bot-${Date.now()}`,
                          text: parsed.result,
                          sender: "bot",
                          time: new Date().toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          }),
                          action: parsed.action, // ✅ Lưu action vào message
                          actionId: parsed.actionId, // ✅ Lưu actionId vào message
                        },
                      ]);
                      setIsLoading(false);
                      readerRef.current = null;
                      reader.cancel(); // Đóng stream
                    }
                  } else if (currentEvent === "done") {
                    console.log("✅ Stream done");

                    // Clear timer và ẩn nút stop
                    if (loadingTimerRef.current) {
                      clearTimeout(loadingTimerRef.current);
                      loadingTimerRef.current = null;
                    }
                    setShowStopButton(false);
                    setIsLoading(false);
                    readerRef.current = null;
                    reader.cancel();
                  }
                } catch (error) {
                  console.error("❌ Parse error:", error, data);
                }

                currentEvent = null; // Reset event type
              }
            };

            const readStream = () => {
              reader
                .read()
                .then(({ done, value }) => {
                  if (done) {
                    console.log("✅ SSE stream completed");
                    setIsLoading(false);
                    return;
                  }

                  buffer += decoder.decode(value, { stream: true });
                  const lines = buffer.split("\n");
                  buffer = lines.pop() || "";

                  lines.forEach((line) => {
                    if (line.trim()) {
                      processLine(line);
                    }
                  });

                  readStream();
                })
                .catch((error) => {
                  console.error("❌ Stream read error:", error);
                  setMessages((prev) => [
                    ...prev.filter((msg) => msg.id !== processingMessageId),
                    {
                      id: `bot-error-${Date.now()}`,
                      text: "❌ Lỗi khi đọc dữ liệu từ AI.",
                      sender: "bot",
                      time: new Date().toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                      isError: true,
                    },
                  ]);
                  setIsLoading(false);
                });
            };

            readStream();
          })
          .catch((error) => {
            console.error("❌ Fetch SSE failed:", error);
            setMessages((prev) => [
              ...prev.filter((msg) => msg.id !== processingMessageId),
              {
                id: `bot-error-${Date.now()}`,
                text: "❌ Không thể kết nối đến AI. Vui lòng kiểm tra kết nối.",
                sender: "bot",
                time: new Date().toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                isError: true,
              },
            ]);
            setIsLoading(false);
          });
      } catch (error) {
        console.error(" Error:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-error-${Date.now()}`,
            text: ` Lỗi: ${error.message}`,
            sender: "bot",
            time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
            isError: true,
          },
        ]);
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      {!isOpen && (
        <button className="chat-icon-button" onClick={toggleChat}>
          <img src={aiRobotIcon} alt="AI Robot Assistant" className="ai-robot-icon" />
        </button>
      )}
      <div className={`chat-panel ${isOpen ? "chat-panel-open" : ""}`}>
        <div className="chat-header">
          <div className="chat-header-content">
            <div className="ai-icon-small">
              <img src={aiRobotIcon} alt="AI Robot" />
            </div>
            <div>
              <h3>Eco-Z AI Assistant</h3>
              <div className="status-row">
                <span className="ai-status">🟢 Đang hoạt động</span>
                {isTracking && userLocation && (
                  <span
                    className="gps-status"
                    title={`${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)}${
                      lastUpdateTime ? `\nCập nhật: ${new Date(lastUpdateTime).toLocaleString("vi-VN")}` : ""
                    }`}
                  >
                    📍 GPS
                  </span>
                )}
                {trackingStatus === "error" && (
                  <span className="gps-status error" title="GPS không khả dụng">
                    ⚠️ GPS
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="chat-header-actions">
            {messages.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm("Xóa toàn bộ lịch sử chat?")) {
                    window.clearChatHistory();
                  }
                }}
                className="chat-clear-btn"
                title="Xóa lịch sử chat"
              >
                🗑️
              </button>
            )}
            <button onClick={toggleChat} className="chat-close-btn">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="chat-welcome">
              <div className="ai-avatar-large">
                <img src={ecoLogo} alt="Eco-Z Logo" style={{ width: "120px", height: "auto", objectFit: "contain" }} />
              </div>
              <h4>⚡ Xin chào!</h4>
              <p style={{ fontSize: "16px", fontWeight: "500", marginBottom: "12px" }}>Tôi là Eco-Z AI Assistant</p>
              <p className="ai-description" style={{ lineHeight: "1.8" }}>
                <span style={{ display: "block", marginBottom: "6px" }}>🔋 Tìm trạm sạc gần bạn</span>
                <span style={{ display: "block", marginBottom: "6px" }}>⚡ Đặt chỗ sạc nhanh chóng</span>
                <span style={{ display: "block" }}>💬 Hỗ trợ 24/7</span>
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-message ${msg.sender} ${msg.isError ? "error-message" : ""} ${
                  msg.isProcessing ? "processing-message" : ""
                } ${msg.action ? `action-${msg.action.toLowerCase()}` : ""}`}
              >
                <div className="message-bubble">
                  <p>{msg.text}</p>
                  {msg.action && (
                    <div className="message-action-badge">
                      {msg.action === "booking" && "📍 Đang chuyển đến đặt chỗ..."}
                      {msg.action === "waiting" && "⏳ Đang chuyển đến hàng đợi..."}
                    </div>
                  )}
                  <span className="message-time">{msg.time}</span>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <form className="chat-input-area" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={isLoading ? "Đang xử lý..." : "Nhập tin nhắn..."}
            className="chat-input"
            disabled={isLoading}
          />
          {showStopButton ? (
            <button type="button" className="chat-stop-btn" onClick={handleStopLoading}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            </button>
          ) : (
            <button type="submit" className="chat-send-btn" disabled={isLoading || !inputMessage.trim()}>
              {isLoading ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="loading-spinner"
                >
                  <circle cx="12" cy="12" r="10" strokeWidth="3" strokeDasharray="60" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              )}
            </button>
          )}
        </form>
      </div>
    </>
  );
};

export default ChatBox;
