import React, { useState } from 'react';

function Login({ onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Note: We use the backend container name or localhost depending on network setup
            // In Docker, if using --link or same network, use http://backend:5000
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                onLoginSuccess();
            } else {
                const data = await response.json();
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Connection error to backend');
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'Arial' }}>
            <h2>Login</h2>
            <form onSubmit={handleSubmit} style={{ display: 'inline-block', textAlign: 'left', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
                <div style={{ marginBottom: '10px' }}>
                    <label>Username:</label><br />
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={{ width: '200px', padding: '5px' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Password:</label><br />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '200px', padding: '5px' }}
                    />
                </div>
                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Log In
                </button>
            </form>
            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        </div>
    );
}

export default Login;
