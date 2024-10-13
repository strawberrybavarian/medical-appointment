import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap';
import { ip } from '../../../ContentExport';

function DrTwoFactorAuth() {
    const { did } = useParams();
    const [qrCode, setQrCode] = useState(null);
    const [secretKey, setSecretKey] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showQrCodeCard, setShowQrCodeCard] = useState(false);

    const setupTwoFactor = async (userId, regenerate = false) => {
        try {
            const response = await axios.post(`${ip.address}/api/doctor/api/setup-2fa/${userId}`, { regenerate });
            if (response.data.qrCode && response.data.secret) {
                setQrCode(response.data.qrCode);
                setSecretKey(response.data.secret);
                localStorage.setItem('qrCode', response.data.qrCode);
                localStorage.setItem('secretKey', response.data.secret);
                setShowQrCodeCard(true);
            } else {
                window.alert("Error setting up 2FA");
            }
        } catch (error) {
            console.error('Error setting up 2FA:', error);
            window.alert("Error setting up 2FA");
        }
    };

    useEffect(() => {
        const storedQrCode = localStorage.getItem('qrCode');
        const storedSecretKey = localStorage.getItem('secretKey');
        if (storedQrCode && storedSecretKey) {
            setQrCode(storedQrCode);
            setSecretKey(storedSecretKey);
        }
    }, [did]);

    const handleRegenerate = () => {
        setShowModal(true); // Show confirmation modal
    };

    const confirmRegenerate = () => {
        setupTwoFactor(did, true);
        setQrCode(null); // Clear the QR code when regenerating
        setSecretKey(null); // Clear the secret key when regenerating
        setShowModal(false); // Hide confirmation modal
        setShowQrCodeCard(true);
    };

    const cancelRegenerate = () => {
        setShowModal(false); // Hide confirmation modal
    };

    const clearQrCodeCard = () => {
        setQrCode(null);
        setSecretKey(null);
        setShowQrCodeCard(false);
        localStorage.removeItem('qrCode');
        localStorage.removeItem('secretKey');
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4" style={{ lineHeight: '0.02' }}>Register to Two Factor Authentication</h2>
            <p style={{ textAlign: 'center', fontSize: '13px', fontStyle: 'italic' }}>Use any authenticator app (Google Authenticator or Microsoft Authenticator) to add a protection layer to your account</p>
            {showQrCodeCard && qrCode && (
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
                        <button className="btn btn-secondary mt-3" onClick={clearQrCodeCard}>Clear QR Code</button>
                    </div>
                </div>
            )}
            <div className="text-center mb-4">
                <button className="btn btn-primary" onClick={handleRegenerate}>Generate New Secret Key</button>
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

export default DrTwoFactorAuth;
