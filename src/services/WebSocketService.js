import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class WebSocketService {
    constructor() {
        this.client = null;
        this.connected = false;
        this.subscriptions = new Map();
    }

    connect(userId, onConnectCallback, onErrorCallback) {
        if (this.client && this.connected) {
            console.log('Already connected');
            return;
        }

        const socket = new SockJS('http://localhost:8080/ws');
        
        this.client = new Client({
            webSocketFactory: () => socket,
            debug: (str) => {
                console.log('STOMP:', str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            
            onConnect: (frame) => {
                console.log('✅ WebSocket Connected:', frame);
                this.connected = true;
                if (onConnectCallback) onConnectCallback(frame);
            },
            
            onStompError: (frame) => {
                console.error('❌ STOMP Error:', frame.headers['message']);
                console.error('Details:', frame.body);
                this.connected = false;
                if (onErrorCallback) onErrorCallback(frame);
            },
            
            onDisconnect: () => {
                console.log('🔌 WebSocket Disconnected');
                this.connected = false;
            }
        });

        this.client.activate();
    }

    disconnect() {
        if (this.client) {
            this.subscriptions.clear();
            this.client.deactivate();
            this.connected = false;
            console.log('👋 Disconnected from WebSocket');
        }
    }

    /**
     * Subscribe để nhận thông báo cá nhân cho user
     * @param {string} userId - ID của user
     * @param {string} postId - ID của charging post
     * @param {function} callback - Hàm xử lý khi nhận message
     */
    subscribeToNotifications(userId, postId, callback) {
        if (!this.client || !this.connected) {
            console.error('WebSocket chưa kết nối!');
            return null;
        }

        const destination = `/user/queue/notifications/${postId}`;
        
        const subscription = this.client.subscribe(destination, (message) => {
            console.log('📩 Notification received:', message.body);
            if (callback) callback(message.body);
        });

        this.subscriptions.set(`notifications-${postId}`, subscription);
        console.log('✅ Subscribed to:', destination);
        
        return subscription;
    }

    /**
     * Subscribe topic chung (broadcast cho tất cả client)
     * @param {string} postId - ID của charging post
     * @param {function} callback - Hàm xử lý khi nhận message
     */
    subscribeToTopic(postId, callback) {
        if (!this.client || !this.connected) {
            console.error('WebSocket chưa kết nối!');
            return null;
        }

        const destination = `/topic/waiting/${postId}`;
        
        const subscription = this.client.subscribe(destination, (message) => {
            console.log('📢 Topic message:', message.body);
            if (callback) callback(message.body);
        });

        this.subscriptions.set(`topic-${postId}`, subscription);
        console.log('✅ Subscribed to:', destination);
        
        return subscription;
    }

    unsubscribe(key) {
        const subscription = this.subscriptions.get(key);
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete(key);
            console.log('❌ Unsubscribed:', key);
        }
    }

    unsubscribeAll() {
        this.subscriptions.forEach((subscription, key) => {
            subscription.unsubscribe();
            console.log('❌ Unsubscribed:', key);
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
