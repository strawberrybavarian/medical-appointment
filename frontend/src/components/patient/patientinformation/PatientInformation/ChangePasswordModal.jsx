import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import { ip } from "../../../../ContentExport";
import Swal from 'sweetalert2';
import PasswordValidation from "../../../../components/login/PasswordValidation";

const ChangePasswordModal = ({ show, handleClose, pid, email: propsEmail, password: propsPassword }) => {
    const [email, setEmail] = useState("");
    const [confirmEmail, setConfirmEmail] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    // State for validation errors
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [oldPasswordError, setOldPasswordError] = useState("");
    
    // State to track if form has changes
    const [isDirty, setIsDirty] = useState(false);
    
    // State to show/hide password validation component
    const [showPasswordValidation, setShowPasswordValidation] = useState(false);

    // Reset form when modal closes
    useEffect(() => {
        if (show) {
            // Prepopulate email if provided
            if (propsEmail) {
                setEmail(propsEmail);
                setConfirmEmail(propsEmail);
            }
        } else {
            // Reset form fields when modal closes
            resetForm();
        }
    }, [show, propsEmail]);

    // Track changes in any form field
    useEffect(() => {
        if (show) {
            const hasChanges = email !== "" || 
                              confirmEmail !== "" || 
                              oldPassword !== "" || 
                              newPassword !== "" || 
                              confirmNewPassword !== "";
            setIsDirty(hasChanges);
        }
    }, [email, confirmEmail, oldPassword, newPassword, confirmNewPassword, show]);

    const resetForm = () => {
        setEmail("");
        setConfirmEmail("");
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setEmailError("");
        setPasswordError("");
        setOldPasswordError("");
        setIsDirty(false);
        setShowPasswordValidation(false);
    };

    // Check if password meets all requirements
    const isPasswordValid = (password) => {
        return password.length >= 8 && 
               /[!@#$%^&*(),.?":{}|<>]/.test(password) && 
               /[A-Z]/.test(password) && 
               /[a-z]/.test(password);
    };

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
    
        if (!oldPassword) {
            setOldPasswordError("Old password is required!");
            return;
        }
    
        // Validate new passwords match
        if (newPassword !== confirmNewPassword) {
            setPasswordError("New passwords do not match!");
            return;
        }
        
        // Validate password strength
        if (!isPasswordValid(newPassword)) {
            setPasswordError("Please ensure your password meets all requirements");
            return;
        }
    
        // Show confirmation dialog before submitting
        Swal.fire({
            title: 'Confirm Password Change',
            text: 'Are you sure you want to change your password?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, change it',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                submitPasswordChange();
            }
        });
    };
    
    const submitPasswordChange = async () => {
        try {
            const response = await axios.post(`${ip.address}/api/patient/api/change-password/${pid}`, {
                email,
                oldPassword,
                newPassword,
            });
    
            if (response.status === 200) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Password updated successfully',
                    icon: 'success',
                    confirmButtonColor: '#3085d6'
                });
                resetForm();
                handleClose(); // Close modal after success
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: response.data.message || 'Failed to update password',
                    icon: 'error',
                    confirmButtonColor: '#3085d6'
                });
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                title: 'Error!',
                text: error.response?.data?.message || 'An unknown error occurred. Please try again.',
                icon: 'error',
                confirmButtonColor: '#3085d6'
            });
        }
    };
    
    const handleModalClose = () => {
        if (isDirty) {
            // Show confirmation dialog if there are unsaved changes
            Swal.fire({
                title: 'Unsaved Changes',
                text: 'You have started changing your password. Do you want to discard these changes?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, discard changes',
                cancelButtonText: 'No, keep editing'
            }).then((result) => {
                if (result.isConfirmed) {
                    resetForm();
                    handleClose(); // Close the modal without saving
                }
            });
        } else {
            handleClose(); // No changes, close directly
        }
    };

    return (
        <Modal show={show} onHide={handleModalClose}>
            <Modal.Header closeButton>
                <Modal.Title>Change Password</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    {/* Email fields */}
                    <Form.Group className="mb-3" controlId="email">
                        <Form.Label>Email:</Form.Label>
                        <Form.Control
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            isInvalid={!!emailError}
                            placeholder="Enter your email"
                        />
                        <Form.Control.Feedback type="invalid">
                            {emailError}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="confirmEmail">
                        <Form.Label>Re-enter Email:</Form.Label>
                        <Form.Control
                            type="email"
                            value={confirmEmail}
                            onChange={(e) => setConfirmEmail(e.target.value)}
                            isInvalid={!!emailError}
                            placeholder="Confirm your email"
                        />
                    </Form.Group>

                    {/* Old password validation */}
                    <Form.Group className="mb-3" controlId="oldPassword">
                        <Form.Label>Old Password:</Form.Label>
                        <Form.Control
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            isInvalid={!!oldPasswordError}
                            placeholder="Enter your current password"
                        />
                        <Form.Control.Feedback type="invalid">
                            {oldPasswordError}
                        </Form.Control.Feedback>
                    </Form.Group>

                    {/* New password fields */}
                    <Form.Group className="mb-3" controlId="newPassword">
                        <Form.Label>New Password:</Form.Label>
                        <Form.Control
                            type="password"
                            value={newPassword}
                            onChange={(e) => {
                                setNewPassword(e.target.value);
                                setShowPasswordValidation(true);
                            }}
                            onFocus={() => setShowPasswordValidation(true)}
                            isInvalid={!!passwordError}
                            placeholder="Enter new password"
                        />
                        <Form.Control.Feedback type="invalid">
                            {passwordError}
                        </Form.Control.Feedback>
                        
                        {/* Password validation component */}
                        {showPasswordValidation && (
                            <div className="mt-2 mb-3 p-2 border rounded bg-light">
                                <PasswordValidation password={newPassword} />
                            </div>
                        )}
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="confirmNewPassword">
                        <Form.Label>Re-enter New Password:</Form.Label>
                        <Form.Control
                            type="password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            isInvalid={!!passwordError}
                            placeholder="Confirm new password"
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleModalClose}>
                    Cancel
                </Button>
                <Button 
                    variant="primary" 
                    onClick={handleChangePassword}
                    disabled={
                        !isDirty || 
                        !email || 
                        !confirmEmail || 
                        !oldPassword || 
                        !newPassword || 
                        !confirmNewPassword || 
                        !isPasswordValid(newPassword)
                    }
                >
                    Change Password
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ChangePasswordModal;