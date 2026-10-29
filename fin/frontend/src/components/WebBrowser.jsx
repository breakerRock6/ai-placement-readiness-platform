import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ArrowLeft, RotateCcw, ExternalLink, X, Search, Home, ChevronRight } from 'lucide-react';

const WebBrowser = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [url, setUrl] = useState('http://127.0.0.1:8000/browser/search');
    const [inputUrl, setInputUrl] = useState('');
    const iframeRef = useRef(null);

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        let targetUrl = inputUrl.trim();

        if (!targetUrl) return;

        // If it looks like a URL, try it directly
        if (targetUrl.includes('.') && !targetUrl.includes(' ')) {
            if (!targetUrl.startsWith('http')) {
                targetUrl = 'https://' + targetUrl;
            }
            // Route through Proxy
            const proxyUrl = `http://127.0.0.1:8000/browser/proxy?url=${encodeURIComponent(targetUrl)}`;
            setUrl(proxyUrl);
        } else {
            // Internal Search Route
            const searchUrl = `http://127.0.0.1:8000/browser/search?q=${encodeURIComponent(targetUrl)}`;
            setUrl(searchUrl);
            setInputUrl(targetUrl);
        }
    };

    const goHome = () => {
        const homeUrl = 'http://127.0.0.1:8000/browser/search';
        setUrl(homeUrl);
        setInputUrl('');
    };

    const reload = () => {
        if (iframeRef.current) {
            iframeRef.current.src = url;
        }
    };

    return (
        <>
            {/* Floating Launcher Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className="fixed right-6 bottom-24 z-50 bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-full shadow-lg shadow-emerald-600/30 flex items-center justify-center group transition-colors"
                title="Open Research Browser"
            >
                <Globe size={24} className="group-hover:rotate-12 transition-transform" />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full sm:w-[500px] md:w-[600px] lg:w-[800px] z-[60] bg-[#0f172a] shadow-2xl border-l border-white/10 flex flex-col"
                    >
                        {/* Browser Header / Nav Bar */}
                        <div className="bg-[#1e293b] p-3 border-b border-white/10 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1.5 items-center mr-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                </div>
                                <h1 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Globe size={12} /> Virtual Researcher
                                </h1>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="ml-auto p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                    <button onClick={() => window.history.back()} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition"><ArrowLeft size={18} /></button>
                                    <button onClick={reload} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition"><RotateCcw size={18} /></button>
                                    <button onClick={goHome} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition"><Home size={18} /></button>
                                </div>

                                <form onSubmit={handleSearch} className="flex-1 relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors">
                                        <Search size={14} />
                                    </div>
                                    <input
                                        type="text"
                                        value={inputUrl}
                                        onChange={(e) => setInputUrl(e.target.value)}
                                        className="w-full bg-black/30 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-gray-200 focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                                        placeholder="Enter URL or search..."
                                    />
                                </form>

                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg transition"
                                    title="Open in Chrome"
                                >
                                    <ExternalLink size={18} />
                                </a>
                            </div>

                            {/* Bookmarks bar */}
                            <div className="flex gap-2 text-[10px] overflow-x-auto scrollbar-none pb-1">
                                {['Google', 'ChatGPT', 'DeepSeek', 'LinkedIn', 'GitHub', 'Glassdoor', 'Naukri', 'MDN Docs'].map(site => (
                                    <button
                                        key={site}
                                        onClick={() => {
                                            const links = {
                                                'Google': 'https://www.google.com',
                                                'ChatGPT': 'https://chat.openai.com',
                                                'DeepSeek': 'https://chat.deepseek.com',
                                                'LinkedIn': 'https://www.linkedin.com',
                                                'GitHub': 'https://github.com',
                                                'Glassdoor': 'https://www.glassdoor.com',
                                                'Naukri': 'https://www.naukri.com',
                                                'MDN Docs': 'https://developer.mozilla.org'
                                            };
                                            const target = links[site];
                                            const proxyUrl = `http://127.0.0.1:8000/browser/proxy?url=${encodeURIComponent(target)}`;
                                            setUrl(proxyUrl);
                                            setInputUrl(target);
                                        }}
                                        className="bg-white/5 hover:bg-white/10 px-2 py-1 rounded border border-white/5 text-gray-400 hover:text-white flex items-center gap-1 transition"
                                    >
                                        <Globe size={10} /> {site}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Iframe Content */}
                        <div className="flex-1 bg-white relative">
                            {/* Warning Overlay for complex sites */}
                            <div className="absolute bottom-4 left-4 right-4 bg-amber-500/90 backdrop-blur text-black p-3 rounded-xl border border-amber-600 shadow-xl z-10 text-center space-y-2">
                                <p className="text-xs font-bold flex items-center justify-center gap-2">
                                    ⚠️ Some sites block in-app views for security.
                                </p>
                                <p className="text-[10px] opacity-80">
                                    If the page below is blank, use the blue button at the top to open it in a new tab.
                                </p>
                            </div>

                            <iframe
                                ref={iframeRef}
                                src={url}
                                className="w-full h-full border-none"
                                title="In-App Browser"
                                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                            />
                        </div>

                        {/* Status Bar */}
                        <div className="bg-[#1e293b] p-2 text-[10px] text-gray-500 flex justify-between px-4 border-t border-white/10">
                            <span className="flex items-center gap-1">
                                <Search size={10} /> Mode: Secure Private Browsing
                            </span>
                            <span className="flex items-center gap-2">
                                Built-in AdBlocker Active <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default WebBrowser;
