import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FileText, User, Briefcase, BarChart2, Upload, CheckCircle, AlertCircle, Gamepad2, Award, Zap } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [resumeFile, setResumeFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState('');
    const [gameScores, setGameScores] = useState([]);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };
            const { data } = await axios.get('http://127.0.0.1:5000/api/student/profile', config);
            setProfile(data);

            // Fetch game scores for radar chart
            const { data: scores } = await axios.get('http://127.0.0.1:5000/api/student/game/scores', config);
            setGameScores(scores);
        } catch (error) {
            console.error('Error fetching profile/scores', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setResumeFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!resumeFile) return;

        setUploading(true);
        setUploadMessage('');

        const formData = new FormData();
        formData.append('resume', resumeFile);

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            await axios.post('http://127.0.0.1:5000/api/student/resume', formData, config);
            setUploadMessage('Resume uploaded successfully!');
            fetchProfile(); // Refresh profile to show updated status
        } catch (error) {
            setUploadMessage('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="text-white text-center mt-20">Loading...</div>;

    // Calculate Technical Rank with detailed breakdown
    const getTechnicalRank = () => {
        if (profile?.prs === undefined || profile?.prs === null) return 'Upload Resume';
        const score = profile.prs;
        if (score >= 88) return 'Elite Specialist';
        if (score >= 70) return 'Expert Practitioner';
        if (score >= 50) return 'Professional Candidate';
        return `Developing (${score}%)`;
    };

    // Calculate Cognitive Index from game scores
    const getCognitiveIndex = () => {
        if (gameScores.length === 0) return 'Play Games';
        const avgScore = Math.round(gameScores.reduce((a, b) => a + b.bestScore, 0) / gameScores.length);
        return `${avgScore}%`;
    };

    const stats = [
        { title: 'AI Placement Score', value: (profile?.prs !== undefined && profile?.prs !== null) ? `${profile.prs}%` : 'Upload Resume', icon: <FileText size={24} />, color: 'bg-indigo-500' },
        { title: 'Technical Rank', value: getTechnicalRank(), icon: <Award size={24} />, color: 'bg-purple-500' },
        { title: 'Cognitive Index', value: getCognitiveIndex(), icon: <Zap size={24} />, color: 'bg-amber-500' },
    ];

    const radarData = [
        { subject: 'Logic', A: (gameScores.find(s => s.gameType === 'problem-solving')?.bestScore / 10) || 10, fullMark: 100 },
        { subject: 'Memory', A: (gameScores.find(s => s.gameType === 'mind')?.bestScore / 5) || 10, fullMark: 100 },
        { subject: 'Reaction', A: (gameScores.find(s => s.gameType === 'car')?.bestScore / 10) || 10, fullMark: 100 },
        { subject: 'Spatial', A: (gameScores.find(s => s.gameType === 'puzzle')?.bestScore / 5) || 10, fullMark: 100 },
        { subject: 'Technical', A: profile?.prs || 10, fullMark: 100 },
    ];

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-8">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-3xl font-bold mb-2">
                        Welcome, {JSON.parse(localStorage.getItem('userInfo'))?.name || 'Student'}
                    </h1>
                    <p className="text-gray-400">
                        {JSON.parse(localStorage.getItem('userInfo'))?.email}
                    </p>
                </div>
                <button
                    onClick={() => {
                        localStorage.removeItem('userInfo');
                        navigate('/');
                    }}
                    className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition"
                >
                    Logout
                </button>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 relative">
                {profile?.prs >= 88 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute -top-12 right-0 bg-gradient-to-r from-yellow-400 to-amber-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-black shadow-lg shadow-yellow-500/20 z-10 flex items-center gap-1 border-2 border-black/20"
                    >
                        <Award size={12} /> Elite Candidate Status
                    </motion.div>
                )}
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center group hover:border-white/20 transition-all"
                    >
                        <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">{stat.title}</p>
                            <h3 className="text-2xl font-bold">{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Unified Intelligence Radar */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/5 border border-white/10 p-8 rounded-3xl flex flex-col items-center col-span-full xl:col-span-1"
                >
                    <div className="w-full mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Zap className="text-amber-400" size={20} /> Professional Cognitive Radar
                        </h2>
                        <p className="text-gray-500 text-xs">Composite analysis of Technical Proficiency vs Soft Skills</p>
                    </div>

                    <div className="w-full h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="Skills"
                                    dataKey="A"
                                    stroke="#6366f1"
                                    fill="#6366f1"
                                    fillOpacity={0.5}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 w-full">
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                            <div className="text-[10px] text-gray-500 uppercase font-bold">Hard Skills</div>
                            <div className="text-lg font-bold text-indigo-400">{profile?.prs || 0}%</div>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                            <div className="text-[10px] text-gray-500 uppercase font-bold">Soft Skills</div>
                            <div className="text-lg font-bold text-amber-400">
                                {gameScores.length > 0 ? Math.round(gameScores.reduce((a, b) => a + b.bestScore, 0) / gameScores.length) : 0}%
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Resume Upload Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/5 border border-white/10 p-8 rounded-3xl"
                >
                    <h2 className="text-xl font-bold mb-6 flex items-center">
                        <Upload className="mr-2 text-blue-400" /> Upload Resume
                    </h2>

                    <div className="bg-blue-500/5 border-2 border-dashed border-blue-500/30 rounded-2xl p-8 text-center hover:bg-blue-500/10 transition-colors">
                        <input
                            type="file"
                            accept=".pdf,.docx"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-400
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-600 file:text-white
                                hover:file:bg-blue-700
                                cursor-pointer"
                        />
                        <p className="text-xs text-gray-500 mt-4">Supported formats: PDF, DOCX (Max 5MB)</p>
                    </div>

                    {resumeFile && (
                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20"
                        >
                            {uploading ? 'Uploading...' : 'Analyze My Resume'}
                        </button>
                    )}

                    {uploadMessage && (
                        <div className={`mt-4 p-3 rounded-lg text-sm flex items-center ${uploadMessage.includes('failed') ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            {uploadMessage.includes('failed') ? <AlertCircle size={16} className="mr-2" /> : <CheckCircle size={16} className="mr-2" />}
                            {uploadMessage}
                        </div>
                    )}

                    {profile?.resumeUrl && (
                        <div className="mt-6 flex flex-col gap-3">
                            <div className="p-4 bg-white/5 rounded-xl flex justify-between items-center">
                                <span className="text-sm text-gray-300">Resume On File</span>
                                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">Uploaded</span>
                            </div>
                            <button
                                onClick={() => navigate('/student/analysis')}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition"
                            >
                                View Detailed AI Report
                            </button>
                        </div>
                    )}
                </motion.div>

                {/* Profile Quick View */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/5 border border-white/10 p-8 rounded-3xl"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold flex items-center">
                            <User className="mr-2 text-emerald-400" /> Your Profile
                        </h2>
                        <button
                            onClick={() => navigate('/student/profile-edit')}
                            className="text-sm text-blue-400 hover:text-blue-300"
                        >
                            Edit Details
                        </button>
                    </div>

                    {profile ? (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm text-gray-400">Education</h3>
                                {profile.education?.map((edu, i) => (
                                    <p key={i} className="font-medium">{edu.degree} at {edu.institution}</p>
                                )) || <p className="text-gray-500 text-sm">No education added</p>}
                            </div>

                            <button
                                onClick={() => navigate('/student/jobs')}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition mt-4"
                            >
                                View Matched Jobs ({profile.prs > 60 ? 'High Chance' : 'Standard'})
                            </button>
                            <div>
                                <h3 className="text-sm text-gray-400">Skills</h3>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {profile.skills?.map(skill => (
                                        <span key={skill} className="bg-white/10 px-3 py-1 rounded-full text-xs">{skill}</span>
                                    )) || <p className="text-gray-500 text-sm">No skills added</p>}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-400 mb-4">Profile setup incomplete</p>
                            <button className="bg-white/10 px-6 py-2 rounded-lg hover:bg-white/20 transition">Create Profile</button>
                        </div>
                    )}
                </motion.div>
                {/* Gaming Hub Quick Access */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="col-span-full bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/20 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6"
                >
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <Gamepad2 size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Cognitive Skill Hub</h2>
                            <p className="text-purple-200/60 max-w-md">Improve your memory, logic, and reaction time through clinical-grade assessment games.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/student/games')}
                        className="px-8 py-4 bg-white text-indigo-900 font-bold rounded-2xl hover:bg-purple-50 transition-all flex items-center gap-2 whitespace-nowrap"
                    >
                        Enter Gaming Hub
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default StudentDashboard;
