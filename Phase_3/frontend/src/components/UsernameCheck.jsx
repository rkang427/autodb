import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UsernameCheck = () => {
  const [username, setUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleCheck = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear previous error messages
    try {
      const response = await axios.get(`http://localhost:3000/api/check-username/${username}`);
      if (response.data && !response.data.exists) {
        setErrorMessage("Username does not exist. Please sign up.");
      } else {
        setErrorMessage(""); 
        navigate('/login');
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setErrorMessage('Error checking username.');
    }
  };

  return (
    <div>
      <h2>Check Username</h2>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <form onSubmit={handleCheck}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <button type="submit">Check</button>
      </form>
    </div>
  );
};

export default UsernameCheck;
