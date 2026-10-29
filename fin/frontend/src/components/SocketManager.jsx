import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import NotificationToast from './NotificationToast';
import { AnimatePresence } from 'framer-motion';

const SocketManager = () => {
    const [socket, setSocket] = useState(null);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));

        // Only connect if user is logged in
        if (userInfo && userInfo.token) {
            const newSocket = io('http://localhost:5000');
            setSocket(newSocket);

            newSocket.on('connect', () => {
                console.log('Socket Connected:', newSocket.id);
                // Join the user's private room
                newSocket.emit('join_room', userInfo._id);
            });

            // Listen for global notification events

            // Recruiter Event
            newSocket.on('new_application', (data) => {
                setNotification({ ...data, type: 'info' });
                // Play notification sound if desired
                try { new Audio('/notification.mp3').play().catch(e => console.log('Audio blocked', e)); } catch (e) { }
            });

            // Student Event
            newSocket.on('application_status_update', (data) => {
                setNotification({ ...data, type: 'info' });
                try { new Audio('/notification.mp3').play().catch(e => console.log('Audio blocked', e)); } catch (e) { }
            });

            return () => newSocket.close();
        }
    }, []); // Run once on mount (reload required for login/logout to take effect in this simple version)

    const closeNotification = () => setNotification(null);

    return (
        <AnimatePresence>
            {notification && (
                <NotificationToast
                    notification={notification}
                    onClose={closeNotification}
                />
            )}
        </AnimatePresence>
    );
};

export default SocketManager;
