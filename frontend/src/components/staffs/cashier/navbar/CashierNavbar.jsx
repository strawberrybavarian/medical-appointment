import React from 'react'
import { useNavigate, useParams } from "react-router-dom";
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import {ChevronDown } from 'react-bootstrap-icons';
import {image} from '../../../../ContentExport'

console.log(image.logo)
function CashierNavbar() {

    const navigate = useNavigate();
    const {msid} = useParams();

    const onNavigateAppoinments = () => {
        navigate(`/medsec/${msid}`)
    }
    const onNavigateCreatePatient = () => {
        navigate(`/medsec/createpatient/${msid}`)
    }
    
    const onButtonContainer1Click = () => {
        navigate("/");
    };
  return (
    <>
    
        <div className="landing-page">
            <div className="navbar-3">
                <Navbar bg="light" expand="lg" className="pnb-navbar">
                <Container>
                           
                            <img className="molino-logo" src={image.logo} alt="Logo" />
                            <div className='msn-container'>    
                                <h6>Molino Polyclinic</h6>
                            </div>
                           
         
           
                            
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav justify-content-end">
                        <Nav>
                            {/* <Nav.Link className="pnb-nav-link" onClick={onNavigateAppoinments}>Appointments </Nav.Link>
                            <Nav.Link className="pnb-nav-link" onClick={onNavigateCreatePatient}>Create Appointment </Nav.Link>
                             */}
                        </Nav>

                        <Nav>
                            <NavDropdown title={<span>Account <ChevronDown /></span>} id="basic-nav-dropdown" className="pnb-nav-link1">
                                
                                <NavDropdown.Item className="pnb-nav-link" onClick={onButtonContainer1Click}>Logout</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                        
                    </Navbar.Collapse>
                </Container>
                </Navbar>
            </div>
        </div>

    </>
  )
}

export default CashierNavbar