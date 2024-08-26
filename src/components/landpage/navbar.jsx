
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Navbar, Nav, } from 'react-bootstrap';
import "./Landing.css";
import {image} from '../../ContentExport'

function LandingPage () {
  const navigate = useNavigate();

  const onButtonContainerClick = (() => {
    navigate("/medapp/signup");
  });

  const onButtonContainer1Click = (() => {
    navigate("/medapp/login");
  });

  return (
    <>
     
        <div className="landing-page">
            <div className="navbar-3">
                <Navbar bg="light" expand="lg">
                <Container>
                        
                <img  className="molino-logo" src={image.logo} alt="Logo" />
                            <div className='msn-container'>    
                                <h6>Molino Polyclinic</h6>
                            </div>
                    
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            
                        </Nav>
                        <Nav>
                            <Button className="button1" onClick={onButtonContainerClick}>Sign Up</Button>
                            <Button className="button1" onClick={onButtonContainer1Click}>Log In</Button>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
                </Navbar>
            </div>
        </div>
    </>
  );
};

export default LandingPage;
