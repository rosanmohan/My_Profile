// ... imports remain same
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Zap } from 'lucide-react';
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
        <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-1000 ease-in-out
            ${status === 'ready' ? 'bg-green-600' : 'bg-blue-600'}`}>

            <AnimatePresence mode="wait">
                <motion.div
                    key={status} // Trigger animation on status change
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, type: 'spring' }}
                    className="relative bg-white rounded-full shadow-2xl w-full max-w-[500px] aspect-square flex flex-col items-center justify-center text-center p-12 overflow-hidden"
                >
                    {/* Background Icon Watermark */}
                    {/* Background Icon Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                        <img src="/logo.png" alt="" className="w-[120%] h-[120%] object-cover grayscale" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center gap-6">

                        {/* Logo */}
                        <div className="relative mb-2">
                            <img
                                src="/logo.png"
                                alt="Portfolio Builder Logo"
                                className="w-64 h-64 object-contain drop-shadow-lg"
                            />

                            {/* Status Indicator Dot (Subtle overlay) */}
                            <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-white transition-colors duration-500
                                ${status === 'ready' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}
                            />
                        </div>

                        {/* Title & Description */}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-3">Portfolio Builder</h1>
                            <p className="text-gray-500 font-medium leading-relaxed max-w-xs mx-auto">
                                A showcase of <strong>your</strong> professional journey, skills, and projects.
                            </p>
                        </div>

                        {/* Server Status Text */}
                        <div className="h-4">
                            <p className={`text-sm font-semibold tracking-wide uppercase ${status === 'ready' ? 'text-green-600' : 'text-blue-500 animate-pulse'}`}>
                                {status === 'ready' ? (
                                    <span className="flex items-center gap-2 justify-center">
                                        Server Active
                                    </span>
                                ) : (
                                    `Waking up server${dots}`
                                )}
                            </p>
                        </div>

                        {/* Enter Button */}
                        <button
                            onClick={handleEnter}
                            disabled={status !== 'ready'}
                            className={`px-8 py-3 rounded-full font-bold text-lg transition-all duration-300 flex items-center gap-2 shadow-lg
                                ${status === 'ready'
                                    ? 'bg-green-600 hover:bg-green-700 text-white hover:scale-105'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                        >
                            {status === 'ready' ? (
                                <>Enter App <Zap size={20} className="fill-current" /></>
                            ) : (
                                <><Loader2 className="animate-spin" size={20} /> Please Wait</>
                            )}
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
