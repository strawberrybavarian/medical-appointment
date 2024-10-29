import React from 'react';
import { useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button, Dropdown } from "react-bootstrap";
import "./Landing.css";
import { image } from "../../ContentExport";

function ForLoginAndSignupNavbar({ scrollToServices }) {
    const navigate = useNavigate();

    const onSignUpClick = () => {
        navigate("/medapp/signup");
    };

    const onMemberLoginClick = () => {
        navigate("/medapp/login");
    };

    const onStaffLoginClick = () => {
        navigate("/staffs");
    };

    const handleServicesClick = (e) => {
        e.preventDefault();
        scrollToServices();
    };

    return (
        <Navbar bg="light" expand="lg" className="nav-bar-no-color navbar-fixed-top fixed-top px-5 py-0">
            <Container>
                {/* Logo */}
                <Navbar.Brand href="#hero">
                    <img src={image.logo} alt="Logo" className="molino-logo mx-3" />
                </Navbar.Brand>

                {/* Toggle Button for Small Screens */}
                <Navbar.Toggle aria-controls="navbarNav" />

                {/* Navbar Links */}
                <Navbar.Collapse id="navbarNav">
                    <Nav className="ms-auto align-items-center">
                        <Nav.Link href="/">Home</Nav.Link>
        
                        <Button className="button1 ms-3" onClick={onSignUpClick}>Sign Up</Button>

                        {/* Dropdown as a Button for Login */}
                        <Dropdown className="ms-3" autoClose="outside">
                            <Dropdown.Toggle as={Button} variant="primary" id="dropdown-basic">
                                Login
                            </Dropdown.Toggle>

                            <Dropdown.Menu className="login-dropdown-menu">
                                <Dropdown.Item onClick={onMemberLoginClick}>Doctor & Patient</Dropdown.Item>
                                <Dropdown.Item onClick={onStaffLoginClick}>Staffs</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default ForLoginAndSignupNavbar;
