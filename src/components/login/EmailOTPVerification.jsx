// EmailOTPVerification.js
import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

const EmailOTPVerification = ({ handleVerification, handleSendOTP }) => {
    const [emailOTP, setEmailOTP] = useState('');

    const handleVerify = () => {
        // Call the parent function to handle verification
        handleVerification(emailOTP.trim());
    };

    return (
        <Form.Group controlId="formEmailOTP">
            <Button onClick={handleSendOTP}>Send OTP to Email</Button>
            <Form.Label>Enter Email OTP</Form.Label>
            <Form.Control
                type="text"
                placeholder="Enter email OTP"
                value={emailOTP}
                onChange={(e) => setEmailOTP(e.target.value.replace(/\s+/g, ''))}
            />
            <Button onClick={handleVerify}>Verify</Button>
        </Form.Group>
    );
};

export default EmailOTPVerification;
