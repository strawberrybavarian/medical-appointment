import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Row, Col, Button, Form, Container, Card } from "react-bootstrap";
import PasswordValidation from "./PasswordValidation";
import "./SignUp.css";
import NavigationalBar from '../landpage/navbar';

const NewSignUp = () => {
    const navigate = useNavigate();
    const [ufirstName, setfirstName] = useState("");
    const [uLastName, setLastName] = useState("");
    const [uAge, setAge] = useState(0);
    const [uMiddleInitial, setMiddleInitial] = useState("");
    const [uemail, setemail] = useState("");
    const [uBirth, setBirth] = useState("");
    const [upassword, setPass] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [uNumber, setNumber] = useState("");
    const [uGender, setGender] = useState("");
    const [urole, setURole] = useState("Patient");
    const [accountStatus, setAccountStatus] = useState('Registered');

    // Practitioner-specific fields
    const [dr_licenseNo, setLicenseNo] = useState("");

    // Patient-specific fields
    const [patientAddress, setPatientAddress] = useState({
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
    });
    const [patientNationality, setPatientNationality] = useState("");
    const [patientCivilStatus, setPatientCivilStatus] = useState("");

    const [errors, setErrors] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        birth: "",
        number: "",
        gender: "",
        role: "",
    });

    // Validation function
    const validateForm = () => {
        const newErrors = {};
        if (!ufirstName) newErrors.firstName = "First Name is required";
        if (!uLastName) newErrors.lastName = "Last Name is required";
        if (!uemail || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(uemail)) newErrors.email = "Valid Email is required";
        if (!upassword) newErrors.password = "Password is required";
        if (upassword !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
        if (!uBirth) newErrors.birth = "Birthdate is required";
        if (!uNumber) newErrors.number = "Contact Number is required";
        if (!uGender) newErrors.gender = "Gender is required";
        if (!urole) newErrors.role = "Role is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Returns true if no errors
    };

    // Field Blur Handler (for validation on blur)
    const handleBlur = (field, value) => {
        let error = "";
        switch (field) {
            case "firstName":
                error = !value ? "First Name is required" : "";
                break;
            case "lastName":
                error = !value ? "Last Name is required" : "";
                break;
            case "email":
                error = !value || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value) ? "Valid Email is required" : "";
                break;
            case "password":
                error = !value ? "Password is required" : "";
                break;
            case "confirmPassword":
                error = value !== upassword ? "Passwords do not match" : "";
                break;
            case "birth":
                error = !value ? "Birthdate is required" : "";
                break;
            case "number":
                error = !value ? "Contact Number is required" : "";
                break;
            case "gender":
                error = !value ? "Gender is required" : "";
                break;
            case "role":
                error = !value ? "Role is required" : "";
                break;
            default:
                break;
        }
        setErrors((prevErrors) => ({ ...prevErrors, [field]: error }));
    };

    const registerUser = () => {
        if (!validateForm()) {
            return;
        }

        if (urole === "Practitioner") {
            const doctorUser = {
                dr_firstName: ufirstName,
                dr_lastName: uLastName,
                dr_middleInitial: uMiddleInitial,
                dr_email: uemail,
                dr_password: upassword,
                dr_dob: uBirth,
                dr_age: uAge,
                dr_contactNumber: uNumber,
                dr_gender: uGender,
                dr_licenseNo: dr_licenseNo,  // Practitioner-specific field
            };
            axios.post('http://localhost:8000/doctor/api/signup', doctorUser)
                .then((response) => {
                    console.log(response);
                    window.alert("Successfully registered Practitioner");
                    navigate('/medapp/login');
                })
                .catch((err) => {
                    console.log(err);
                });
        } else if (urole === "Patient") {
            const patientUser = {
                patient_firstName: ufirstName,
                patient_middleInitial: uMiddleInitial,
                patient_lastName: uLastName,
                patient_email: uemail,
                patient_password: upassword,
                patient_dob: uBirth,
                patient_age: uAge,
                patient_contactNumber: uNumber,
                patient_gender: uGender,
                accountStatus: accountStatus,
                patient_address: patientAddress,  // Patient-specific field
                patient_nationality: patientNationality,
                patient_civilstatus: patientCivilStatus,
            };
            console.log(patientUser);
            axios.post('http://localhost:8000/patient/api/signup', patientUser)
                .then((response) => {
                    console.log(response);
                    window.alert("Successfully registered Patient");
                    navigate('/medapp/login');
                })
                .catch((err) => {
                    console.log(err);
                });
        }
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

    useEffect(() => {
        if (uBirth) {
            const age = calculateAge(uBirth);
            setAge(age);
        }
    }, [uBirth]);

    return (
        <>
            <div>
               <div>
                <NavigationalBar />
                <Container fluid style={{ overflowY: 'auto', height: 'calc(100vh - 100px)', width: '100%', paddingBottom: '1.5rem' }}>
                    <div    className="login-background"
                            style={{
                            //   backgroundImage: `url(${ip.address}/images/Background-Login.png)`, // Dynamically load the image URL
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'}}>
                       
                            <div className="login-background">
                                <div className="login-overlay"></div>
                                <div className="login-page">

                                <Container className="d-flex justify-content-center align-items-center vh-100 pt-5 mt-5" style={{paddingTop:'400px'}}>
                <Card className="container shadow p-4" style={{marginTop:'20rem'}} >
                    <Card.Body>
                        <div className="container">
                            <h4>Sign Up</h4>
                       
                            <Form>

                            <Form.Group as={Col} controlId="formChoose" className="mb-3">
                                        <Form.Label>Choose what to register:</Form.Label>
                                        <Form.Select
                                            onBlur={(e) => handleBlur("role", e.target.value)}
                                            onChange={(e) => setURole(e.target.value)}
                                            defaultValue="Patient"
                                        >
                                            
                                            <option value="Patient">Patient</option>
                                            <option value="Practitioner">Practitioner</option>
                                        </Form.Select>
                                    </Form.Group>
                                {/* Fields for name, email, password, etc. */}
                                <Row className="mb-3">
                                    <Form.Group as={Col} controlId="formFName">
                                        <Form.Label>First Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter First Name"
                                            onBlur={(e) => handleBlur("firstName", e.target.value)}
                                            onChange={(e) => setfirstName(e.target.value)}
                                        />
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="formLName">
                                        <Form.Label>Last Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter Last Name"
                                            onBlur={(e) => handleBlur("lastName", e.target.value)}
                                            onChange={(e) => setLastName(e.target.value)}
                                        />
                                    </Form.Group>
                                    
                                    <Form.Group as={Col} controlId="formMName">
                                        <Form.Label>Middle Initial</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter Middle Initial"
                                            onChange={(e) => setMiddleInitial(e.target.value)}
                                        />
                                    </Form.Group>
                                </Row>

                                <Row>
                                    <Form.Group as={Col} className="mb-3" controlId="formBirthDate">
                                        <Form.Label>Birthdate</Form.Label>
                                        <Form.Control
                                            type="date"
                                            placeholder="Enter Birthdate"
                                            onBlur={(e) => handleBlur("birth", e.target.value)}
                                            onChange={(e) => setBirth(e.target.value)}
                                        />
                                    </Form.Group>

                                    <Form.Group as={Col} className="mb-3" controlId="formContactNumber">
                                        <Form.Label>Contact Number</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter Contact Number (e.g., 09123456789)"
                                            onBlur={(e) => handleBlur("number", e.target.value)}
                                            onChange={(e) => setNumber(e.target.value)}
                                            maxLength={11}
                                        />
                                    </Form.Group>
                                </Row>

                                <Row>
                                    <Form.Group as={Col} className="mb-3" controlId="formEmail">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            placeholder="Enter Email Address"
                                            onBlur={(e) => handleBlur("email", e.target.value)}
                                            onChange={(e) => setemail(e.target.value)}
                                        />
                                    </Form.Group>
                                </Row>

                                <Row>
                                    <Form.Group className="mb-3" controlId="formPassword">
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder="Enter Password"
                                            onBlur={(e) => handleBlur("password", e.target.value)}
                                            onChange={(e) => setPass(e.target.value)}
                                        />
                                    </Form.Group>
                                </Row>

                                <Row>
                                    <Form.Group className="mb-3" controlId="formConfirmPassword">
                                        <Form.Label>Confirm Password</Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder="Confirm Password"
                                            onBlur={(e) => handleBlur("confirmPassword", e.target.value)}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </Form.Group>
                                </Row>


                                <PasswordValidation password={upassword} />
                                {urole === "Patient" && (
                                    <>
                                        <Row>
                                            <Form.Group as={Col} controlId="formStreet">
                                                <Form.Label>Street</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Enter Street"
                                                    onChange={(e) => setPatientAddress({ ...patientAddress, street: e.target.value })}
                                                />
                                            </Form.Group>
                                            <Form.Group as={Col} controlId="formCity">
                                                <Form.Label>City</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Enter City"
                                                    onChange={(e) => setPatientAddress({ ...patientAddress, city: e.target.value })}
                                                />
                                            </Form.Group>
                                        </Row>
                                        {/* Additional fields for patient address */}
                                        <Row>
                                            <Form.Group as={Col} controlId="formNationality">
                                                <Form.Label>Nationality</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Enter Nationality"
                                                    onChange={(e) => setPatientNationality(e.target.value)}
                                                />
                                            </Form.Group>
                                            <Form.Group as={Col} controlId="formCivilStatus">
                                                <Form.Label>Civil Status</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Enter Civil Status"
                                                    onChange={(e) => setPatientCivilStatus(e.target.value)}
                                                />
                                            </Form.Group>
                                        </Row>
                                    </>
                                )}

                                {urole === "Practitioner" && (
                                    <Row>
                                        <Form.Group as={Col} controlId="formLicenseNo">
                                            <Form.Label>License Number</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter License Number"
                                                onChange={(e) => setLicenseNo(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Row>
                                )}

                                <Row>
                                    <Form.Group as={Col} controlId="formChooseGender">
                                        <Form.Label>Gender:</Form.Label>
                                        <Form.Select
                                            onBlur={(e) => handleBlur("gender", e.target.value)}
                                            onChange={(e) => setGender(e.target.value)}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </Form.Select>
                                    </Form.Group>

                                  
                                </Row>

                                {/* Role-specific Conditional Fields */}
                                

                                
                                {/* Submit button */}
                                <div className="d-lg-flex justify-content-between align-items-center mt-3">
                                    <Button onClick={registerUser} variant="primary" type="button">
                                        Submit
                                    </Button>
                                    <div className="mb-0">
                                        <Link to="/medapp/login">Already have an account?</Link>
                                    </div>
                                </div>
                            </Form>
                        </div>
                    </Card.Body>
                </Card>
            </Container>


                                </div>
                            </div>

                            
                        </div>
                  
                </Container>
               </div>
            </div>
           
        


         
            
        </>
    );
};

export default NewSignUp;
