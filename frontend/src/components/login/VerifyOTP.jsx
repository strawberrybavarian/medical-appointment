import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Form, Button, Container, Card } from "react-bootstrap";
import axios from "axios";
import { ip } from "../../ContentExport";
const VerifyOTP = () => {
    const [otp, setOTP] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state.email;

    const verifyOTP = () => {
        const apiUrl = email.includes("@doctor") ? `${ip.address}/api/doctor/api/verify-otp` : `${ip.address}/api/patient/api/verify-otp`;

        axios.post(apiUrl, { otp, email })
            .then((response) => {
                console.log(response);
                window.alert("OTP verified successfully");
                navigate('/medapp/login');
            })
            .catch((err) => {
                console.log(err);
                window.alert("Failed to verify OTP");
            });
    };

    return (
        <Container className="d-flex justify-content-center align-items-center vh-100">
            <Card className="container">
                <Card.Body>
                    <div className="container">
                        <h1>Verify OTP</h1>
                        <hr />
                        <Form>
                            <Form.Group controlId="formOTP">
                                <Form.Label>OTP</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOTP(e.target.value)}
                                />
                            </Form.Group>
                            <Button onClick={verifyOTP} variant="primary" type="button" className="mt-3">
                                Verify
                            </Button>
                        </Form>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default VerifyOTP;
