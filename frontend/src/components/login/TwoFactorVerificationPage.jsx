import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ip } from '../../ContentExport';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useUser } from '../UserContext';
import ForLoginAndSignupNavbar from '../landpage/ForLoginAndSignupNavbar';
const TwoFactorVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, role } = location.state || {}; // Retrieve userId and role passed from the login
  const { setUser, setRole } = useUser();  // Add this line
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [attempts, setAttempts] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle the input change for the code
  const handleChange = (e, index) => {
    const value = e.target.value;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Focus next input field when the current one is filled
    if (value && index < 5) {
      document.getElementById(`code-input-${index + 1}`).focus();
    }
  };

  // Handle backspace functionality
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && code[index] === '') {
      if (index > 0) {
        document.getElementById(`code-input-${index - 1}`).focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const enteredCode = code.join('');
    if (enteredCode.length !== 6) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Code',
        text: 'Please enter a 6-digit code.',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Send the 2FA code to the backend for verification
      const response = await axios.post(`${ip.address}/api/verify-2fa`, {
        userId: userId,
        role: role,
        code: enteredCode,
      }, {
        withCredentials: true  // Add this line
      });

      if (response.data.verified) {

        setUser(response.data.user);
        setRole(response.data.role);
        // On successful verification, backend creates the session
        setTimeout(() => {
            if (role === 'Patient') {
              navigate('/homepage');
            } else if (role === 'Doctor') {
              navigate('/dashboard');
            } else if (role === 'Admin') {
              navigate('/admin/dashboard/patient');
            } else if (role === 'Medical Secretary'){
              navigate('/medsec/dashboard');
            }

          }, 100);
      } else {
        setAttempts(attempts + 1);
        if (attempts + 1 >= 3) {
          await axios.post(`${ip.address}/api/logout`);
          Swal.fire({
            icon: 'error',
            title: '3 Failed Attempts',
            text: 'Your session has been destroyed due to multiple incorrect attempts.',
          });
          navigate('/'); // Redirect to login page after 3 failed attempts
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Invalid Code',
            text: 'The code you entered is incorrect. Please try again.',
          });
        }
      }
    } catch (error) {
      console.error('Error during 2FA verification:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred during 2FA verification.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    
    <ForLoginAndSignupNavbar />
    <div className="container-auth">
      <h2 className="title">Enter 2FA Code</h2>
      <p className="subheading">Please enter the 6-digit code sent to your authenticator app.</p>

      <form onSubmit={handleSubmit}>
        <div className="input-container">
          {code.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              id={`code-input-${index}`}
              className="code-input"
              autoFocus={index === 0}
            />
          ))}
        </div>
        <div className="submit-container">
          <button
            type="submit"
            disabled={isSubmitting}
            className="submit-button"
          >
            {isSubmitting ? 'Verifying...' : 'Verify Code'}
          </button>
        </div>
      </form>
    </div>
    </>
  );
};

export default TwoFactorVerificationPage;
