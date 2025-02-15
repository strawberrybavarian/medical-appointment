import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button, Dropdown } from "react-bootstrap";


import { image } from "../../ContentExport";
import LabResultModal from "./LabResultModal"; // Import the LabResultModal component

function NavigationalBar({ scrollToServices, scrollToAbout, scrollToNews }) {
  const navigate = useNavigate();
  const [showLabModal, setShowLabModal] = useState(false); // State to control modal visibility

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

  const handleAboutClick = (e) => {
    e.preventDefault();
    scrollToAbout();
  };

  const handleNewsClick = (e) => {
    e.preventDefault();
    scrollToNews();
  };

  const handleLabResultClick = () => {
    setShowLabModal(true);
  };

  return (
    <>
      <Navbar bg="light" expand="lg" className="nav-bar-no-color navbar-fixed-top fixed-top px-5 py-0">
        <Container>
          {/* Logo */}
          <Navbar.Brand href="#hero">
            <img src={image.logo} alt="Logo" className="molino-logo" />
          </Navbar.Brand>

          {/* Toggle Button for Small Screens */}
          <Navbar.Toggle aria-controls="navbarNav" />

          {/* Navbar Links */}
          <Navbar.Collapse id="navbarNav">
            <Nav className="ms-auto align-items-center">
              <Nav.Link href="/">Home</Nav.Link>
              <Nav.Link href="#about" onClick={handleAboutClick}>
                About
              </Nav.Link>
              <Nav.Link href="#services" onClick={handleServicesClick}>
                Services
              </Nav.Link>
              <Nav.Link href="#news" onClick={handleServicesClick}>News</Nav.Link>
              <Nav.Link href="#departments">Departments</Nav.Link>
              <Nav.Link href="#doctors">Doctors</Nav.Link>
              <Nav.Link href="#contact">Contact</Nav.Link>

              {/* Lab Result Button */}
              <Button
                variant="outline-primary"
                className="ms-3"
                onClick={handleLabResultClick}
              >
                Lab Result
              </Button>
              <Button className="button1 ms-3" onClick={onMemberLoginClick}>
                Log In
              </Button>
              <Nav.Link className="button1 ms-3" onClick={onSignUpClick}>
                Sign Up
              </Nav.Link>
              
            </Nav>
          </Navbar.Collapse>
          </Container>
      </Navbar>

      {/* LabResultModal */}
      <LabResultModal
        show={showLabModal}
        handleClose={() => setShowLabModal(false)}
      />
    </>
  );
}

export default NavigationalBar;
