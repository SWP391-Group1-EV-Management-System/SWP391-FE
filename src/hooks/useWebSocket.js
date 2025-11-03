import { useEffect, useState, useCallback } from 'react';
import wsService from '../services/WebSocketService';

export const useWebSocket = (userId, postId) => {
    const [connected, setConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const [position, setPosition] = useState(null);

    useEffect(() => {
        if (!userId || !postId) return;

        // Connect to WebSocket
        wsService.connect(
            userId,
            () => setConnected(true),
            () => setConnected(false)
        );

        // Wait for connection then subscribe
        const timer = setTimeout(() => {
            if (wsService.isConnected()) {
                // Subscribe to notifications
                wsService.subscribeToNotifications(userId, postId, (message) => {
                    setMessages(prev => [...prev, { type: 'notification', text: message, time: new Date() }]);
                    
                    // Parse position from message
                    const posMatch = message.match(/vị trí số (\d+)/);
                    if (posMatch) {
                        setPosition(parseInt(posMatch[1]));
                    }
                });

                // Subscribe to topic (optional)
                wsService.subscribeToTopic(postId, (message) => {
                    setMessages(prev => [...prev, { type: 'broadcast', text: message, time: new Date() }]);
                });
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

    return { connected, messages, position, clearMessages };
};
