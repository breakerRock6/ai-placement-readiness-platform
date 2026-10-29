import React from 'react';
import StudentChatbot from './StudentChatbot';

import WebBrowser from './WebBrowser';

const StudentLayout = ({ children }) => {
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

export default StudentLayout;
