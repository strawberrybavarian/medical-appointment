import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import { ip } from "../../../../../../ContentExport";

const ChangePasswordModal = ({ show, handleClose, msid, password }) => {
    const [email, setEmail] = useState("");
    const [confirmEmail, setConfirmEmail] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    console.log(password);
    // State for validation errors
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [oldPasswordError, setOldPasswordError] = useState("");

    // Handle change password submission
    const handleChangePassword = async () => {
        // Reset errors before validation
        setEmailError("");
        setPasswordError("");
        setOldPasswordError("");

        // Validate emails match
        if (email !== confirmEmail) {
            setEmailError("Emails do not match!");
            return;
        }

        // Validate old password matches the provided password (currentPassword)
        if (oldPassword !== password) {
            setOldPasswordError("Old password is incorrect!");
            return;
        }

        // Validate new passwords match
        if (newPassword !== confirmNewPassword) {
            setPasswordError("New passwords do not match!");
            return;
        }

        // Make API call to change password
        try {
            const response = await axios.post(`${ip.address}/api/medicalsecretary/api/change-password/${msid}`, {
                email,
                oldPassword,
                newPassword,
            });

            if (response.data.success) {
                alert("Password updated successfully");
                handleClose(); // Close modal after success
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.error(error);
            alert("Failed to update password");
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Change Password</Modal.Title>
            </Modal.Header>
            <Modal.Body>
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
                </Form>
            </Modal.Body>
            <Modal.Footer>
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

export default ChangePasswordModal;
