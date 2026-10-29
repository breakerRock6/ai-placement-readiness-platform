import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Sparkles, Book, Code, Zap } from 'lucide-react';
import axios from 'axios';

const Chatbot = () => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: '👋 Hi! I\'m your Documentation Assistant. Ask me anything about the Student Placement Portal project!',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [faq, setFAQ] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchFAQ();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchFAQ = async () => {
        try {
            const { data } = await axios.get('http://127.0.0.1:5000/api/chatbot/faq');
            setFAQ(data);
        } catch (error) {
            console.error('Error fetching FAQ:', error);
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = {
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const { data } = await axios.post('http://127.0.0.1:5000/api/chatbot/query', {
                query: input
            });

            const assistantMessage = {
                role: 'assistant',
                content: data.answer,
                sources: data.sources,
                timestamp: new Date(data.timestamp)
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            const errorMessage = {
                role: 'assistant',
                content: '❌ Sorry, I encountered an error. Please try again.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleFAQClick = (question) => {
        setInput(question);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Documentation Assistant</h1>
                            <p className="text-gray-400 text-sm">Ask me anything about the project</p>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* FAQ Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1"
                    >
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Book size={20} className="text-indigo-400" />
                                Common Questions
                            </h2>
                            <div className="space-y-2">
                                {faq.map((item, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleFAQClick(item.question)}
                                        className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 transition text-sm border border-white/5 hover:border-indigo-500/50"
                                    >
                                        <div className="text-xs text-indigo-400 mb-1">{item.category}</div>
                                        <div className="text-gray-300">{item.question}</div>
                                    </button>
                                ))}
                            </div>

                            {/* Quick Links */}
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                                    <Code size={16} className="text-purple-400" />
                                    Quick Links
                                </h3>
                                <div className="space-y-2 text-xs">
                                    <a href="http://127.0.0.1:5173" target="_blank" rel="noopener noreferrer" className="block p-2 rounded-lg bg-white/5 hover:bg-white/10 transition">
                                        🌐 Frontend (Port 5173)
                                    </a>
                                    <a href="http://127.0.0.1:5000" target="_blank" rel="noopener noreferrer" className="block p-2 rounded-lg bg-white/5 hover:bg-white/10 transition">
                                        🔧 Backend API (Port 5000)
                                    </a>
                                    <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noopener noreferrer" className="block p-2 rounded-lg bg-white/5 hover:bg-white/10 transition">
                                        🤖 AI Engine Docs (Port 8000)
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Chat Area */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-2"
                    >
                        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col h-[700px]">
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                <AnimatePresence>
                                    {messages.map((message, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[80%] ${message.role === 'user' ? 'bg-indigo-600' : 'bg-white/10'} rounded-2xl p-4`}>
                                                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                                                {message.sources && message.sources.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-white/10">
                                                        <div className="text-xs text-gray-400 mb-2">📚 Sources:</div>
                                                        {message.sources.map((source, idx) => (
                                                            <div key={idx} className="text-xs text-gray-500 mb-1">
                                                                • {source.document} (line {source.line})
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="text-xs text-gray-500 mt-2">
                                                    {message.timestamp.toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {loading && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex justify-start"
                                    >
                                        <div className="bg-white/10 rounded-2xl p-4">
                                            <div className="flex gap-2">
                                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 border-t border-white/10 bg-white/5">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Ask about setup, features, algorithms..."
                                        className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition"
                                        disabled={loading}
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={loading || !input.trim()}
                                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-xl transition flex items-center gap-2"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                                <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                    <Zap size={12} /> Powered by project documentation
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;
