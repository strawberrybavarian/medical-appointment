import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { ip } from '../../../../ContentExport';
import Swal from 'sweetalert2';
function TwoFactorAuth({ show, handleClose }) {
    const [qrCode, setQrCode] = useState(null);
    const [secretKey, setSecretKey] = useState(null);
    const [sessionActive, setSessionActive] = useState(true);
    const [user, setUser] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [setupStep, setSetupStep] = useState('generate'); // 'generate', 'verify', or 'complete'

    // Check session status when component mounts
    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await axios.get(`${ip.address}/api/get/session`);
                if (!response.data || !response.data.user) {
                    console.log('Session expired or no user data:', response.data);
                    setSessionActive(false);
                } else {
                    setUser(response.data.user);
                    // Auto-generate QR code when modal opens
                    setupTwoFactor();
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
            setLoading(true);
            const response = await axios.post(`${ip.address}/api/set-up-2fa`, { 
                regenerate,
                id: user?._id,
                role: user?.role
            });

            if (response.data.qrCode && response.data.secret) {
                setQrCode(response.data.qrCode);
                setSecretKey(response.data.secret);
                setSetupStep('verify');
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error setting up 2FA'
                });
            }
        } catch (error) {
            console.error('Error setting up 2FA:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerate = () => {
        setupTwoFactor(true);
        setQrCode(null);
        setSecretKey(null);
    };

    const handleVerifyCode = async () => {
        if (!verificationCode) {
            Swal.fire({
                icon: 'warning',
                title: 'Input Required',
                text: 'Please enter the verification code from your authenticator app'
            });
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(`${ip.address}/api/verify-2fa`, {
                userId: user?._id,
                role: user?.role,
                code: verificationCode
            });

            if (response.data.verified) {
                setSetupStep('complete');
                
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Two-factor authentication has been enabled for your account',
                }).then(() => {
                    handleClose();
                    window.location.reload(); // Refresh the page
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Verification Failed',
                    text: 'The code you entered is invalid. Please try again.'
                });
            }
        } catch (error) {
            console.error('Error verifying 2FA code:', error);
            Swal.fire({
                icon: 'error',
                title: 'Verification Error',
                text: 'Failed to verify the code. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal size="lg" show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Register for Two Factor Authentication</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p style={{ fontSize: '13px', fontStyle: 'italic', textAlign: 'center' }}>
                    Use any authenticator app (Google Authenticator or Microsoft Authenticator) to add a protection layer to your account
                </p>
                
                {/* QR Code Display */}
                {qrCode && (
                    <div className="tfa-container">
                        <div className="tfa-card">
                            <div className="tfa-cardqr">
                                <div className="tfa-cardqr1 text-center">
                                    <img src={qrCode} alt="QR Code" />
                                   
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Verification Code Input */}
                {setupStep === 'verify' && qrCode && (
                    <div className="mt-4">
                        <Alert variant="info">
                            Scan the QR code with your authenticator app, then enter the verification code below.
                        </Alert>
                        <Form.Group className="mb-3">
                            <Form.Label>Enter verification code from your authenticator app</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="e.g. 123456" 
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                maxLength={6}
                            />
                        </Form.Group>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                
                {setupStep === 'generate' && (
                    <Button 
                        variant="primary" 
                        onClick={() => setupTwoFactor(false)}
                        disabled={!sessionActive || loading}
                    >
                        {loading ? 'Generating...' : 'Generate QR Code'}
                    </Button>
                )}
                
                {setupStep === 'verify' && (
                    <>
                        <Button 
                            variant="outline-primary" 
                            onClick={handleRegenerate}
                            disabled={loading}
                        >
                            Regenerate Code
                        </Button>
                        <Button 
                            variant="success" 
                            onClick={handleVerifyCode}
                            disabled={loading || !verificationCode}
                        >
                            {loading ? 'Verifying...' : 'Verify & Enable 2FA'}
                        </Button>
                    </>
                )}
            </Modal.Footer>
        </Modal>
    );
}

export default TwoFactorAuth;