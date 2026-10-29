import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, DollarSign, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const JobMatching = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

                const [jobsRes, profileRes] = await Promise.all([
                    axios.get('http://127.0.0.1:5000/api/student/jobs', config),
                    axios.get('http://127.0.0.1:5000/api/student/profile', config)
                ]);

                const profile = profileRes.data;

                // Realistically calculate match based on profile PRS and job skills
                const matchedJobs = jobsRes.data.map(job => {
                    const profileSkills = new Set((profile?.skills || []).map(s => s.toLowerCase()));
                    const requiredSkills = job.skillsRequired || [];
                    const intersection = requiredSkills.filter(s => profileSkills.has(s.toLowerCase()));

                    // Combine Profile PRS with specific Job Skill Match
                    const jobSkillScore = requiredSkills.length > 0 ? (intersection.length / requiredSkills.length) * 100 : 100;
                    const finalMatch = profile?.prs ? (profile.prs * 0.7 + jobSkillScore * 0.3) : jobSkillScore;

                    return {
                        ...job,
                        matchScore: Math.round(finalMatch),
                        matchedSkillsCount: intersection.length
                    };
                }).sort((a, b) => b.matchScore - a.matchScore);

                setJobs(matchedJobs);
            } catch (error) {
                console.error('Error fetching jobs', error);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    const handleApply = async (jobId) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.post(`http://127.0.0.1:5000/api/student/apply/${jobId}`, {}, config);
            alert('Application submitted successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to apply');
        }
    };

    if (loading) return <div className="text-white text-center mt-20">Searching for matches...</div>;

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-8">
            <header className="mb-12 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Smart Job Matching</h1>
                    <p className="text-gray-400">Opportunities tailored to your skill profile.</p>
                </div>
                <button onClick={() => navigate('/student/dashboard')} className="text-gray-400 hover:text-white transition">Back to Dashboard</button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobs.map((job, index) => (
                    <motion.div
                        key={job._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-blue-500/50 transition-colors group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4">
                            <span className="bg-emerald-500 text-white font-bold px-3 py-1 rounded-full text-sm shadow-lg shadow-emerald-500/20">
                                {job.matchScore}% Match
                            </span>
                        </div>

                        <h3 className="text-2xl font-bold mb-1">{job.title}</h3>
                        <p className="text-blue-400 font-medium mb-4">{job.company}</p>

                        <div className="flex items-center space-x-4 text-sm text-gray-400 mb-6">
                            <span className="flex items-center"><MapPin size={16} className="mr-1" /> {job.location}</span>
                            <span className="flex items-center"><DollarSign size={16} className="mr-1" /> {job.salaryRange}</span>
                        </div>

                        <div className="mb-6">
                            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Matched Skills</p>
                            <div className="flex flex-wrap gap-2">
                                {job.skillsRequired.slice(0, 4).map(s => (
                                    <span key={s} className="bg-white/10 text-xs px-2 py-1 rounded">{s}</span>
                                ))}
                                {job.skillsRequired.length > 4 && <span className="text-xs text-gray-500">+{job.skillsRequired.length - 4} more</span>}
                            </div>
                        </div>

                        <button
                            onClick={() => handleApply(job._id)}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition shadow-lg shadow-blue-600/20"
                        >
                            Apply Now
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default JobMatching;
