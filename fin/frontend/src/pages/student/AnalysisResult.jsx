import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, XCircle, ChevronLeft, BarChart2, AlertCircle, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const AnalysisResult = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get('http://127.0.0.1:5000/api/student/profile', config);
                setProfile(data);
            } catch (error) {
                console.error('Error fetching profile', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return <div className="text-white text-center mt-20">Loading Analysis...</div>;

    // PRS Breakdown Data for Pie Chart
    const breakdownData = profile?.prsBreakdown ? Object.entries(profile.prsBreakdown || {}).map(([name, value]) => ({
        name: name.replace('_', ' ').toUpperCase(),
        value: value
    })) : [
        { name: 'Skill Match', value: profile?.resumeScore || 0 },
        { name: 'Gap', value: 100 - (profile?.resumeScore || 0) }
    ];

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-8">
            <button
                onClick={() => navigate('/student/dashboard')}
                className="flex items-center text-gray-400 hover:text-white mb-8 transition"
            >
                <ChevronLeft size={20} /> Back to Dashboard
            </button>

            <div className="flex justify-between items-start mb-12">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Advanced Intelligence Report</h1>
                    <p className="text-gray-400 text-sm">Powered by 2026 Trend-Aware Analysis engine.</p>
                </div>
                <div className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl border border-emerald-500/20 text-sm font-bold">
                    Target: {profile?.marketStandardUsed || 'Industrial Standard'}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: PRS Breakdown Chart */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/5 border border-white/10 p-8 rounded-3xl flex flex-col items-center"
                >
                    <h3 className="text-xl font-bold mb-8">PRS Breakdown</h3>
                    <div className="w-full h-64 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={breakdownData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {breakdownData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.1)" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-4xl font-black text-emerald-400">{profile?.prs}%</span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest">Total Readiness</span>
                        </div>
                    </div>

                    <div className="w-full mt-6 space-y-2">
                        {breakdownData.map((d, i) => (
                            <div key={i} className="flex justify-between items-center text-xs">
                                <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                                    <span className="text-gray-400">{d.name}</span>
                                </span>
                                <span className="font-bold">{d.value}%</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Right: Detailed Analysis */}
                <div className="lg:col-span-2 space-y-6">
                    {/* XAI Explanation */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 p-8 rounded-3xl"
                    >
                        <h3 className="text-xl font-bold mb-4 flex items-center text-indigo-300">
                            <BarChart2 className="mr-2" size={20} /> AI Logic (XAI)
                        </h3>
                        <p className="text-gray-300 leading-relaxed italic text-sm">
                            "{profile?.explanation || 'No explanation generated yet.'}"
                        </p>
                    </motion.div>

                    {/* Skill Categorization & Gaps */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white/5 border border-white/10 p-6 rounded-3xl"
                        >
                            <h3 className="text-lg font-bold mb-4 flex items-center">
                                <CheckCircle className="mr-2 text-emerald-400" /> Categorized Skills
                            </h3>
                            <div className="space-y-4">
                                {profile?.categorizedSkills && Object.entries(profile.categorizedSkills || {}).map(([cat, skills]) => (
                                    <div key={cat}>
                                        <h4 className="text-[10px] uppercase text-gray-500 mb-2 tracking-tighter">{cat}</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {skills.map(s => (
                                                <span key={s} className="bg-white/5 px-2 py-1 rounded-md text-[10px] border border-white/5">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {(!profile?.categorizedSkills || Object.keys(profile.categorizedSkills).length === 0) && (
                                    <div className="flex flex-wrap gap-2">
                                        {profile?.skills?.map(s => (
                                            <span key={s} className="bg-white/5 px-2 py-1 rounded-md text-[10px]">{s}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white/5 border border-white/10 p-6 rounded-3xl"
                        >
                            <h3 className="text-lg font-bold mb-4 flex items-center">
                                <AlertCircle className="mr-2 text-amber-400" /> Skill Gaps & Paths
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-[10px] uppercase text-red-500 mb-2">Critical Gaps</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {profile?.gaps?.critical?.map(s => (
                                            <span key={s} className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded-md text-[10px]">{s}</span>
                                        ))}
                                        {(!profile?.gaps?.critical || profile.gaps.critical.length === 0) && <span className="text-xs text-gray-500">None identified</span>}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-[10px] uppercase text-blue-500 mb-2">Upskilling Paths</h4>
                                    <ul className="space-y-1">
                                        {profile?.gaps?.upskilling_paths?.map((path, i) => (
                                            <li key={i} className="text-[10px] text-gray-400 flex items-center gap-2">
                                                <div className="w-1 h-1 bg-blue-500 rounded-full" /> {path}
                                            </li>
                                        ))}
                                        {(!profile?.gaps?.upskilling_paths || profile.gaps.upskilling_paths.length === 0) && <li className="text-xs text-gray-500">No paths suggested</li>}
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex justify-between items-center">
                        <div className="flex gap-8">
                            <div>
                                <p className="text-xs text-gray-500">Detected Experience</p>
                                <p className="text-lg font-bold">{profile?.experienceYears || 0} Years</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Market Potential</p>
                                <p className="text-lg font-bold text-blue-400">{profile?.prs > 75 ? 'High' : profile?.prs > 50 ? 'Moderate' : 'Developing'}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/student/dashboard')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl text-sm font-bold transition"
                        >
                            Optimize Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalysisResult;
