import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Row, Form, Col, Button, Container } from 'react-bootstrap';
import './LogIn.css';
import NavigationalBar from '../landpage/navbar';
import { ip } from '../../ContentExport';

const LogInUser = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [users, setUsers] = useState([]);
    const [userRole, setUserRole] = useState("Patient");

    useEffect(() => {
        const fetchData = async () => {
            try {
                let response;
                if (userRole === "Patient") {
                    // Fetch all patient data
                    response = await axios.get(`${ip.address}/patient/api/allpatient`);
                } else if (userRole === "Practitioner") {
                    // Fetch all doctor data
                    response = await axios.get(`${ip.address}/doctor/api/alldoctor`);
                }

                if (response && response.data) {
                    const userData = response.data.thePatient || response.data.theDoctor;
                    setUsers(userData);
                }
            } catch (err) {
                console.log(err);
            }
        };

        fetchData();
    }, [userRole]);

    const loginuser = async (e) => {
        e.preventDefault();

        // Find user based on email, depending on the selected role
        const user = users.find(user => {
            if (userRole === "Patient") {
                return user.patient_email === email;
            } else if (userRole === "Practitioner") {
                return user.dr_email === email;
            }
            return false;
        });

        if (user) {
            // Practitioner login flow
            if (userRole === "Practitioner") {
                // Check if account is still under review
                if (user.accountStatus === "Review") {
                    window.alert("Your account is under review and you cannot log in at this time.");
                    return;
                }

                // Validate practitioner password
                if (user.dr_password !== password) {
                    window.alert("Invalid email or password. Please try again.");
                    return;
                }

                // Update practitioner status to 'Online'
                const userId = user._id;
                try {
                    await axios.put(`${ip.address}/doctor/${userId}/status`, { status: 'Online' });
                    console.log('Doctor status updated to Online.');
                } catch (err) {
                    console.error('Error updating doctor status:', err);
                }

                window.alert("Successfully logged in");
                navigate("/dashboard", { state: { did: userId } });

            // Patient login flow
            } else if (userRole === "Patient") {
                const userId = user._id;
                // Validate patient password
                if (user.patient_password === password) {
                    window.alert("Successfully logged in");
                    navigate(`/homepage/${userId}`,  { state: { pid: userId } }); // Navigate to patient's homepage
                } else {
                    window.alert("Invalid email or password. Please try again.");
                }
            }
        } else {
            window.alert("Invalid email or password. Please try again.");
        }
    };

    return (
        <>
            <NavigationalBar />
            <div className="align-items-center d-flex vh-100">
                <Container fluid className="maincontainer d-flex justify-content-center align-items-center">
                    <div className="container">
                        <h1>Welcome Back!</h1>
                        <Form>
                            <Row className="mb-3">
                                <Form.Group className="mb-3" controlId="formEmail">
                                    <Form.Label>Email Address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Enter Email Address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </Form.Group>
                            </Row>
                            <Row className="align-items right">
                                <Form.Group className="mb-3" controlId="formPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Enter Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </Form.Group>
                            </Row>
                            <Row>
                                <Form.Group as={Col} controlId="formChoose">
                                    <Form.Label>Choose your role:</Form.Label>
                                    <Form.Select value={userRole} onChange={(e) => setUserRole(e.target.value)} defaultValue="Choose">
                                        <option value="Patient">Patient</option>
                                        <option value="Practitioner">Practitioner</option>
                                    </Form.Select>
                                </Form.Group>
                            </Row>
                            <Row className="mb-3"></Row>
                            <div className="justify-content-center">
                                <Button type="submit" className="mb-2 buttonStyle" onClick={loginuser}>
                                    Log In
                                </Button>
                            </div>
                            <div className="mb-0">
                                <a href="/medapp/signup">No account yet? Sign up</a>
                            </div>
                        </Form>
                    </div>
                </Container>
            </div>
        </>
    );
};

export default LogInUser;
