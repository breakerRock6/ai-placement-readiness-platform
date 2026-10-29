import React from 'react';
import WebBrowser from './WebBrowser';
import StudentChatbot from './StudentChatbot'; // Reuse the chatbot for recruiters too as career assistant

const RecruiterLayout = ({ children }) => {
    return (
        <div className="relative min-h-screen">
            {/* Main Content */}
            <main className="w-full">
                {children}
            </main>

            {/* Global Features */}
            <StudentChatbot />
            <WebBrowser />
        </div>
    );
};

export default RecruiterLayout;
