import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
  }

  connect(userId, onConnectCallback, onErrorCallback) {
    // ✅ Check if already connected
    if (this.client && this.connected) {
      console.log(
        "✅ [WebSocketService] Already connected, calling onConnect callback immediately"
      );
      if (onConnectCallback) {
        onConnectCallback({ headers: {} });
      }
      return;
    }

    // ✅ If client exists but not connected, deactivate it first
    if (this.client && !this.connected) {
      console.log(
        "⚠️ [WebSocketService] Cleaning up previous failed connection..."
      );
      try {
        this.client.deactivate();
      } catch (error) {
        console.warn(
          "⚠️ [WebSocketService] Error deactivating previous client:",
          error
        );
      }
      this.client = null;
    }

    console.log("🔌 [WebSocketService] Connecting with userId:", userId);

    const wsUrl = import.meta.env.VITE_API_BASE_URL || "https://api.ecoz.dev";
    const socket = new SockJS(`${wsUrl}/ws`);

    this.client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => {
        // Only log important events, not all debug messages
        if (
          str.includes("CONNECT") ||
          str.includes("MESSAGE") ||
          str.includes("SUBSCRIBE")
        ) {
          console.log("� STOMP:", str.substring(0, 100)); // Truncate long messages
        }
      },
      reconnectDelay: 0, // ✅ Disable auto-reconnect to avoid spam
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      // ✅ Add connectHeaders to send username to Spring WebSocket
      connectHeaders: {
        "user-name": userId, // This matches the STOMP header from backend
      },

      onConnect: (frame) => {
        console.log("=====================================");
        console.log("✅ WebSocket Connected!");
        console.log("✅ Connected with user:", userId);
        console.log("✅ Frame headers:", frame.headers);
        console.log("✅ Session ID:", frame.headers.session);
        console.log("✅ User principal:", frame.headers["user-name"]);
        console.log("=====================================");
        this.connected = true;
        if (onConnectCallback) onConnectCallback(frame);
      },

      onStompError: (frame) => {
        console.error("❌ STOMP Error:", frame.headers["message"]);
        console.error("Details:", frame.body);
        this.connected = false;
        if (onErrorCallback) onErrorCallback(frame);
      },

      onWebSocketError: (error) => {
        console.error("❌ WebSocket Error (connection failed):", error);
        this.connected = false;
        if (onErrorCallback) onErrorCallback(error);
      },

      onDisconnect: () => {
        console.log("🔌 WebSocket Disconnected");
        this.connected = false;
      },
    });

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.subscriptions.clear();
      this.client.deactivate();
      this.connected = false;
      console.log("👋 Disconnected from WebSocket");
    }
  }

  /**
   * Subscribe để nhận early charging offer (A rút sạc sớm)
   * @param {function} callback - Hàm xử lý khi nhận message
   */
  subscribeToEarlyChargingOffer(callback) {
    if (!this.client || !this.connected) {
      console.error("WebSocket chưa kết nối!");
      return null;
    }

    // Backend gửi: convertAndSendToUser(userId, "/queue/early-charging-offer", message)
    const destination = `/user/queue/early-charging-offer`;

    console.log("🔔 [WebSocketService] Subscribing to early charging offer:");
    console.log("   - destination:", destination);

    const subscription = this.client.subscribe(destination, (message) => {
      console.log("🎉🎉🎉 ============================================");
      console.log("📩 ✅ EARLY CHARGING OFFER MESSAGE RECEIVED!");
      console.log("🎉🎉🎉 ============================================");
      console.log("   - destination:", destination);
      console.log("   - message body:", message.body);
      console.log("   - message body type:", typeof message.body);
      console.log("   - message body length:", message.body?.length);
      console.log("   - headers:", message.headers);
      console.log("   - subscription ID:", message.headers.subscription);
      console.log("   - full message object:", message);

      try {
        const data = JSON.parse(message.body);
        console.log("✅ Parsed data successfully:", data);
        console.log("   - postId:", data.postId);
        console.log("   - message:", data.message);
        console.log("   - minutesEarly:", data.minutesEarly);
        if (callback) {
          console.log("✅ Calling callback with data:", data);
          callback(data);
        } else {
          console.warn("⚠️ No callback provided!");
        }
      } catch (error) {
        console.error("❌ Error parsing early charging offer message:", error);
        console.error("❌ Raw body:", message.body);
        if (callback) callback(message.body);
      }
    });

    this.subscriptions.set("early-charging-offer", subscription);
    console.log("✅ Successfully subscribed to:", destination);
    console.log("✅ Subscription ID:", subscription.id);

    return subscription;
  }

  /**
   * Subscribe để nhận thông báo booking status (waiting -> booking)
   * @param {function} callback - Hàm xử lý khi nhận message
   */
  subscribeToBookingStatus(callback) {
    if (!this.client || !this.connected) {
      console.error("WebSocket chưa kết nối!");
      return null;
    }

    // Backend gửi: convertAndSendToUser(userId, "/queue/booking-status", message)
    const destination = `/user/queue/booking-status`;

    console.log("🔔 [WebSocketService] Subscribing to booking status:");
    console.log("   - destination:", destination);

    const subscription = this.client.subscribe(destination, (message) => {
      console.log("📩 ✅ Booking status received!");
      console.log("   - destination:", destination);
      console.log("   - message body:", message.body);
      console.log("   - headers:", message.headers);

      try {
        const data = JSON.parse(message.body);
        console.log("   - parsed data:", data);
        if (callback) callback(data);
      } catch (error) {
        console.error("❌ Error parsing booking status message:", error);
        if (callback) callback(message.body);
      }
    });

    this.subscriptions.set("booking-status", subscription);
    console.log("✅ Successfully subscribed to:", destination);

    return subscription;
  }

  /**
   * Subscribe để nhận cập nhật vị trí trong queue
   * @param {function} callback - Hàm xử lý khi nhận message
   */
  subscribeToPositionUpdate(callback) {
    if (!this.client || !this.connected) {
      console.error("WebSocket chưa kết nối!");
      return null;
    }

    // Backend gửi: convertAndSendToUser(userId, "/queue/position-update", message)
    const destination = `/user/queue/position-update`;

    console.log("🔔 [WebSocketService] Subscribing to position update:");
    console.log("   - destination:", destination);

    const subscription = this.client.subscribe(destination, (message) => {
      console.log("📩 ✅ Position update received!");
      console.log("   - destination:", destination);
      console.log("   - message body:", message.body);
      console.log("   - headers:", message.headers);

      try {
        const data = JSON.parse(message.body);
        console.log("   - parsed data:", data);
        if (callback) callback(data);
      } catch (error) {
        console.error("❌ Error parsing position update message:", error);
        if (callback) callback(message.body);
      }
    });

    this.subscriptions.set("position-update", subscription);
    console.log("✅ Successfully subscribed to:", destination);

    return subscription;
  }

  /**
   * Subscribe để nhận thông báo cá nhân cho user
   * @param {string} userId - ID của user (phải khớp với username trong connectHeaders)
   * @param {string} postId - ID của charging post
   * @param {function} callback - Hàm xử lý khi nhận message
   */
  subscribeToNotifications(userId, postId, callback) {
    if (!this.client || !this.connected) {
      console.error("WebSocket chưa kết nối!");
      return null;
    }

    // Backend gửi: convertAndSendToUser(userId, "/queue/notifications/" + postId, message)
    // Spring tự động thêm /user/{username} prefix
    // Client subscribe: /user/queue/notifications/{postId}
    const destination = `/user/queue/notifications/${postId}`;

    // ✅ ALSO try subscribing to the direct destination as a fallback
    const directDestination = `/queue/notifications/${postId}`;

    console.log("🔔 [WebSocketService] Subscribing to notifications:");
    console.log("   - userId:", userId);
    console.log("   - postId:", postId);
    console.log("   - destination:", destination);
    console.log("   - Also trying direct:", directDestination);

    const subscription = this.client.subscribe(destination, (message) => {
      console.log("📩 ✅ Notification received (user destination)!");
      console.log("   - destination:", destination);
      console.log("   - message body:", message.body);
      console.log("   - message body type:", typeof message.body);
      console.log("   - message body length:", message.body?.length);
      console.log(
        "   - message body chars:",
        Array.from(message.body || "").map((c) => c.charCodeAt(0))
      );
      console.log("   - headers:", message.headers);
      if (callback) callback(message.body);
    });

    // ✅ Subscribe to direct destination as well (debugging)
    const directSubscription = this.client.subscribe(
      directDestination,
      (message) => {
        console.log("📩 ✅ Notification received (direct destination)!");
        console.log("   - destination:", directDestination);
        console.log("   - message body:", message.body);
        console.log("   - message body type:", typeof message.body);
        console.log("   - message body length:", message.body?.length);
        console.log("   - headers:", message.headers);
        if (callback) callback(message.body);
      }
    );

    this.subscriptions.set(`notifications-${postId}`, subscription);
    this.subscriptions.set(
      `notifications-direct-${postId}`,
      directSubscription
    );
    console.log("✅ Successfully subscribed to:", destination);
    console.log("✅ Successfully subscribed to:", directDestination);

    return subscription;
  }

  /**
   * Subscribe topic chung (broadcast cho tất cả client)
   * @param {string} postId - ID của charging post
   * @param {function} callback - Hàm xử lý khi nhận message
   */
  subscribeToTopic(postId, callback) {
    if (!this.client || !this.connected) {
      console.error("WebSocket chưa kết nối!");
      return null;
    }

    const destination = `/topic/waiting/${postId}`;

    const subscription = this.client.subscribe(destination, (message) => {
      console.log("📢 Topic message:", message.body);
      if (callback) callback(message.body);
    });

    this.subscriptions.set(`topic-${postId}`, subscription);
    console.log("✅ Subscribed to:", destination);

    return subscription;
  }

  /**
   * Subscribe to charging post status updates (public - no auth required)
   * @param {string} postId - ID của charging post
   * @param {function} callback - Hàm xử lý khi nhận status update
   */
  subscribeToPostStatus(postId, callback) {
    if (!this.client || !this.connected) {
      console.error("WebSocket chưa kết nối!");
      return null;
    }

    // Backend gửi broadcast: messagingTemplate.convertAndSend("/topic/post/{postId}/status", statusData)
    const destination = `/topic/post/${postId}/status`;

    console.log("🔔 [WebSocketService] Subscribing to post status:");
    console.log("   - postId:", postId);
    console.log("   - destination:", destination);

    const subscription = this.client.subscribe(destination, (message) => {
      console.log("📩 ✅ Post status update received!");
      console.log("   - destination:", destination);
      console.log("   - message body:", message.body);
      console.log("   - headers:", message.headers);

      try {
        const data = JSON.parse(message.body);
        console.log("   - parsed status data:", data);
        console.log("   - status:", data.status);
        console.log("   - subStatus:", data.subStatus);
        console.log("   - waitingCount:", data.waitingCount);
        if (callback) callback(data);
      } catch (error) {
        console.error("❌ Error parsing post status message:", error);
        if (callback) callback(message.body);
      }
    });

    this.subscriptions.set(`post-status-${postId}`, subscription);
    console.log("✅ Successfully subscribed to:", destination);

    return subscription;
  }

  unsubscribe(key) {
    const subscription = this.subscriptions.get(key);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(key);
      console.log("❌ Unsubscribed:", key);
    }
  }

  unsubscribeAll() {
    this.subscriptions.forEach((subscription, key) => {
      subscription.unsubscribe();
      console.log("❌ Unsubscribed:", key);
    });
    this.subscriptions.clear();
  }

  isConnected() {
    return this.connected;
  }
}

// Export singleton instance
const wsService = new WebSocketService();
export default wsService;
