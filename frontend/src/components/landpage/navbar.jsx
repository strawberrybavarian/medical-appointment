import React from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button, NavDropdown, Dropdown } from "react-bootstrap";
import "./Landing.css";
import { image } from "../../ContentExport";

function NavigationalBar({ scrollToServices, scrollToAbout }) {
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

  const handleAboutClick = (e) => {
    e.preventDefault();
    scrollToAbout();
  };

  return (
    <Navbar bg="light" expand="lg" className="nav-bar-no-color fixed-top">
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
            <Nav.Link href="#about" onClick={scrollToAbout}>About</Nav.Link>
            <Nav.Link href="#services" onClick={handleServicesClick}>Services</Nav.Link>
            <Nav.Link href="#contact">News</Nav.Link>
            <Nav.Link href="#departments">Departments</Nav.Link>
            <Nav.Link href="#doctors">Doctors</Nav.Link>
            <Nav.Link href="#contact">Contact</Nav.Link>
            <Button className="button1 ms-3" onClick={onSignUpClick}>Sign Up</Button>
            <Dropdown className="ms-3" autoClose="outside">
                            <Dropdown.Toggle as={Button} variant="primary" id="dropdown-basic">
                                Login
                            </Dropdown.Toggle>

                            <Dropdown.Menu className="login-dropdown-menu">
                                <Dropdown.Item onClick={onMemberLoginClick}>Doctor & Patient</Dropdown.Item>
                                <Dropdown.Item onClick={onStaffLoginClick}>Staffs</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
            {/* Dropdown Menu */}
            {/* <NavDropdown title="Dropdown" id="nav-dropdown" className="ms-3">
              <NavDropdown.Item href="#">Dropdown 1</NavDropdown.Item>
              <NavDropdown.Item href="#">Dropdown 2</NavDropdown.Item>
              <NavDropdown.Item href="#">Dropdown 3</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#">Dropdown 4</NavDropdown.Item>
              <NavDropdown title="Deep Dropdown" id="deep-dropdown" drop="end">
                <NavDropdown.Item href="#">Deep Dropdown 1</NavDropdown.Item>
                <NavDropdown.Item href="#">Deep Dropdown 2</NavDropdown.Item>
                <NavDropdown.Item href="#">Deep Dropdown 3</NavDropdown.Item>
                <NavDropdown.Item href="#">Deep Dropdown 4</NavDropdown.Item>
                <NavDropdown.Item href="#">Deep Dropdown 5</NavDropdown.Item>
              </NavDropdown>
            </NavDropdown> */}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationalBar;