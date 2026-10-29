import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Save, ChevronLeft, Plus, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileEdit = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        education: [],
        experience: [],
        skills: '',
        socialLinks: { linkedin: '', github: '', portfolio: '' }
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('http://localhost:5000/api/student/profile', config);

            if (data) {
                setFormData({
                    education: data.education || [],
                    experience: data.experience || [],
                    skills: data.skills ? data.skills.join(', ') : '',
                    socialLinks: data.socialLinks || { linkedin: '', github: '', portfolio: '' }
                });
            }
        } catch (error) {
            console.error('Error fetching profile', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            const payload = {
                ...formData,
                skills: formData.skills.split(',').map(s => s.trim()).filter(s => s)
            };

            await axios.post('http://localhost:5000/api/student/profile', payload, config);
            navigate('/student/dashboard');
        } catch (error) {
            console.error('Error updating profile', error);
        } finally {
            setLoading(false);
        }
    };

    // Helper to add empty education/experience
    const addEducation = () => {
        setFormData({ ...formData, education: [...formData.education, { institution: '', degree: '', year: '' }] });
    };

    const updateEducation = (index, field, value) => {
        const newEdu = [...formData.education];
        newEdu[index][field] = value;
        setFormData({ ...formData, education: newEdu });
    };

    const removeEducation = (index) => {
        const newEdu = formData.education.filter((_, i) => i !== index);
        setFormData({ ...formData, education: newEdu });
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-8">
            <button
                onClick={() => navigate('/student/dashboard')}
                className="flex items-center text-gray-400 hover:text-white mb-8 transition"
            >
                <ChevronLeft size={20} /> Back to Dashboard
            </button>

            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Edit Personal Profile</h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Education Section */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Education</h2>
                            <button type="button" onClick={addEducation} className="text-sm bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg flex items-center hover:bg-blue-500/30">
                                <Plus size={16} className="mr-1" /> Add
                            </button>
                        </div>
                        {formData.education.map((edu, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pb-4 border-b border-white/5 last:border-0 relative">
                                <input
                                    placeholder="Institution"
                                    className="bg-black/20 p-3 rounded-lg border border-white/10 text-white"
                                    value={edu.institution}
                                    onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                                />
                                <input
                                    placeholder="Degree"
                                    className="bg-black/20 p-3 rounded-lg border border-white/10 text-white"
                                    value={edu.degree}
                                    onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <input
                                        placeholder="Year"
                                        className="bg-black/20 p-3 rounded-lg border border-white/10 text-white w-full"
                                        value={edu.year}
                                        onChange={(e) => updateEducation(index, 'year', e.target.value)}
                                    />
                                    <button type="button" onClick={() => removeEducation(index)} className="text-red-400 hover:bg-red-500/20 p-2 rounded-lg">
                                        <Trash size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </motion.div>

                    {/* Skills Section */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h2 className="text-xl font-bold mb-4">Skills</h2>
                        <textarea
                            placeholder="Comma separated skills (e.g. React, Python, Java)"
                            className="w-full bg-black/20 p-4 rounded-lg border border-white/10 text-white h-32"
                            value={formData.skills}
                            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                        />
                    </motion.div>

                    {/* Social Links */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h2 className="text-xl font-bold mb-4">Social Links</h2>
                        <div className="grid grid-cols-1 gap-4">
                            <input
                                placeholder="LinkedIn URL"
                                className="bg-black/20 p-3 rounded-lg border border-white/10 text-white"
                                value={formData.socialLinks.linkedin}
                                onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, linkedin: e.target.value } })}
                            />
                            <input
                                placeholder="GitHub URL"
                                className="bg-black/20 p-3 rounded-lg border border-white/10 text-white"
                                value={formData.socialLinks.github}
                                onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, github: e.target.value } })}
                            />
                        </div>
                    </motion.div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 py-4 rounded-xl font-bold text-lg shadow-lg shadow-emerald-600/20 transition-all"
                    >
                        {loading ? 'Saving...' : 'Save Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileEdit;
