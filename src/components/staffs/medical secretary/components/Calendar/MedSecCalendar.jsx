import React from 'react'
import MedSecNavbar from '../../navbar/MedSecNavbar'
import { Container } from 'react-bootstrap';
import AppointmentFullCalendar from './AppointmentFullCalendar'
import '../Dashboard/Styles.css'
import MedSecDashboard from '../Dashboard/MedSecDashboard';
import { useParams } from 'react-router-dom';
console.log();
function MedSecCalendar() {
  const {msid} = useParams()
  console.log(msid, 'haha');
  return (
    <>
        <MedSecNavbar/>

        <Container 
          fluid 
          className='calendar-container overflow-y-scroll p-4'  
          style={{ height: 'calc(100vh - 90px)' }}
        >
  
         <AppointmentFullCalendar msid={msid}/>
        </Container>
    </>
  )
}

export default MedSecCalendar
