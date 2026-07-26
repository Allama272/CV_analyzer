import React, { useState } from 'react';
import { supabase } from '@/supabaseClient';

const API_URL = 'https://localhost:7240'; // Example for local development

type ApiResult = {
    status?: number;
    data?: any; // Using 'any' for simplicity in a test component
    error?: string;
} | null;

interface ResultDisplayProps {
    result: ApiResult;
}

const AuthTest: React.FC = () => {
    // Use the 'ApiResult' type for our state
    const [publicResult, setPublicResult] = useState<ApiResult>(null);
    const [protectedResult, setProtectedResult] = useState<ApiResult>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // Function to test the PUBLIC endpoint
    const handlePublicTest = async () => {
        setLoading(true);
        setPublicResult(null);
        try {
            const response = await fetch(`${API_URL}/api/test/public`);
            const data = await response.json();
            setPublicResult({ status: response.status, data });
        } catch (error) {
            if (error instanceof Error) {
                setPublicResult({ error: error.message });
            }
        }
        setLoading(false);
    };

    // Function to test the PROTECTED endpoint
    const handleProtectedTest = async () => {
        setLoading(true);
        setProtectedResult(null);

        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            setProtectedResult({ error: 'You are not logged in. Please log in to test the protected endpoint.' });
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/test/protected`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
            });
            const data = await response.json();
            setProtectedResult({ status: response.status, data });
        } catch (error) {
            if (error instanceof Error) {
                setProtectedResult({ error: error.message });
            }
        }
        setLoading(false);
    };

    const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
        if (!result) return null;
        return (
            <pre >
                {JSON.stringify(result, null, 2)}
            </pre>
        );
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h1>🔐 .NET API Authentication Test (TypeScript)</h1>
            <p>Use these buttons to test the endpoints on your backend.</p>

            <hr style={{ margin: '20px 0' }} />

            <div>
                <h3>Public Endpoint Test</h3>
                <p>This should always work, even if you are not logged in.</p>
                <button onClick={handlePublicTest} disabled={loading}>
                    {loading ? 'Testing...' : 'Test Public Endpoint'}
                </button>
                <ResultDisplay result={publicResult} />
            </div>

            <hr style={{ margin: '20px 0' }} />

            <div>
                <h3>Protected Endpoint Test</h3>
                <p>This should only work if you are logged in with Supabase.</p>
                <button onClick={handleProtectedTest} disabled={loading}>
                    {loading ? 'Testing...' : 'Test Protected Endpoint'}
                </button>
                <ResultDisplay result={protectedResult} />
            </div>
        </div>
    );
};

export default AuthTest;