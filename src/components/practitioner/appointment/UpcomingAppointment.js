import { useEffect, useState } from "react";
import Table from 'react-bootstrap/Table';
import { Link } from "react-router-dom";
import './Appointment.css';

const UpcomingAppointment = ({ allAppointments }) => {
  const [error, setError] = useState("");

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayDate = getTodayDate();
  const upcomingAppointments = allAppointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date).toISOString().split('T')[0];
    return appointmentDate > todayDate;
  });

  return (
    <div>
      <div style={{ padding: '30px', width: '100%' }}>
        <h1>Upcoming Appointments</h1>
        <Table striped bordered hover variant="light">
          <thead>
            <tr>
              {/* <th style={{border: "1px solid #00000018"}}>Patient ID</th> */}
              
              <th style={{border: "1px solid #00000018"}}>Patient Name</th>
              <th style={{border: "1px solid #00000018"}}>Date</th>
              <th style={{border: "1px solid #00000018"}}>Time</th>
              <th style={{border: "1px solid #00000018"}}>Reason</th>
              <th style={{border: "1px solid #00000018"}}>Status</th>
              <th style={{border: "1px solid #00000018"}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {upcomingAppointments
              .filter(appointment => appointment.status === 'Scheduled')
              .map((appointment) => {
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
                      <Link to={`/edit/${appointment._id}`}>Edit</Link>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </Table>
        {error && <p>{error}</p>}
      </div>
    </div>
  );
};

export default UpcomingAppointment;
