import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Briefcase, Users, PlusCircle, TrendingUp, Search, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StudentProfileModal from '../../components/StudentProfileModal';

const RecruiterDashboard = () => {
    console.log("RecruiterDashboard: CAUGHT RENDER"); // Debug Log
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [candidates, setCandidates] = useState([]); // Top matched candidates
    const [loading, setLoading] = useState(true);
    const [showPostJob, setShowPostJob] = useState(false);    // New Job Form State
    const [newJob, setNewJob] = useState({
        title: '',
        company: '',
        location: '',
        salaryRange: '',
        description: '',
        skillsRequired: ''
    });

    const [error, setError] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null); // For Profile Modal
    const [editingJob, setEditingJob] = useState(null); // For Job Edit Mode

    const fetchData = async () => {
        setLoading(true);
        try {
            const userInfoStr = localStorage.getItem('userInfo');
            if (!userInfoStr) {
                setError('No user info found. Please login.');
                setLoading(false);
                return;
            }
            const userInfo = JSON.parse(userInfoStr);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            const [jobsRes, candidatesRes] = await Promise.all([
                axios.get('http://127.0.0.1:5000/api/recruiter/jobs', config),
                axios.get('http://127.0.0.1:5000/api/recruiter/candidates', config)
            ]);

            setJobs(jobsRes.data || []);
            setCandidates(candidatesRes.data || []);
        } catch (err) {
            console.error("Dashboard Load Error:", err);
            setError(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handlePostJob = async (e) => {
        e.preventDefault();
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            const payload = {
                ...newJob,
                skillsRequired: typeof newJob.skillsRequired === 'string'
                    ? newJob.skillsRequired.split(',').map(s => s.trim())
                    : newJob.skillsRequired
            };

            if (editingJob) {
                await axios.put(`http://localhost:5000/api/recruiter/job/${editingJob._id}`, payload, config);
                setEditingJob(null);
            } else {
                await axios.post('http://127.0.0.1:5000/api/recruiter/job', payload, config);
            }

            setShowPostJob(false);
            fetchData();
            setNewJob({ title: '', company: '', location: '', salaryRange: '', description: '', skillsRequired: '' });
        } catch (error) {
            alert('Operation failed');
        }
    };

    const handleDeleteJob = async (e, jobId) => {
        e.stopPropagation();
        if (!window.confirm("Delete this job posting?")) return;
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.delete(`http://localhost:5000/api/recruiter/job/${jobId}`, config);
            fetchData();
        } catch (error) {
            alert('Delete failed');
        }
    };

    const startEditing = (e, job) => {
        e.stopPropagation();
        setEditingJob(job);
        setNewJob({
            title: job.title,
            company: job.company,
            location: job.location,
            salaryRange: job.salaryRange,
            description: job.description,
            skillsRequired: job.skillsRequired.join(', ')
        });
        setShowPostJob(true);
    };

    if (loading) return <div className="text-white text-center mt-20">Loading...</div>;
    if (error) return <div className="text-red-400 text-center mt-20">{error}</div>;

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-8">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Recruiter Dashboard</h1>
                    <p className="text-gray-400">Manage jobs and discover top talent.</p>
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

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white/5 p-6 rounded-2xl flex items-center border border-white/10">
                    <div className="bg-blue-500/20 p-3 rounded-lg mr-4 text-blue-400"><Briefcase /></div>
                    <div><h3 className="text-2xl font-bold">{jobs.length}</h3><p className="text-gray-400 text-sm">Active Jobs</p></div>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl flex items-center border border-white/10">
                    <div className="bg-emerald-500/20 p-3 rounded-lg mr-4 text-emerald-400"><Users /></div>
                    <div><h3 className="text-2xl font-bold">{candidates.length}</h3><p className="text-gray-400 text-sm">Candidates Matched</p></div>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl flex items-center border border-white/10">
                    <div className="bg-amber-500/20 p-3 rounded-lg mr-4 text-amber-400"><TrendingUp /></div>
                    <div><h3 className="text-2xl font-bold">85%</h3><p className="text-gray-400 text-sm">Avg Match Rate</p></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Jobs */}
                <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Active Postings</h2>
                        <button
                            onClick={() => setShowPostJob(!showPostJob)}
                            className="flex items-center text-sm bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
                        >
                            <PlusCircle size={16} className="mr-2" /> Post Job
                        </button>
                    </div>

                    {showPostJob && (
                        <motion.form
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-white/5 p-6 rounded-xl mb-6 space-y-4 border border-white/10"
                            onSubmit={handlePostJob}
                        >
                            <input placeholder="Job Title" className="w-full bg-black/20 p-3 rounded-lg border border-white/10 text-white" required value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })} />
                            <input placeholder="Company Name" className="w-full bg-black/20 p-3 rounded-lg border border-white/10 text-white" required value={newJob.company} onChange={e => setNewJob({ ...newJob, company: e.target.value })} />
                            <input placeholder="Skills (comma separated)" className="w-full bg-black/20 p-3 rounded-lg border border-white/10 text-white" required value={newJob.skillsRequired} onChange={e => setNewJob({ ...newJob, skillsRequired: e.target.value })} />
                            <div className="flex gap-4">
                                <input placeholder="Location" className="w-1/2 bg-black/20 p-3 rounded-lg border border-white/10 text-white" required value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })} />
                                <input placeholder="Salary Range" className="w-1/2 bg-black/20 p-3 rounded-lg border border-white/10 text-white" required value={newJob.salaryRange} onChange={e => setNewJob({ ...newJob, salaryRange: e.target.value })} />
                            </div>
                            <textarea placeholder="Job Description" className="w-full bg-black/20 p-3 rounded-lg border border-white/10 text-white" rows="3" required value={newJob.description} onChange={e => setNewJob({ ...newJob, description: e.target.value })}></textarea>
                            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 py-3 rounded-lg font-bold">
                                {editingJob ? 'Save Changes' : 'Publish Job'}
                            </button>
                            {editingJob && (
                                <button
                                    type="button"
                                    onClick={() => { setEditingJob(null); setShowPostJob(false); setNewJob({ title: '', company: '', location: '', salaryRange: '', description: '', skillsRequired: '' }); }}
                                    className="w-full bg-white/5 hover:bg-white/10 py-2 rounded-lg text-sm mt-2"
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </motion.form>
                    )}

                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                        {jobs.map(job => (
                            <div
                                key={job._id}
                                onClick={() => navigate(`/recruiter/job/${job._id}`)}
                                className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-blue-500/30 transition cursor-pointer"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-bold text-lg">{job.title}</h3>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={(e) => startEditing(e, job)}
                                            className="p-1.5 hover:bg-blue-500/20 text-blue-400 rounded-lg transition"
                                            title="Edit Job"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteJob(e, job._id)}
                                            className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                                            title="Delete Job"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/20 ml-2">
                                            {job.applicants?.length || 0} Applicants
                                        </span>
                                    </div>
                                </div>
                                <p className="text-gray-400 text-sm mb-2">{job.company} • {job.location}</p>
                                <div className="flex flex-wrap gap-2">
                                    {job.skillsRequired.map(s => <span key={s} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">{s}</span>)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Candidates */}
                <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                    <h2 className="text-xl font-bold mb-6 flex items-center">
                        <Search className="mr-2 text-emerald-400" /> Top Matched Talent
                    </h2>
                    <div className="space-y-4">
                        {candidates.map(candidate => (
                            <div key={candidate._id} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                                <div>
                                    <h4 className="font-bold">{candidate.user?.name || 'Unknown Student'}</h4>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {candidate.skills?.slice(0, 3).join(', ')}...
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="block text-2xl font-bold text-emerald-400">{candidate.matchScore}%</span>
                                    <span className="text-xs text-gray-500">Match Score</span>
                                    {candidate.resumeUrl && (
                                        <a
                                            href={`http://localhost:5000/${candidate.resumeUrl}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="block mt-2 text-[10px] bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 px-2 py-1 rounded border border-blue-500/20 font-bold uppercase transition text-center"
                                        >
                                            Open Resume
                                        </a>
                                    )}
                                    <button
                                        onClick={() => setSelectedStudent(candidate.user)}
                                        className="block mt-1 text-[10px] text-gray-400 hover:text-white font-bold uppercase transition mx-auto"
                                    >
                                        Full Profile
                                    </button>
                                </div>
                            </div>
                        ))}
                        {candidates.length === 0 && <p className="text-gray-500 text-center">No candidates found yet.</p>}
                    </div>
                </div>
            </div>

            {/* Profile Modal */}
            {selectedStudent && (
                <StudentProfileModal
                    studentId={selectedStudent._id}
                    onClose={() => setSelectedStudent(null)}
                />
            )}
        </div>
    );
};

export default RecruiterDashboard;
