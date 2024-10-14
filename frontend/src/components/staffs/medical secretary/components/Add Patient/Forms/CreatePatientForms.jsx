import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Form, Row, Col, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./Styles.css";
import { ip } from "../../../../../../ContentExport";

const CreatePatientForms = () => {
    const navigate = useNavigate();
    const [ufirstName, setFirstName] = useState("");
    const [uLastName, setLastName] = useState("");
    const [uMiddleInitial, setMiddleInitial] = useState("");
    const [uBirth, setBirth] = useState("");
    const [uNumber, setNumber] = useState("");
    const [uEmail, setEmail] = useState(""); // Added email state
    const [uGender, setGender] = useState("Male");
    const [uAge, setAge] = useState(0);
    const [accountStatus, setAccountStatus] = useState('Unregistered');

    // Address state fields
    const [street, setStreet] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [country, setCountry] = useState("");

    const [errors, setErrors] = useState({});
    const [formSubmitted, setFormSubmitted] = useState(false);

    // Validation functions
    const validateFirstName = (name) => !name ? "First name is required" : "";
    const validateLastName = (name) => !name ? "Last name is required" : "";
    const validateBirth = (birth) => !birth ? "Date of birth is required" : "";
    const validateNumber = (number) => {
        if (!number) return "Contact number is required";
        if (!/^\d{11}$/.test(number)) return "Contact number must be exactly 11 digits";
        return "";
    };
    const validateMiddleInitial = (initial) => {
        if (initial.length > 1) return "Middle initial must be 1 character";
        return "";
    };
    const validateEmail = (email) => {
        if (!email) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return "Enter a valid email address";
        return "";
    };
    const validateZipCode = (zip) => !zip ? "Zip code is required" : "";
    const validateStreet = (street) => !street ? "Street is required" : "";
    const validateCity = (city) => !city ? "City is required" : "";
    const validateState = (state) => !state ? "State is required" : "";
    const validateCountry = (country) => !country ? "Country is required" : "";

    // Handle blur to validate fields
    const handleBlur = (field, value) => {
        let error = "";
        switch (field) {
            case "firstName":
                error = validateFirstName(value);
                break;
            case "lastName":
                error = validateLastName(value);
                break;
            case "middleInitial":
                error = validateMiddleInitial(value);
                break;
            case "birth":
                error = validateBirth(value);
                break;
            case "number":
                error = validateNumber(value);
                break;
            case "email": // Added email case
                error = validateEmail(value);
                break;
            case "street":
                error = validateStreet(value);
                break;
            case "city":
                error = validateCity(value);
                break;
            case "state":
                error = validateState(value);
                break;
            case "zipCode":
                error = validateZipCode(value);
                break;
            case "country":
                error = validateCountry(value);
                break;
            default:
                break;
        }
        setErrors((prevErrors) => ({ ...prevErrors, [field]: error }));
    };

    const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const registerPatient = () => {
        const currentErrors = {
            firstName: validateFirstName(ufirstName),
            lastName: validateLastName(uLastName),
            middleInitial: validateMiddleInitial(uMiddleInitial),
            birth: validateBirth(uBirth),
            number: validateNumber(uNumber),
            email: validateEmail(uEmail), // Added email validation
            street: validateStreet(street),
            city: validateCity(city),
            state: validateState(state),
            zipCode: validateZipCode(zipCode),
            country: validateCountry(country),
        };

        setErrors(currentErrors);
        setFormSubmitted(true);

        // If there are no validation errors, proceed to register the patient
        if (Object.values(currentErrors).every((error) => error === "")) {
            const patientUser = {
                patient_firstName: ufirstName,
                patient_middleInitial: uMiddleInitial,
                patient_lastName: uLastName,
                patient_dob: uBirth,
                patient_age: uAge,
                patient_contactNumber: uNumber,
                patient_email: uEmail, // Added email field
                patient_gender: uGender,
                accountStatus: accountStatus,
                patient_address: {
                    street,
                    city,
                    state,
                    zipCode,
                    country
                }
            };

            axios.post(`${ip.address}/api/patient/api/unregistered`, patientUser)
                .then((response) => {
                    console.log(response);
                    window.alert("Successfully registered Patient");
                    window.location.reload();
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    };

    useEffect(() => {
        if (uBirth) {
            const age = calculateAge(uBirth);
            setAge(age);
        }
    }, [uBirth]);

    return (
        <>
            <Card className="app-box">
                <Card.Header className="app-boxtitle">Create Patient</Card.Header>
                <Card.Body>
                    <Form>
                        <Row className="mb-3">
                            <Form.Group as={Col} controlId="formFName">
                                <Form.Label>First Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter First Name"
                                    onBlur={(e) => handleBlur("firstName", e.target.value)}
                                    onChange={(e) => {
                                        setFirstName(e.target.value);
                                        if (formSubmitted) handleBlur("firstName", e.target.value);
                                    }}
                                    isValid={formSubmitted && errors.firstName === "" && ufirstName !== ""}
                                    isInvalid={formSubmitted && errors.firstName !== ""}
                                />
                                <Form.Control.Feedback type="invalid">{errors.firstName}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} controlId="formLName">
                                <Form.Label>Last Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Last Name"
                                    onBlur={(e) => handleBlur("lastName", e.target.value)}
                                    onChange={(e) => {
                                        setLastName(e.target.value);
                                        if (formSubmitted) handleBlur("lastName", e.target.value);
                                    }}
                                    isValid={formSubmitted && errors.lastName === "" && uLastName !== ""}
                                    isInvalid={formSubmitted && errors.lastName !== ""}
                                />
                                <Form.Control.Feedback type="invalid">{errors.lastName}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} controlId="formMName">
                                <Form.Label>Middle Initial</Form.Label>
                                <Form.Control
                                    type="text"
                                    maxLength={1} // Limit to 1 character
                                    placeholder="Enter Middle Initial"
                                    onBlur={(e) => handleBlur("middleInitial", e.target.value)}
                                    onChange={(e) => {
                                        setMiddleInitial(e.target.value);
                                        if (formSubmitted) handleBlur("middleInitial", e.target.value);
                                    }}
                                    isValid={formSubmitted && errors.middleInitial === "" && uMiddleInitial !== ""}
                                    isInvalid={formSubmitted && errors.middleInitial !== ""}
                                />
                                <Form.Control.Feedback type="invalid">{errors.middleInitial}</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} className="mb-3" controlId="formBirthDate">
                                <Form.Label>Birthdate</Form.Label>
                                <Form.Control
                                    type="date"
                                    placeholder="Enter Birthdate"
                                    onBlur={(e) => handleBlur("birth", e.target.value)}
                                    onChange={(e) => {
                                        setBirth(e.target.value);
                                        if (formSubmitted) handleBlur("birth", e.target.value);
                                    }}
                                    isValid={formSubmitted && errors.birth === "" && uBirth !== ""}
                                    isInvalid={formSubmitted && errors.birth !== ""}
                                />
                                <Form.Control.Feedback type="invalid">{errors.birth}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="formContactNumber">
                                <Form.Label>Contact Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    maxLength={11}
                                    placeholder="Enter Contact Number"
                                    onBlur={(e) => handleBlur("number", e.target.value)}
                                    onChange={(e) => {
                                        setNumber(e.target.value);
                                        if (formSubmitted) handleBlur("number", e.target.value);
                                    }}
                                    isValid={formSubmitted && errors.number === "" && uNumber !== ""}
                                    isInvalid={formSubmitted && errors.number !== ""}
                                />
                                <Form.Control.Feedback type="invalid">{errors.number}</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        {/* Added Email Section */}
                        <Row>
                            <Form.Group as={Col} controlId="formEmail">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Enter Email"
                                    onBlur={(e) => handleBlur("email", e.target.value)}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (formSubmitted) handleBlur("email", e.target.value);
                                    }}
                                    isValid={formSubmitted && errors.email === "" && uEmail !== ""}
                                    isInvalid={formSubmitted && errors.email !== ""}
                                />
                                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        {/* Address Section */}
                        <Row>
                            <Form.Group as={Col} controlId="formStreet">
                                <Form.Label>Street</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Street"
                                    onBlur={(e) => handleBlur("street", e.target.value)}
                                    onChange={(e) => setStreet(e.target.value)}
                                    isValid={formSubmitted && errors.street === "" && street !== ""}
                                    isInvalid={formSubmitted && errors.street !== ""}
                                />
                                <Form.Control.Feedback type="invalid">{errors.street}</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} controlId="formCity">
                                <Form.Label>City</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter City"
                                    onBlur={(e) => handleBlur("city", e.target.value)}
                                    onChange={(e) => setCity(e.target.value)}
                                    isValid={formSubmitted && errors.city === "" && city !== ""}
                                    isInvalid={formSubmitted && errors.city !== ""}
                                />
                                <Form.Control.Feedback type="invalid">{errors.city}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group as={Col} controlId="formState">
                                <Form.Label>State</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter State"
                                    onBlur={(e) => handleBlur("state", e.target.value)}
                                    onChange={(e) => setState(e.target.value)}
                                    isValid={formSubmitted && errors.state === "" && state !== ""}
                                    isInvalid={formSubmitted && errors.state !== ""}
                                />
                                <Form.Control.Feedback type="invalid">{errors.state}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group as={Col} controlId="formZipCode">
                                <Form.Label>Zip Code</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Zip Code"
                                    onBlur={(e) => handleBlur("zipCode", e.target.value)}
                                    onChange={(e) => setZipCode(e.target.value)}
                                    isValid={formSubmitted && errors.zipCode === "" && zipCode !== ""}
                                    isInvalid={formSubmitted && errors.zipCode !== ""}
                                />
                                <Form.Control.Feedback type="invalid">{errors.zipCode}</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} controlId="formCountry">
                                <Form.Label>Country</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Country"
                                    onBlur={(e) => handleBlur("country", e.target.value)}
                                    onChange={(e) => setCountry(e.target.value)}
                                    isValid={formSubmitted && errors.country === "" && country !== ""}
                                    isInvalid={formSubmitted && errors.country !== ""}
                                />
                                <Form.Control.Feedback type="invalid">{errors.country}</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} controlId="formChooseGender">
                                <Form.Label>Gender:</Form.Label>
                                <Form.Select onChange={(e) => setGender(e.target.value)} defaultValue="Male">
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </Form.Select>
                            </Form.Group>
                        </Row>
                        <div className="d-lg-flex justify-content-between align-items-center mt-3">
                            <div className="d-flex">
                                <Button onClick={registerPatient} variant="primary" type="button">
                                    Submit
                                </Button>
                            </div>
                            <div className="mb-0">
                                <Button variant="link" onClick={() => navigate(-1)}>Back</Button>
                            </div>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </>
    );
};

export default CreatePatientForms;
