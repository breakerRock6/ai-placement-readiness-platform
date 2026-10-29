import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, ArrowLeft, Mail, Lock, User } from 'lucide-react';
import axios from 'axios';

const Login = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const role = (searchParams.get('role') || 'student').toLowerCase();

    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: role
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            const { data } = await axios.post(`http://localhost:5000${endpoint}`, formData);

            localStorage.setItem('userInfo', JSON.stringify(data));
            navigate(`/${data.role}/dashboard`);
        } catch (err) {
            console.error("Login Error:", err);
            const msg = err.response?.data?.message
                ? err.response.data.message
                : (err.message || 'Authentication failed. Server could not be reached.');
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const roleColors = {
        student: 'from-blue-600 to-indigo-700',
        recruiter: 'from-emerald-500 to-teal-700',
        admin: 'from-amber-500 to-orange-600'
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Glow */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br ${roleColors[role]} opacity-10 blur-[150px]`}></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-lg bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-12 shadow-2xl"
            >
                <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-10 text-sm font-medium">
                    <ArrowLeft size={16} className="mr-2" /> Back to Selection
                </Link>

                <div className="mb-10">
                    <h2 className="text-4xl font-black text-white capitalize mb-3">
                        {role} <span className="text-gray-400">{isLogin ? 'Login' : 'Registration'}</span>
                    </h2>
                    <p className="text-gray-400">Secure access to the Smart Placement Engine</p>
                </div>

                <AnimatePresence mode='wait'>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-8 text-sm flex items-center"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input
                                type="text"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    )}

                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input
                            type="email"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                            placeholder="University Email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input
                            type="password"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 bg-gradient-to-r ${roleColors[role]} text-white rounded-2xl font-black text-lg shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50`}
                    >
                        {loading ? 'Authenticating...' : (isLogin ? 'Sign In' : 'Create Account')}
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <p className="text-gray-400">
                        {isLogin ? "New to the platform?" : "Already have an account?"}{" "}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-white font-bold hover:underline ml-1"
                        >
                            {isLogin ? 'Register Here' : 'Login Here'}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
