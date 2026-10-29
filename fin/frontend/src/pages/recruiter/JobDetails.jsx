import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';
import StudentProfileModal from '../../components/StudentProfileModal';

const JobDetails = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null); // For Profile Modal

    useEffect(() => {
        fetchJobDetails();
    }, [jobId]);

    const fetchJobDetails = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get(`http://localhost:5000/api/recruiter/job/${jobId}`, config);
            setJob(data);
        } catch (error) {
            console.error('Error fetching job details', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (studentId, status) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.put(`http://localhost:5000/api/recruiter/job/${jobId}/applicant/${studentId}`, { status }, config);
            fetchJobDetails(); // Refresh
        } catch (error) {
            alert('Status update failed');
        }
    };

    if (loading) return <div className="text-white text-center mt-20">Loading Job Details...</div>;
    if (!job) return <div className="text-white text-center mt-20">Job not found</div>;

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-8">
            <button onClick={() => navigate('/recruiter/dashboard')} className="flex items-center text-gray-400 hover:text-white mb-8 transition">
                <ChevronLeft size={20} /> Back to Dashboard
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Job Info */}
                <div className="lg:col-span-1 bg-white/5 border border-white/10 p-8 rounded-3xl h-fit">
                    <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                    <p className="text-blue-400 mb-6">{job.company}</p>
                    <div className="space-y-4 text-sm text-gray-300">
                        <p><strong>Location:</strong> {job.location}</p>
                        <p><strong>Salary:</strong> {job.salaryRange}</p>
                        <p><strong>Type:</strong> {job.type}</p>
                    </div>
                    <div className="mt-8">
                        <h4 className="text-xs uppercase text-gray-500 tracking-widest mb-4">Required Skills</h4>
                        <div className="flex flex-wrap gap-2">
                            {job.skillsRequired.map(s => <span key={s} className="bg-white/10 px-3 py-1 rounded-full text-xs">{s}</span>)}
                        </div>
                    </div>
                </div>

                {/* Applicant List */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold mb-4">Applicants ({job.applicants.length})</h2>
                    <div className="space-y-4">
                        {job.applicants.map((app, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                            >
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="font-bold text-lg">{app.student.name}</h4>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${app.status === 'Shortlisted' ? 'bg-emerald-500/20 text-emerald-400' :
                                            app.status === 'Rejected' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                                            }`}>
                                            {app.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400 mb-3">{app.student?.email}</p>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {app.skills?.slice(0, 3).map(s => <span key={s} className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-400">{s}</span>)}
                                    </div>
                                    <button
                                        onClick={() => setSelectedStudent(app.student)}
                                        className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                                    >
                                        View Full Profile
                                    </button>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <span className="block text-2xl font-bold text-emerald-400">{app.matchScore}%</span>
                                        <span className="text-[10px] text-gray-500">Match Rate</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            <button onClick={() => handleUpdateStatus(app.student._id, 'Shortlisted')} className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition"><CheckCircle size={20} /></button>
                                            <button onClick={() => handleUpdateStatus(app.student._id, 'Rejected')} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition"><XCircle size={20} /></button>
                                            <button className="p-2 bg-amber-500/10 text-amber-400 rounded-lg hover:bg-amber-500/20 transition"><Clock size={20} /></button>
                                        </div>
                                        {app.resumeUrl && (
                                            <a
                                                href={`http://localhost:5000/${app.resumeUrl}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center justify-center gap-2 px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition text-xs font-bold"
                                            >
                                                <ExternalLink size={14} /> Resume
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Student Profile Modal */}
            {selectedStudent && (
                <StudentProfileModal
                    studentId={selectedStudent._id}
                    onClose={() => setSelectedStudent(null)}
                />
            )}
        </div>
    );
};

export default JobDetails;
