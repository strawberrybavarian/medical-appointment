import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Table from 'react-bootstrap/Table';
import './Appointment.css';
import { Container, Row, Col, Button, Navbar, Nav } from 'react-bootstrap';
const TodaysAppointment = ({allAppointments}) => {
  const { did } = useParams();

  const [appointments, setAppointments] = useState([]);

  const [error, setError] = useState("");


  const completeAppointment = (appointmentID) => {
    const newStatus = {
        status: 'Completed'
    };
    axios.put(`http://localhost:8000/doctor/api/${appointmentID}/completeappointment`, newStatus)
        .then((response) => {
            console.log(response.data);
            setAppointments(prevAppointments => 
                prevAppointments.map(appointment => 
                    appointment._id === appointmentID ? { ...appointment, status: 'Cancelled' } : appointment
                )
            );
        })
        .catch((err) => {
            console.log(err);
        });
}

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayDate = getTodayDate();

  // Filter appointments to get only today's appointments
  const todaysAppointments = allAppointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date).toISOString().split('T')[0];
    return appointmentDate === todayDate;
  });

  return (
    <>
      <div>
        <div style={{ padding:'30px', width: '100%' }}>
          <h1>Completed Appointments</h1>
          <Table striped bordered hover variant ="dark">
            <thead>
              <tr>
                {/* <th>Patient ID</th> */}
           
                <th>Patient Name</th>
                <th>Date</th>
                <th>Time</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {todaysAppointments
                .filter(appointment => appointment.status === 'Completed')
                .map((appointment,index) => {
                const patient = appointment.patient;
               
                const patientName = `${patient.patient_firstName} ${patient.patient_middleInitial}. ${patient.patient_lastName}`;
                return (
                  <tr key={appointment._id}>
                    {/* <td>{appointment.patient.patient_ID}</td> */}
              
                    <td>{patientName}</td>
                    <td>{new Date(appointment.date).toLocaleDateString()}</td>
                    <td>{appointment.time}</td>
                    <td>{appointment.reason}</td>
                    <td>{appointment.status}</td>
                    <td>
                  
                    
                      
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          {error && <p>{error}</p>}
        </div>
      </div>
    </>
  );
};

export default TodaysAppointment;
