import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('username', email);
            formData.append('password', password);
            const res = await api.post('/token', formData);
            login(res.data.access_token);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login to Portfolio</h2>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                    />
                    <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded font-bold hover:bg-blue-700 transition-colors">
                        Login
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <Link to="/forgot-password" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Forgot Password?</Link>
                </div>
                <p className="mt-4 text-center text-gray-600">
                    Don't have an account? <Link to="/register" className="text-blue-600 font-semibold hover:underline">Register</Link>
                </p>
            </div>
        </div>
    );
};
export default Login;
