import React from 'react'
import MedSecNavbar from '../../../navbar/MedSecNavbar'
import CreatePatientForms from '../Forms/CreatePatientForms'
import CreateAppointment from '../New Appointment/CreateAppointment'
import { Container } from "react-bootstrap";

function CreatePatient() {
  return (
    <>
        <MedSecNavbar/>
        <Container className='d-flex justify-content-between space pt-5'>
          <CreatePatientForms/>
          <CreateAppointment/>
        </Container>
       
    </>
  
  )
}

export default CreatePatient