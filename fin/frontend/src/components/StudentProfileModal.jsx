import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';

const StudentProfileModal = ({ studentId, onClose }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get(`http://127.0.0.1:5000/api/recruiter/student/${studentId}`, config);
                setProfile(data);
            } catch (error) {
                console.error('Error fetching student profile', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [studentId]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#1e293b] border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
            >
                <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold">{profile?.user?.name || 'Loading...'}</h2>
                            <p className="text-gray-400">{profile?.user?.email}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition">
                            <XCircle size={24} className="text-gray-500" />
                        </button>
                    </div>

                    {loading ? (
                        <div className="py-20 text-center text-gray-400">Loading profile...</div>
                    ) : (
                        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                            {profile?.prs && (
                                <div className="bg-indigo-500/5 border border-indigo-500/20 p-4 rounded-2xl mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-indigo-300 text-xs font-bold uppercase tracking-widest">AI Placement Intelligence</h3>
                                        <span className="text-2xl font-black text-indigo-400">{profile.prs}%</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 italic">
                                        "{profile.explanation}"
                                    </p>
                                </div>
                            )}

                            <div>
                                <h3 className="text-emerald-400 text-sm font-bold uppercase tracking-wider mb-2">Education</h3>
                                {profile?.education?.length > 0 ? profile.education.map((edu, i) => (
                                    <div key={i} className="mb-2 last:mb-0">
                                        <p className="font-bold">{edu.institution}</p>
                                        <p className="text-sm text-gray-400">{edu.degree} ({edu.year})</p>
                                    </div>
                                )) : <p className="text-gray-500 text-sm italic">No education details provided.</p>}
                            </div>

                            <div>
                                <h3 className="text-blue-400 text-sm font-bold uppercase tracking-wider mb-2">Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {profile?.skills?.map(s => (
                                        <span key={s} className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs text-gray-300">{s}</span>
                                    ))}
                                </div>
                            </div>

                            {profile?.experience?.length > 0 && (
                                <div>
                                    <h3 className="text-amber-400 text-sm font-bold uppercase tracking-wider mb-2">Experience</h3>
                                    {profile.experience.map((exp, i) => (
                                        <div key={i} className="mb-2 last:mb-0">
                                            <p className="font-bold">{exp.title}</p>
                                            <p className="text-sm text-gray-400">{exp.company}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="pt-4 flex gap-4">
                                {profile?.resumeUrl && (
                                    <a
                                        href={`http://localhost:5000/${profile.resumeUrl}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-center transition shadow-lg shadow-blue-600/20"
                                    >
                                        View Resume
                                    </a>
                                )}
                                <button onClick={onClose} className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-xl font-bold transition border border-white/10">
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default StudentProfileModal;
