import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { Mail, KeyRound, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2>(1); // 1: Email, 2: OTP + New Password
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            await api.post('/auth/forgot-password', { email });
            setSuccessMessage(`Verification code sent to ${email}`);
            setStep(2);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || 'Failed to send code. User may not verify.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            await api.post('/auth/reset-password', { email, otp, new_password: newPassword });
            setSuccessMessage("Password reset successfully! Redirecting...");
            setTimeout(() => navigate('/login'), 2000);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || 'Failed to reset password. Invalid code?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <KeyRound size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Forgot Password?</h2>
                    <p className="text-gray-500 text-sm mt-2">
                        {step === 1 ? "Enter your email to receive a reset code." : "Enter the code and your new password."}
                    </p>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center">{error}</div>}
                {successMessage && <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-6 text-center flex items-center justify-center gap-2"><CheckCircle2 size={16} /> {successMessage}</div>}

                {/* Step 1: Email Form */}
                {step === 1 && (
                    <form onSubmit={handleSendCode} className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Send Code"}
                        </button>
                    </form>
                )}

                {/* Step 2: OTP & New Password Form */}
                {step === 2 && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Verification Code</label>
                            <input
                                type="text"
                                placeholder="Enter 6-digit code"
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center tracking-widest text-lg font-mono placeholder:tracking-normal placeholder:font-sans placeholder:text-base"
                                required
                            />
                        </div>

                        <div className="pt-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase ml-1">New Password</label>
                            <input
                                type="password"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                                minLength={6}
                            />
                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="w-full mt-2 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Reset Password"}
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center">
                    <Link to="/login" className="text-gray-500 hover:text-gray-800 text-sm font-medium flex items-center justify-center gap-1 transition-colors">
                        <ArrowLeft size={16} /> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
