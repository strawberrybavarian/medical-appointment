import React from 'react';
import { useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button, Dropdown } from "react-bootstrap";

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
                <Navbar.Brand href="/">
                    <img src={image.logo} alt="Logo" className="molino-logo mx-3" />
                </Navbar.Brand>

                {/* Toggle Button for Small Screens */}
                <Navbar.Toggle aria-controls="navbarNav" />

                {/* Navbar Links */}
                <Navbar.Collapse id="navbarNav">
                    <Nav className="ms-auto align-items-center">
                        <Button className="button1 ms-3" onClick={onMemberLoginClick}>Log In</Button>
                        <Nav.Link onClick={onSignUpClick}>Sign Up</Nav.Link>
        
                      
                        

                        {/* Dropdown as a Button for Login */}
                        
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default ForLoginAndSignupNavbar;
