import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Briefcase, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
    const navigate = useNavigate();

    const roles = [
        {
            title: 'Student',
            icon: <GraduationCap size={40} className="text-white" />,
            description: 'Upload your resume, get AI-powered insights, and discover tailored career paths.',
            gradient: 'from-blue-600 to-indigo-700',
            role: 'student',
            features: ['AI Resume Parsing', 'ATS Score Check', 'Skill Gap Analysis']
        },
        {
            title: 'Recruiter',
            icon: <Briefcase size={40} className="text-white" />,
            description: 'Find top talent with precision using our explainable AI matching intelligence.',
            gradient: 'from-emerald-500 to-teal-700',
            role: 'recruiter',
            features: ['Automated Matching', 'Explainable AI Insights', 'Direct Scheduling']
        },
        {
            title: 'Admin',
            icon: <ShieldCheck size={40} className="text-white" />,
            description: 'Manage the platform and gain high-level insights into placement performance.',
            gradient: 'from-amber-500 to-orange-600',
            role: 'admin',
            features: ['System Analytics', 'Real-time Trends', 'User Management']
        }
    ];

    return (
        <div className="min-h-screen bg-[#0f172a] text-white overflow-hidden relative">
            {/* Animated Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/20 rounded-full blur-[120px] animate-pulse delay-700"></div>

            <nav className="relative z-10 flex justify-between items-center p-8 max-w-7xl mx-auto uppercase tracking-widest text-sm font-bold opacity-70">
                <div>Smart Platform</div>
                <div className="flex gap-8">
                    <span>AI Engine v1.0</span>
                    <span>Contact</span>
                </div>
            </nav>

            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-blue-600/20 text-blue-400 rounded-full border border-blue-500/30">
                        Next Generation Placement Intelligence
                    </span>
                    <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight tracking-tighter">
                        Elevate Your <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-emerald-400 to-amber-400">Career Trajectory</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-16 leading-relaxed">
                        A comprehensive AI decision support system bridging the gap between talent and opportunity through transparency and data-driven insights.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left h-full">
                    {roles.map((item, index) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                            onClick={() => navigate(`/login?role=${item.role}`)}
                            className="group cursor-pointer relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)] hover:-translate-y-2 flex flex-col justify-between"
                        >
                            <div>
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center p-3 mb-8 group-hover:scale-110 transition-transform duration-500`}>
                                    {item.icon}
                                </div>
                                <h3 className="text-3xl font-bold mb-4">{item.title}</h3>
                                <p className="text-gray-400 mb-8 leading-relaxed">
                                    {item.description}
                                </p>
                                <ul className="space-y-3 mb-12">
                                    {item.features.map(f => (
                                        <li key={f} className="flex items-center text-sm text-gray-300">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-3"></div>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex items-center text-blue-400 font-bold group-hover:text-blue-300 transition-colors">
                                Enter Portal <ArrowRight size={20} className="ml-2 group-hover:translate-x-2 transition-transform" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </main>

            <footer className="relative z-10 border-t border-white/5 py-12 text-center text-gray-500 text-sm">
                <p>&copy; 2026 Smart Campus Placement Platform. Powered by XAI Models.</p>
            </footer>
        </div>
    );
};

export default Home;
