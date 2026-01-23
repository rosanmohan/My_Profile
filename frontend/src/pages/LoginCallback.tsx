import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginCallback = () => {
    const [searchParams] = useSearchParams();
    const { login } = useAuth();
    const navigate = useNavigate();
    const processedRef = useRef(false);

    useEffect(() => {
        if (processedRef.current) return;
        processedRef.current = true;

        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (token) {
            login(token);
            navigate('/');
        } else {
            console.error('Login failed or cancelled', error);
            navigate('/login');
        }
    }, [searchParams, login, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-xl font-semibold">Processing login...</div>
        </div>
    );
};

export default LoginCallback;
