import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell } from 'lucide-react';

const NotificationToast = ({ notification, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 right-6 z-50 w-80 bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl overflow-hidden"
        >
            <div className={`h-1 w-full ${notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`} />
            <div className="p-4 flex gap-3">
                <div className={`p-2 rounded-xl h-fit ${notification.type === 'error' ? 'bg-red-500/20 text-red-200' : 'bg-blue-500/20 text-blue-200'}`}>
                    <Bell size={20} />
                </div>
                <div className="flex-1">
                    <h4 className="text-white font-semibold text-sm">{notification.title}</h4>
                    <p className="text-gray-300 text-xs mt-1 leading-relaxed">
                        {notification.message}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition h-fit"
                >
                    <X size={16} />
                </button>
            </div>
        </motion.div>
    );
};

export default NotificationToast;
