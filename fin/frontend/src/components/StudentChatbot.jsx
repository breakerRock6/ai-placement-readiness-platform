import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Send, X, Minimize2, Maximize2, Sparkles, Bot, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StudentChatbot = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi! I'm your AI Career Assistant. How can I help you today?", sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const [profile, setProfile] = useState(null);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (!userInfo) return;

            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };
            const { data } = await axios.get('http://localhost:5000/api/student/profile', config);
            setProfile(data);
        } catch (error) {
            console.error('Error fetching profile for chatbot', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMsg = { id: Date.now(), text: inputValue, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            const { data } = await axios.post('http://localhost:8000/chat', {
                message: userMsg.text,
                context: {
                    resumeScore: profile?.resumeScore || null,
                    skills: profile?.skills || []
                }
            });

            setTimeout(() => {
                const botMsg = {
                    id: Date.now() + 1,
                    text: data.reply,
                    reasoning: data.reasoning,
                    sender: 'bot'
                };
                setMessages(prev => [...prev, botMsg]);
                setIsTyping(false);
            }, 500);
        } catch (error) {
            console.error('Chat error:', error);
            setIsTyping(false);
            setMessages(prev => [...prev, { id: Date.now() + 1, text: "Sorry, I'm having trouble connecting to the AI. Please try again.", sender: 'bot', isError: true }]);
        }
    };

    const suggestions = [
        "How to improve my resume?",
        "Top skills for 2026?",
        "Interview preparation tips",
        "What is the average package?"
    ];

    return (
        <div className={`fixed left-6 bottom-6 z-50 transition-all duration-300 ${isOpen ? 'w-80 sm:w-96' : 'w-auto'}`}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px]"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-white/20 rounded-lg">
                                    <Bot size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">AI Career Guide</h3>
                                    <span className="flex items-center text-[10px] text-blue-100 gap-1">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                        Online
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded transition"
                            >
                                <Minimize2 size={18} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0f172a] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${msg.sender === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : msg.isError ? 'bg-red-500/20 text-red-200 border border-red-500/30' : 'bg-[#1e293b] text-gray-200 rounded-tl-none border border-white/10'
                                        }`}>

                                        {/* DeepSeek-style Reasoning Block */}
                                        {msg.sender === 'bot' && msg.reasoning && (
                                            <div className="mb-3 text-xs bg-black/20 rounded-lg p-2 border border-white/5">
                                                <details className="group">
                                                    <summary className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-blue-300 transition-colors font-mono select-none list-none">
                                                        <Brain size={12} className="opacity-70" />
                                                        <span>Thought Process</span>
                                                        <span className="opacity-0 group-open:opacity-100 transition-opacity text-[10px] ml-auto">▼</span>
                                                    </summary>
                                                    <div className="mt-2 pl-2 border-l-2 border-blue-500/20 text-gray-400 font-mono text-[11px] leading-relaxed whitespace-pre-wrap animate-in fade-in slide-in-from-top-1 duration-200">
                                                        {msg.reasoning}
                                                    </div>
                                                </details>
                                            </div>
                                        )}

                                        <div className="whitespace-pre-wrap leading-relaxed">
                                            {msg.text}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white/10 text-gray-400 rounded-2xl p-3 rounded-tl-none text-xs flex gap-1 items-center">
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggestions (Quick Replies) */}
                        {messages.length === 1 && (
                            <div className="px-4 pb-2 bg-[#0f172a]">
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                                    {suggestions.map((s, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                setInputValue(s);
                                                // Ideally trigger send immediately
                                                // handleSendMessage({ preventDefault: () => {} }); // Tricky with state, best to just fill input
                                            }}
                                            className="whitespace-nowrap text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-3 py-1.5 rounded-full transition"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="p-3 bg-[#1e293b] border-t border-white/10 flex gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Ask about career, resume..."
                                className="flex-1 bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 placeholder-gray-500"
                            />
                            <button
                                type="submit"
                                disabled={!inputValue.trim() || isTyping}
                                className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isOpen && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center group"
                >
                    <MessageSquare size={24} className="group-hover:rotate-12 transition-transform" />
                </motion.button>
            )}
        </div>
    );
};

export default StudentChatbot;
