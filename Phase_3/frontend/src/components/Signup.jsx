import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const checkUsername = async () => {
        try {
            const response = await axios.get(`/api/check-username/${username}`);
            if (response.data.exists) {
                setMessage('Username already exists. Please choose another one.');
            } else {
                handleSignup();
            }
        } catch (error) {
            console.error('Error checking username:', error);
            setMessage('Error checking username.');
        }
    };

    const handleSignup = async () => {
        try {
            const response = await axios.post('/api/signup', { username, password });
            setMessage(`User ${response.data.username} created successfully!`);
            setTimeout(() => {
                navigate('/'); // Redirect to the login page after a short delay
            }, 2000);
        } catch (error) {
            console.error('Error signing up:', error);
            setMessage('Error signing up.');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage('');

        if (password !== confirmPassword) {
            setMessage('Passwords do not match. Please try again.');
            return;
        }

        checkUsername();
    };

    return (
        <div>
            <h2>Signup</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Re-enter Password:</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Sign Up</button>
            </form>
            {message && <p>{message}</p>}
            <button onClick={() => navigate('/')}>Back to Login</button>
        </div>
    );
};

export default Signup;
