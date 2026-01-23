import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Server, Globe, ShieldCheck, Zap } from 'lucide-react';
import api from '../api';

export default function Welcome() {
    const navigate = useNavigate();
    const [status, setStatus] = useState<'sleeping' | 'waking' | 'ready'>('waking');
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 500);

        // Ping the backend immediately
        checkServer();

        return () => clearInterval(interval);
    }, []);

    const checkServer = async () => {
        try {
            await api.get('/'); // Simple ping
            setStatus('ready');
        } catch (error) {
            // Keep retrying every 2 seconds until it wakes up
            setTimeout(checkServer, 2000);
        }
    };

    const handleEnter = () => {
        if (status === 'ready') {
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full grid md:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[500px]">

                {/* Left Side - Info */}
                <div className="p-10 flex flex-col justify-center bg-blue-600 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                        <Globe size={300} />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-4xl font-bold mb-4">My Portfolio</h1>
                        <p className="text-blue-100 text-lg mb-8">
                            A showcase of my professional journey, skills, and projects powered by a secure, cloud-based backend.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-blue-100">
                                <ShieldCheck className="w-6 h-6" />
                                <span>Secure Authentication</span>
                            </div>
                            <div className="flex items-center gap-3 text-blue-100">
                                <Zap className="w-6 h-6" />
                                <span>Fast & Responsive</span>
                            </div>
                            <div className="flex items-center gap-3 text-blue-100">
                                <Server className="w-6 h-6" />
                                <span>Cloud Hosted (Render)</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Side - Server Status */}
                <div className="p-10 flex flex-col items-center justify-center text-center">
                    <div className="mb-6 relative">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-colors duration-500 
                            ${status === 'ready' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                            {status === 'ready' ? (
                                <Zap size={40} className="fill-current" />
                            ) : (
                                <Server size={40} />
                            )}
                        </div>
                        {status !== 'ready' && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500"></span>
                            </span>
                        )}
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        {status === 'ready' ? 'Server is Ready!' : 'Waking up Server'}
                    </h2>

                    <p className="text-gray-500 mb-8 h-12">
                        {status === 'ready' ?
                            "The backend is active and ready for your connection." :
                            `We are on a free tier hosting, so this might take up to a minute${dots}`}
                    </p>

                    <button
                        onClick={handleEnter}
                        disabled={status !== 'ready'}
                        className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2
                            ${status === 'ready'
                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl scale-100'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed scale-95'}`}
                    >
                        {status === 'ready' ? (
                            <>Enter Application <Zap size={18} /></>
                        ) : (
                            <><Loader2 className="animate-spin" size={18} /> Please Wait...</>
                        )}
                    </button>

                    {status !== 'ready' && (
                        <p className="mt-4 text-xs text-orange-500 bg-orange-50 px-3 py-1 rounded-full animate-pulse">
                            Tip: Don't close this tab, it will auto-ready!
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
