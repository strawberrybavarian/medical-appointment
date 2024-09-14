import React from 'react'
import MedSecNavbar from '../../../navbar/MedSecNavbar'
import CreatePatientForms from '../Forms/CreatePatientForms'
import CreateAppointment from '../New Appointment/CreateAppointment'
import { Container, Row, Col } from "react-bootstrap";

function CreatePatient() {
  return (
    <>
        <MedSecNavbar/>
        <Container className='d-flex justify-content-center space pt-5 mb-3'>

          <Row>
            <Col md={6} className="mb-3">
              <CreatePatientForms/>
            </Col>

            <Col md={6} className="mb-3">
              <CreateAppointment/>
            </Col>

          </Row>
          
          
        </Container>
       
    </>
  
  )
}

export default CreatePatient