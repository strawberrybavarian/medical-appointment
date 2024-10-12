// AuthenticatorTokenVerification.js
import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

const AuthenticatorTokenVerification = ({ handleVerification }) => {
    const [authenticatorToken, setAuthenticatorToken] = useState('');

    const handleVerify = () => {
        // Call the parent function to handle verification
        handleVerification(authenticatorToken.trim());
    };

    return (
        <Form.Group controlId="formAuthenticatorToken">
            <Form.Label>Enter Authenticator Token</Form.Label>
            <Form.Control
                type="text"
                placeholder="Enter authenticator token"
                value={authenticatorToken}
                onChange={(e) => setAuthenticatorToken(e.target.value.replace(/\s+/g, ''))}
            />
            <Button onClick={handleVerify}>Verify</Button>
        </Form.Group>
    );
};

export default AuthenticatorTokenVerification;
