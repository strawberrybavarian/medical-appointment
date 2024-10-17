// File: TermsAndConditionsModal.js

import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const TermsAndConditionsModal = ({ show, handleClose, handleAccept }) => {
    return (
        <Modal show={show} onHide={handleClose} size="lg" scrollable>
            <Modal.Header closeButton>
                <Modal.Title>Terms and Conditions</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: 'calc(100vh - 210px)', overflowY: 'auto' }}>
                {/* Terms and Conditions Content */}
                <h5>Terms and Conditions</h5>
                <p>Welcome to our Patient Information and Appointment Management System (the "Molino Care App"). By accessing or using our App, you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree with these Terms, please do not use our App.</p>
                <ol>
                    <li>
                        <strong>Use of the App</strong>
                        <ul>
                            <li>The App allows patients to manage their personal health information and appointments.</li>
                            <li>You agree to use the App only for lawful purposes and in accordance with these Terms.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>User Accounts</strong>
                        <ul>
                            <li>You must provide accurate and complete information when creating an account.</li>
                            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Intellectual Property</strong>
                        <ul>
                            <li>All content in the App is the property of [Your Company Name] and is protected by intellectual property laws.</li>
                            <li>You may not reproduce, distribute, or create derivative works without our express written consent.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Limitation of Liability</strong>
                        <ul>
                            <li>We are not liable for any damages arising from your use of the App.</li>
                            <li>The App is provided "as is" without warranties of any kind.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Modification of Terms</strong>
                        <ul>
                            <li>We reserve the right to modify these Terms at any time.</li>
                            <li>Your continued use of the App constitutes acceptance of the modified Terms.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Governing Law</strong>
                        <ul>
                            <li>These Terms are governed by the laws of the Philippines.</li>
                        </ul>
                    </li>
                </ol>

                {/* Data Privacy Policy */}
                <h5>Data Privacy Policy</h5>
                <p><strong>Molino Polyclinic</strong> is committed to protecting your personal information in compliance with the Data Privacy Act of 2012 (Republic Act No. 10173) of the Philippines.</p>
                <ol>
                    <li>
                        <strong>Collection of Personal Information</strong>
                        <ul>
                            <li>We collect personal information necessary for providing our services, including name, contact information, and health data.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Use of Personal Information</strong>
                        <ul>
                            <li>Your personal information is used to manage appointments and maintain your health records.</li>
                            <li>We do not share your personal information with third parties without your consent, except as required by law.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Protection of Personal Information</strong>
                        <ul>
                            <li>We implement appropriate security measures to safeguard your personal information.</li>
                            <li>Only authorized personnel have access to your personal data.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Your Rights</strong>
                        <ul>
                            <li>You have the right to access, correct, and request deletion of your personal information.</li>
                            <li>You may contact us to exercise your rights under the Data Privacy Act.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Retention of Data</strong>
                        <ul>
                            <li>We retain your personal information only as long as necessary for the purposes stated.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Contact Information</strong>
                        <ul>
                            <li>For any inquiries or concerns, please contact our Data Protection Officer at [Contact Information].</li>
                        </ul>
                    </li>
                </ol>

                {/* Instructions on How to Use the App */}
                <h5>How to Use the App</h5>
                <ol>
                    <li>
                        <strong>Registration</strong>
                        <ul>
                            <li>Create an account by providing the required personal information.</li>
                            <li>Verify your email address to activate your account.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Managing Appointments</strong>
                        <ul>
                            <li>Log in to your account.</li>
                            <li>Navigate to the "Appointments" section to schedule, view, or cancel appointments.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Personal Information</strong>
                        <ul>
                            <li>Update your personal and health information in the "Profile" section.</li>
                            <li>Ensure your information is accurate for better service.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Security</strong>
                        <ul>
                            <li>Keep your login credentials confidential.</li>
                            <li>Log out after each session to protect your information.</li>
                        </ul>
                    </li>
                </ol>

                {/* <p><em>Please note: This is a sample terms and conditions and privacy policy. It is recommended to consult with a legal professional to ensure compliance with all applicable laws and regulations.</em></p> */}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Decline
                </Button>
                <Button variant="primary" onClick={handleAccept}>
                    Accept
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default TermsAndConditionsModal;
