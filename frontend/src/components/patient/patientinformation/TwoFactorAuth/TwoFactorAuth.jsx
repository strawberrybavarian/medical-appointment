import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './TwoFactorAuth.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap';
import { ip } from '../../../../ContentExport';

function TwoFactorAuth() {
    
    const [qrCode, setQrCode] = useState(null);
    const [secretKey, setSecretKey] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [sessionActive, setSessionActive] = useState(true); // Track session activity
    const [user, setUser] = useState(''); // Store user data

    console.log('User:', user._id);
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
        setShowModal(true); // Show confirmation modal
    };

    const confirmRegenerate = () => {
        setupTwoFactor(true); // Regenerate the 2FA secret
        setQrCode(null); // Clear the QR code when regenerating
        setSecretKey(null); // Clear the secret key when regenerating
        setShowModal(false); // Hide confirmation modal
    };

    const cancelRegenerate = () => {
        setShowModal(false); // Hide confirmation modal
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4" style={{ lineHeight: '0.02' }}>Register to Two Factor Authentication</h2>
            <p style={{ textAlign: 'center', fontSize: '13px', fontStyle: 'italic' }}>Use any authenticator app (Google Authenticator or Microsoft Authenticator) to add a protection layer to your account</p>
            {qrCode && (
                <div className="tfa-container">
                    <div className="tfa-card">
                        <div className="tfa-cardqr">
                            <div className="tfa-cardqr1">
                                <img src={qrCode} alt="QR Code" />
                                <div className="tfa-cardqr2">
                                    <p>Secret Key:</p>
                                    {secretKey && (
                                        <p className="tfa-text">{secretKey}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="text-center mb-4">
                <button className="btn btn-primary" onClick={handleRegenerate} disabled={!sessionActive}>
                    {sessionActive ? 'Generate New Secret Key' : 'Session Expired'}
                </button>
            </div>

            {/* Confirmation Modal */}
            <Modal show={showModal} onHide={cancelRegenerate}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Change</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to change your secret key?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={cancelRegenerate}>
                        No
                    </Button>
                    <Button variant="danger" onClick={confirmRegenerate}>
                        Yes
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default TwoFactorAuth;
