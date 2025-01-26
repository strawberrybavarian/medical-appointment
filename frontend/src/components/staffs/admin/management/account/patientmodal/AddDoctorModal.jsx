// File: AddDoctorModal.js

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { ip } from '../../../../../../ContentExport';


const AddDoctorModal = ({ show, handleClose, setDoctors }) => {
    const [dr_firstName, setFirstName] = useState("");
    const [dr_lastName, setLastName] = useState("");
    const [dr_middleInitial, setMiddleInitial] = useState("");
    const [dr_email, setEmail] = useState("");
    const [dr_contactNumber, setContactNumber] = useState("");
    const [dr_dob, setDOB] = useState("");
    const [dr_gender, setGender] = useState("Male");
    const [dr_licenseNo, setLicenseNo] = useState("");
    const [dr_specialty, setSpecialty] = useState("");
    const [specialties, setSpecialties] = useState([]);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        // Fetch specialties from services
        const fetchSpecialties = async () => {
            try {
                const response = await axios.get(`${ip.address}/api/find/admin/specialties`);
                const services = response.data;
                // Extract unique categories
                const categories = [...new Set(services.map(service => service.name))];
                setSpecialties(categories);
            } catch (error) {
                console.error("Error fetching specialties:", error);
            }
        };

        fetchSpecialties();
    }, []);

    const generateRandomPassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let password = '';
        for (let i = 0; i < 8; i++) {
          password += chars[Math.floor(Math.random() * chars.length)];
        }
        return password;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        // Basic validation
        if (!dr_firstName) newErrors.firstName = "First Name is required";
        if (!dr_lastName) newErrors.lastName = "Last Name is required";
        if (!dr_email || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(dr_email)) {
            newErrors.email = "Valid Email is required";
        }
        if (!dr_licenseNo) newErrors.licenseNo = "License Number is required";
        if (!dr_specialty) newErrors.specialty = "Specialty is required";
        if (!dr_dob) newErrors.dob = "Date of Birth is required";
        if (!dr_contactNumber) newErrors.contactNumber = "Contact Number is required";
        if (!dr_gender) newErrors.gender = "Gender is required";

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            return;
        }

        // Generate random password
        const generatedPassword = generateRandomPassword();

        const doctorData = {
            dr_firstName,
            dr_lastName,
            dr_middleInitial,
            dr_email,
            dr_contactNumber,
            dr_dob,
            dr_gender,
            dr_licenseNo,
            dr_specialty,
            dr_password: generatedPassword, // Assign the generated password
            accountStatus: 'Registered',
        };

        try {
            await axios.post(`${ip.address}/api/doctor/api/signup`, doctorData);
            window.alert("Doctor registered successfully. An email has been sent with login details.");

            // Update the doctor list
            const response = await axios.get(`${ip.address}/api/doctor/api/alldoctor`);
            setDoctors(response.data.theDoctor);

            handleClose();
        } catch (error) {
            console.error("Error registering doctor:", error);
            window.alert("Error registering doctor. Please try again.");
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Add Doctor</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    {/* First and Last Name */}
                    <Row className="mb-3">
                        <Form.Group as={Col}>
                            <Form.Label>First Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter First Name"
                                value={dr_firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                            {errors.firstName && <Form.Text className="text-danger">{errors.firstName}</Form.Text>}
                        </Form.Group>

                        <Form.Group as={Col}>
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter Last Name"
                                value={dr_lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                            {errors.lastName && <Form.Text className="text-danger">{errors.lastName}</Form.Text>}
                        </Form.Group>
                    </Row>

                    {/* Middle Initial, DOB, Contact Number */}
                    <Row className="mb-3">
                        <Form.Group as={Col}>
                            <Form.Label>Middle Initial</Form.Label>
                            <Form.Control
                                maxLength={1}
                                type="text"
                                placeholder="Enter Middle Initial"
                                value={dr_middleInitial}
                                onChange={(e) => setMiddleInitial(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group as={Col}>
                            <Form.Label>Date of Birth</Form.Label>
                            <Form.Control
                                type="date"
                                value={dr_dob}
                                onChange={(e) => setDOB(e.target.value)}
                            />
                            {errors.dob && <Form.Text className="text-danger">{errors.dob}</Form.Text>}
                        </Form.Group>

                        <Form.Group as={Col}>
                            <Form.Label>Contact Number</Form.Label>
                            <Form.Control
                                type="text"
                                maxLength={11}
                                placeholder="Enter Contact Number"
                                value={dr_contactNumber}
                                onChange={(e) => setContactNumber(e.target.value)}
                            />
                            {errors.contactNumber && <Form.Text className="text-danger">{errors.contactNumber}</Form.Text>}
                        </Form.Group>
                    </Row>

                    {/* Email */}
                    <Row className="mb-3">
                        <Form.Group as={Col}>
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter Email"
                                value={dr_email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            {errors.email && <Form.Text className="text-danger">{errors.email}</Form.Text>}
                        </Form.Group>
                    </Row>

                    {/* License Number and Specialty */}
                    <Row className="mb-3">
                        <Form.Group as={Col}>
                            <Form.Label>License Number</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter License Number"
                                value={dr_licenseNo}
                                onChange={(e) => setLicenseNo(e.target.value)}
                            />
                            {errors.licenseNo && <Form.Text className="text-danger">{errors.licenseNo}</Form.Text>}
                        </Form.Group>

                        <Form.Group as={Col}>
                            <Form.Label>Specialty</Form.Label>
                            <Form.Control
                                as="select"
                                value={dr_specialty}
                                onChange={(e) => setSpecialty(e.target.value)}
                            >
                                <option value="">Select Specialty</option>
                                {specialties.map((specialty, index) => (
                                    <option key={index} value={specialty}>{specialty}</option>
                                ))}
                            </Form.Control>
                            {errors.specialty && <Form.Text className="text-danger">{errors.specialty}</Form.Text>}
                        </Form.Group>
                    </Row>

                    {/* Gender */}
                    <Row className="mb-3">
                        <Form.Group as={Col}>
                            <Form.Label>Gender</Form.Label>
                            <Form.Select
                                value={dr_gender}
                                onChange={(e) => setGender(e.target.value)}
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </Form.Select>
                            {errors.gender && <Form.Text className="text-danger">{errors.gender}</Form.Text>}
                        </Form.Group>
                    </Row>

                    <Button variant="primary" type="submit">
                        Register Doctor
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AddDoctorModal;
