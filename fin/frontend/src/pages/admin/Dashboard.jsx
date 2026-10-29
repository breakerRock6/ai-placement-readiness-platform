import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Users, Briefcase, CheckCircle, Activity, Server, Database, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // overview, users, jobs
    const [users, setUsers] = useState([]);
    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('http://localhost:5000/api/admin/analytics', config);
            setAnalytics(data);
        } catch (error) {
            console.error('Error fetching analytics', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('http://localhost:5000/api/admin/users', config);
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users', error);
        }
    };

    const fetchJobs = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('http://localhost:5000/api/admin/jobs', config);
            setJobs(data);
        } catch (error) {
            console.error('Error fetching jobs', error);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user? All related data (profile/jobs) will be lost.")) return;
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.delete(`http://localhost:5000/api/admin/user/${userId}`, config);
            fetchUsers();
            fetchAnalytics(); // Update counts
        } catch (error) {
            alert(error.response?.data?.message || 'Delete failed');
        }
    };

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'jobs') fetchJobs();
    }, [activeTab]);

    if (loading) return <div className="text-white text-center mt-20">Loading System Analytics...</div>;

    const cards = [
        { title: 'Total Users', value: analytics?.users.total || 0, icon: <Users size={24} />, color: 'bg-blue-500', desc: `${analytics?.users.students} Students, ${analytics?.users.recruiters} Recruiters` },
        { title: 'Active Jobs', value: analytics?.jobs.active || 0, icon: <Briefcase size={24} />, color: 'bg-emerald-500', desc: 'Across 15+ Companies' },
        { title: 'Placements', value: analytics?.placements.placed || 0, icon: <CheckCircle size={24} />, color: 'bg-amber-500', desc: `Avg Package: ${analytics?.placements.avgPackage}` },
        { title: 'System Health', value: '98%', icon: <Server size={24} />, color: 'bg-purple-500', desc: 'All Services Operational' },
    ];

    const formatTime = (time) => {
        const date = new Date(time);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-8">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Admin Control Center</h1>
                    <p className="text-gray-400">System Overview & Analytics.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white/5 p-1 rounded-xl border border-white/10 flex">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-4 py-2 rounded-lg transition text-sm font-medium ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-400 hover:text-white'}`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-4 py-2 rounded-lg transition text-sm font-medium ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-400 hover:text-white'}`}
                        >
                            Users
                        </button>
                        <button
                            onClick={() => setActiveTab('jobs')}
                            className={`px-4 py-2 rounded-lg transition text-sm font-medium ${activeTab === 'jobs' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-400 hover:text-white'}`}
                        >
                            Jobs
                        </button>
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
                </div>
            </header>

            {activeTab === 'overview' && (
                <>
                    {/* Analytics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {cards.map((card, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white/5 border border-white/10 p-6 rounded-2xl"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl ${card.color} shadow-lg shadow-blue-500/20`}>
                                        {card.icon}
                                    </div>
                                    <span className="bg-white/5 text-xs px-2 py-1 rounded text-gray-400">Total</span>
                                </div>
                                <h3 className="text-3xl font-bold mb-2">{card.value}</h3>
                                <p className="text-gray-400 text-sm font-medium">{card.title}</p>
                                <p className="text-xs text-gray-500 mt-2">{card.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Recent Activity */}
                        <div className="lg:col-span-2 bg-white/5 border border-white/10 p-8 rounded-3xl">
                            <h2 className="text-xl font-bold mb-6 flex items-center">
                                <Activity className="mr-2 text-blue-400" /> Recent System Activity
                            </h2>
                            <div className="space-y-6">
                                {analytics?.recentActivity.map((act) => (
                                    <div key={act.id} className="flex items-center space-x-4 pb-4 border-b border-white/5 last:border-0">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-white">{act.action}</h4>
                                            <p className="text-sm text-gray-400">{act.details}</p>
                                        </div>
                                        <span className="text-xs text-gray-500">{formatTime(act.time)}</span>
                                    </div>
                                ))}
                                {analytics?.recentActivity.length === 0 && <p className="text-gray-500 py-4">No recent activity detected.</p>}
                            </div>
                        </div>

                        {/* System Stats Mockup */}
                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                            <h2 className="text-xl font-bold mb-6 flex items-center">
                                <Database className="mr-2 text-purple-400" /> Resource Usage
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-400">AI Engine Load</span>
                                        <span className="text-emerald-400">Normal</span>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-2">
                                        <div className="bg-emerald-500 h-2 rounded-full w-[35%]"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-400">Database Storage</span>
                                        <span className="text-amber-400">1.2 GB / 5 GB</span>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-2">
                                        <div className="bg-amber-500 h-2 rounded-full w-[24%]"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-400">Memory Usage</span>
                                        <span className="text-blue-400">45%</span>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-2">
                                        <div className="bg-blue-500 h-2 rounded-full w-[45%]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'users' && (
                <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                    <div className="p-8 border-b border-white/10 flex justify-between items-center">
                        <h2 className="text-2xl font-bold">User Management</h2>
                        <span className="text-sm text-gray-400">{users.length} Total Registered Users</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-xs uppercase tracking-widest text-gray-400 font-bold border-b border-white/10">
                                <tr>
                                    <th className="px-8 py-4">Name</th>
                                    <th className="px-8 py-4">Email</th>
                                    <th className="px-8 py-4">Role</th>
                                    <th className="px-8 py-4">Joined At</th>
                                    <th className="px-8 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.map((user) => (
                                    <tr key={user._id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-8 py-4 font-medium">{user.name}</td>
                                        <td className="px-8 py-4 text-gray-400">{user.email}</td>
                                        <td className="px-8 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                                                user.role === 'recruiter' ? 'bg-blue-500/20 text-blue-400' :
                                                    'bg-emerald-500/20 text-emerald-400'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4 text-sm text-gray-500">{formatTime(user.createdAt)}</td>
                                        <td className="px-8 py-4 text-center">
                                            {user.role !== 'admin' && (
                                                <button
                                                    onClick={() => handleDeleteUser(user._id)}
                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'jobs' && (
                <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                    <div className="p-8 border-b border-white/10 flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Job Postings</h2>
                        <span className="text-sm text-gray-400">{jobs.length} Active Jobs</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-xs uppercase tracking-widest text-gray-400 font-bold border-b border-white/10">
                                <tr>
                                    <th className="px-8 py-4">Title</th>
                                    <th className="px-8 py-4">Company</th>
                                    <th className="px-8 py-4">Recruiter</th>
                                    <th className="px-8 py-4">Applicants</th>
                                    <th className="px-8 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {jobs.map((job) => (
                                    <tr key={job._id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-8 py-4 font-medium">{job.title}</td>
                                        <td className="px-8 py-4 text-gray-400">{job.company}</td>
                                        <td className="px-8 py-4 text-sm">{job.recruiter?.name || 'Unknown'}</td>
                                        <td className="px-8 py-4 text-center">
                                            <span className="bg-white/10 px-3 py-1 rounded-full font-bold">{job.applicants?.length || 0}</span>
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${job.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                {job.isActive ? 'Active' : 'Expired'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
