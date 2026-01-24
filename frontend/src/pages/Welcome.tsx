// ... imports remain same
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Server, Globe, ShieldCheck, Zap, MonitorCheck } from 'lucide-react';
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 transition-colors duration-1000">
            {/* Main Card Container with Transition Blue -> Green */}
            <div className={`max-w-4xl w-full grid md:grid-cols-2 rounded-3xl shadow-2xl overflow-hidden min-h-[500px] transition-all duration-700
                ${status === 'ready' ? 'shadow-green-200' : 'shadow-blue-200'}`}>

                {/* Left Side - Info (Static Blue side requested to stay as blue/white text) */}
                <div className={`p-10 flex flex-col justify-center text-white relative overflow-hidden transition-colors duration-700
                    ${status === 'ready' ? 'bg-green-600' : 'bg-blue-600'}`}>

                    <div className="absolute top-0 right-0 p-10 opacity-10">
                        <Globe size={300} />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-4xl font-bold mb-4">My Portfolio</h1>
                        <p className="text-white/90 text-lg mb-8">
                            A showcase of my professional journey, skills, and projects powered by a secure, cloud-based backend.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-white/90">
                                <ShieldCheck className="w-6 h-6" />
                                <span>Secure Authentication</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/90">
                                <Zap className="w-6 h-6" />
                                <span>Fast & Responsive</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/90">
                                <Server className="w-6 h-6" />
                                <span>Cloud Hosted (Render)</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Side - Server Status */}
                <div className="p-10 flex flex-col items-center justify-center text-center bg-white">
                    <div className="mb-6 relative">
                        {/* Circle Icon Background */}
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 
                            ${status === 'ready' ? 'bg-green-100 text-green-600 scale-110' : 'bg-blue-50 text-blue-600'}`}>
                            {status === 'ready' ? (
                                <MonitorCheck size={40} className="stroke-[1.5]" />
                            ) : (
                                <Server size={40} className="stroke-[1.5]" />
                            )}
                        </div>

                        {/* Ping Animation only when waking */}
                        {status !== 'ready' && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
                            </span>
                        )}
                    </div>

                    <h2 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${status === 'ready' ? 'text-green-700' : 'text-gray-800'}`}>
                        {status === 'ready' ? 'Server is Ready!' : 'Waking up Server'}
                    </h2>

                    <p className="text-gray-500 mb-8 h-8 font-medium">
                        {status === 'ready' ?
                            "System operational." :
                            `Waking up server, don't close please wait${dots}`}
                    </p>

                    <button
                        onClick={handleEnter}
                        disabled={status !== 'ready'}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-500 flex items-center justify-center gap-3
                            ${status === 'ready'
                                ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-green-200/50 transform hover:-translate-y-1'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    >
                        {status === 'ready' ? (
                            <>Enter Application <Zap size={20} className="fill-current" /></>
                        ) : (
                            <><Loader2 className="animate-spin" size={20} /> Please Wait...</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
