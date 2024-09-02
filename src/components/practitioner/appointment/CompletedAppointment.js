import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Table from 'react-bootstrap/Table';
import './Appointment.css';
import { Container, Row, Col, Button, Navbar, Nav } from 'react-bootstrap';

const TodaysAppointment = ({ allAppointments }) => {
  const { did } = useParams();

  const [appointments, setAppointments] = useState([]);

  const [error, setError] = useState("");

  // Effect to initialize appointments state with allAppointments
  useEffect(() => {
    setAppointments(allAppointments);
  }, [allAppointments]);

  const completeAppointment = (appointmentID) => {
    const newStatus = {
      status: 'Completed'
    };
    axios.put(`http://localhost:8000/doctor/api/${appointmentID}/completeappointment`, newStatus)
      .then((response) => {
        console.log(response.data);
        setAppointments(prevAppointments => 
          prevAppointments.map(appointment => 
            appointment._id === appointmentID ? { ...appointment, status: 'Completed' } : appointment
          )
        );
      })
      .catch((err) => {
        console.log(err);
        setError("Failed to update appointment status");
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
  const todaysAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date).toISOString().split('T')[0];
    return appointmentDate === todayDate;
  });

  return (
    <>
      <div>
        <div style={{ padding:'30px', width: '100%' }}>
          <h1>Today's Appointments</h1>
          <Table striped bordered hover variant ="dark">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Date</th>
                <th>Time</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {todaysAppointments.map((appointment, index) => {
                const patient = appointment.patient;
                const patientName = `${patient.patient_firstName} ${patient.patient_middleInitial}. ${patient.patient_lastName}`;
                return (
                  <tr key={appointment._id}>
                    <td>{patientName}</td>
                    <td>{new Date(appointment.date).toLocaleDateString()}</td>
                    <td>{appointment.time}</td>
                    <td>{appointment.reason}</td>
                    <td>{appointment.status}</td>
                    <td>
                      {appointment.status !== 'Completed' && (
                        <Button onClick={() => completeAppointment(appointment._id)}>Complete</Button>
                      )}
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
