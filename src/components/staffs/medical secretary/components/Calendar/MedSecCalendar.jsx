import React from 'react'
import MedSecNavbar from '../../navbar/MedSecNavbar'
import { Container } from 'react-bootstrap';
import AppointmentFullCalendar from './AppointmentFullCalendar'
import '../Dashboard/Styles.css'
import MedSecDashboard from '../Dashboard/MedSecDashboard';

function MedSecCalendar() {
  return (
    <>
        <MedSecNavbar/>

        <Container 
          fluid 
          className='calendar-container overflow-y-scroll p-4'  
          style={{ height: 'calc(100vh - 90px)' }}
        >
          <MedSecDashboard/>
         <AppointmentFullCalendar/>
        </Container>
    </>
  )
}

export default MedSecCalendar
