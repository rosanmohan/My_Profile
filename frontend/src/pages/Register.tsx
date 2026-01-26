import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const Register = () => {
    const [step, setStep] = useState<1 | 2>(1);

    // Personal Details State
    const [title, setTitle] = useState('Mr');
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [mobileNo, setMobileNo] = useState('');
    const [email, setEmail] = useState('');

    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // Validate minimal fields here if needed
            if (!firstName || !lastName || !mobileNo) {
                setError("Please fill all required fields.");
                setLoading(false);
                return;
            }
            await api.post('/auth/send-register-otp', { email });
            setStep(2);
        } catch (err: any) {
            const msg = err.response?.data?.detail || err.message || 'Failed to send code';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/register', {
                email,
                password,
                otp,
                title,
                first_name: firstName,
                middle_name: middleName,
                last_name: lastName,
                mobile_no: `+91 ${mobileNo}`
            });
            login(res.data.access_token);
            navigate('/dashboard');
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.detail || err.message || 'Registration failed';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    {step === 1 ? 'Create Account' : 'Verify & Setup'}
                </h2>

                {error && <p className="text-red-500 mb-4 text-center text-sm bg-red-50 p-2 rounded">{error}</p>}

                {step === 1 ? (
                    <form onSubmit={handleSendCode} className="space-y-4">

                        {/* Name Section */}
                        <div className="grid grid-cols-4 gap-4">
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <select
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="Mr">Mr</option>
                                    <option value="Mrs">Mrs</option>
                                    <option value="Ms">Ms</option>
                                    <option value="Dr">Dr</option>
                                </select>
                            </div>
                            <div className="col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    value={firstName}
                                    onChange={e => setFirstName(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                                <input
                                    type="text"
                                    placeholder="Optional"
                                    value={middleName}
                                    onChange={e => setMiddleName(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Surname *</label>
                                <input
                                    type="text"
                                    placeholder="Surname"
                                    value={lastName}
                                    onChange={e => setLastName(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                        </div>

                        {/* Contact Section */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile No *</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-gray-500 font-medium border-r border-gray-300 pr-2">+91</span>
                                <input
                                    type="tel"
                                    placeholder="Mobile Number"
                                    value={mobileNo}
                                    onChange={e => {
                                        const re = /^[0-9\b]+$/;
                                        if (e.target.value === '' || re.test(e.target.value)) {
                                            setMobileNo(e.target.value)
                                        }
                                    }}
                                    className="w-full p-3 pl-14 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                    maxLength={10}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white p-3 rounded font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex justify-center mt-6"
                        >
                            {loading ? 'Sending Verification Code...' : 'Proceed to Verify'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="p-4 bg-blue-50 text-blue-800 rounded mb-4 text-sm">
                            <p>We've sent a 6-digit code to <strong>{email}</strong>.</p>
                            <button type="button" onClick={() => setStep(1)} className="text-blue-600 underline mt-1">Change details?</button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
                            <input
                                type="text"
                                placeholder="Enter 6-digit code"
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none tracking-widest text-center font-mono text-lg"
                                required
                                maxLength={6}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Set Password</label>
                            <input
                                type="password"
                                placeholder="Create a password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white p-3 rounded font-bold hover:bg-green-700 transition-colors disabled:opacity-50 flex justify-center"
                        >
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-full text-blue-600 text-sm hover:underline mt-2"
                        >
                            Back to Email
                        </button>
                    </form>
                )}
                <p className="mt-4 text-center text-gray-600">
                    Already have an account? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};
export default Register;
