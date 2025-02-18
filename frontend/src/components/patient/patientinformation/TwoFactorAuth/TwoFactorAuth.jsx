import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { ip } from '../../../../ContentExport';

function TwoFactorAuth({ show, handleClose }) {
    const [qrCode, setQrCode] = useState(null);
    const [secretKey, setSecretKey] = useState(null);
    const [sessionActive, setSessionActive] = useState(true); // Track session activity
    const [user, setUser] = useState(''); // Store user data

    // Check session status when component mounts
    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await axios.get(`${ip.address}/api/get/session`);
                if (!response.data || !response.data.user) {
                    console.log('Session expired or no user data:', response.data);
                    setSessionActive(false);
                } else {
                    setUser(response.data.user); // Assuming `response.data.user` contains the user object with role and id
                    console.log(response.data.user);
                }
            } catch (error) {
                console.error('Error checking session:', error);
            }
        };
        checkSession();
    }, []);

    // Setup 2FA function
    const setupTwoFactor = async (regenerate = false) => {
        try {
            // Sending both user ID and role in the body
            const response = await axios.post(`${ip.address}/api/set-up-2fa`, { 
                regenerate,
                id: user?._id, // Patient ID from URL
                role: user?.role // Send the user role (e.g., "Patient")
            });

            if (response.data.qrCode && response.data.secret) {
                setQrCode(response.data.qrCode);
                setSecretKey(response.data.secret);
            } else {
                window.alert("Error setting up 2FA");
            }
        } catch (error) {
            console.error('Error setting up 2FA:', error);
            window.alert("Error setting up 2FA");
        }
    };

    const handleRegenerate = () => {
        setupTwoFactor(true); // Regenerate the 2FA secret immediately
        setQrCode(null); // Clear the QR code when regenerating
        setSecretKey(null); // Clear the secret key when regenerating
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Register for Two Factor Authentication</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p style={{ fontSize: '13px', fontStyle: 'italic', textAlign: 'center' }}>
                    Use any authenticator app (Google Authenticator or Microsoft Authenticator) to add a protection layer to your account
                </p>
                {qrCode && (
                    <div className="tfa-container">
                        <div className="tfa-card">
                            <div className="tfa-cardqr">
                                <div className="tfa-cardqr1">
                                    <img src={qrCode} alt="QR Code" />
                                    <div className="tfa-cardqr2">
                                        <p>Secret Key:</p>
                                        {secretKey && <p className="tfa-text">{secretKey}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button 
                    variant="primary" 
                    onClick={handleRegenerate} 
                    disabled={!sessionActive}
                >
                    {sessionActive ? 'Generate New Secret Key' : 'Session Expired'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default TwoFactorAuth;
