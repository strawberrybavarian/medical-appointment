import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Table from 'react-bootstrap/Table';
import { Container, Row, Col, Button, Navbar, Nav } from 'react-bootstrap';


import './Appointment.css';
import MainInformation from "../patientinformation/MainInformation";

const OngoingAppointment = ({allAppointments}) => {
  const { did,pid } = useParams();
  
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");

  console.log(pid);
  const completeAppointment = (appointmentID) => {
    const newStatus = {
        status: 'Completed'
    };
    window.location.reload();
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
        });
  }

  const handleCreatePrescription = (patientId, appointmentId) => {
    setSelectedPatientId(patientId);
    setSelectedAppointmentId(appointmentId);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayDate = getTodayDate();

  const OngoingAppointments = allAppointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date).toISOString().split('T')[0];
    return appointmentDate === todayDate;
  });

  return (
    <>
      <div>
        <div style={{ padding:'30px', width: '100%' }}>
          <h1>Ongoing Appointment</h1>
          <Table striped bordered hover variant ="blue">
            <thead>
              <tr>
                <th style={{border: "1px solid #00000018"}}>Appointment ID</th>
                <th style={{border: "1px solid #00000018"}}>Patient Name</th>
                <th style={{border: "1px solid #00000018"}}>Date</th>
                <th style={{border: "1px solid #00000018"}}>Time</th>
                <th style={{border: "1px solid #00000018"}}>Reason</th>
                <th style={{border: "1px solid #00000018"}}>Status</th>
                <th style={{border: "1px solid #00000018"}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {OngoingAppointments
                .filter(appointment => appointment.status === 'Ongoing')
                .map((appointment,index) => {
                const patient = appointment.patient;
                const patientName = `${patient.patient_firstName} ${patient.patient_middleInitial}. ${patient.patient_lastName}`;
                return (
                  <tr key={appointment._id}>
                    <td>{appointment._id}</td>
                    <td>{patientName}</td>
                    <td>{new Date(appointment.date).toLocaleDateString()}</td>
                    <td>{appointment.time}</td>
                    <td>{appointment.reason}</td>
                    <td>{appointment.status}</td>
                    <td>
                      <div>
                        <Link to={`/information/${appointment.patient._id}/${did}/${appointment._id}`}>
                          <Button>Create Prescription</Button>
                        </Link>
                        <Button onClick={() => completeAppointment(appointment._id)}>Complete</Button>
                      </div>
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

export default OngoingAppointment;
