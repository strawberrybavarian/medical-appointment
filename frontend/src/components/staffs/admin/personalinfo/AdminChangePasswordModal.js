import React, { useState } from 'react';
import { Modal, Button, Form } from "react-bootstrap";
import axios from 'axios';
import { ip } from '../../../../ContentExport';

const AdminChangePasswordModal = ({ show, handleClose, admin }) => {
    const [email, setEmail] = useState("");
    const [confirmEmail, setConfirmEmail] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [oldPasswordError, setOldPasswordError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");


    console.log(newPassword, confirmNewPassword);
    // Handle password change logic
    const handleChangePassword = async () => {
        // Clear previous errors
        setEmailError("");
        setPasswordError("");
        setOldPasswordError("");

        if (email !== confirmEmail) {
            setEmailError("Emails do not match.");
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setPasswordError("New passwords do not match.");
            return;
        }

        try {
            // Send the adminId as part of the URL
            const response = await axios.put(`${ip.address}/api/admin/api/change-password/${admin._id}`, {
                email,
                confirmEmail,
                oldPassword,
                newPassword,
                confirmNewPassword
            });

            if (response.data.message) {
                setSuccessMessage(response.data.message);
            }
            handleClose();  // Close modal on success
        } catch (error) {
            console.error(error);
            if (error.response && error.response.data) {
                setPasswordError(error.response.data.message); // Display the error from the backend
            }
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header className='am-header' closeButton>
                <Modal.Title>Change Password</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{width: '100%'}}>
                <Form>
                    {/* Email fields */}
                    <Form.Group controlId="email">
                        <Form.Label>Email:</Form.Label>
                        <Form.Control
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            isInvalid={!!emailError}
                        />
                        <Form.Control.Feedback type="invalid">
                            {emailError}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group controlId="confirmEmail">
                        <Form.Label>Re-enter Email:</Form.Label>
                        <Form.Control
                            type="email"
                            value={confirmEmail}
                            onChange={(e) => setConfirmEmail(e.target.value)}
                            isInvalid={!!emailError}
                        />
                    </Form.Group>

                    {/* Old password validation */}
                    <Form.Group controlId="oldPassword">
                        <Form.Label>Old Password:</Form.Label>
                        <Form.Control
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            isInvalid={!!oldPasswordError}
                        />
                        <Form.Control.Feedback type="invalid">
                            {oldPasswordError}
                        </Form.Control.Feedback>
                    </Form.Group>

                    {/* New password fields */}
                    <Form.Group controlId="newPassword">
                        <Form.Label>New Password:</Form.Label>
                        <Form.Control
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            isInvalid={!!passwordError}
                        />
                        <Form.Control.Feedback type="invalid">
                            {passwordError}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId="confirmNewPassword">
                        <Form.Label>Re-enter New Password:</Form.Label>
                        <Form.Control
                            type="password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            isInvalid={!!passwordError}
                        />
                    </Form.Group>

                    {successMessage && <div className="text-success">{successMessage}</div>}
                </Form>
            </Modal.Body>
            <Modal.Footer style={{width: '100%'}}>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleChangePassword}>
                    Change Password
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AdminChangePasswordModal;
