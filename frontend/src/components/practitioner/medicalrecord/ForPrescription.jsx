
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Card, Table, Button } from 'react-bootstrap';
const ForPrescription = ({patient}) => {

    const thePrescriptions = patient.patient_appointments;
  return (
    <>
    <div>
        <h1>History of Appointments and Prescription</h1>
    </div>

    <div className="pi-container">
        <div>
        {thePrescriptions.length > 0 ? (
            thePrescriptions.map((appointment, index) => (
                <div key={index} className="pi-container2" style={{marginBottom: '40px'}}>
                    
                    <h3>Appointment {index + 1}</h3>

                        <p> Physician: {appointment.doctor.dr_firstName} {appointment.doctor.dr_middleInitial}. {appointment.doctor.dr_lastName} </p>
                        <p> Date of Appointment: {new Date(appointment.date).toLocaleDateString()}</p>
                    <div>
                    {appointment.prescription && Array.isArray(appointment.prescription.medications) && appointment.status === 'Completed' ? (
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th>Instructions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointment.prescription.medications.map((medication, medIndex) => (
                                    <tr key={medIndex}>
                                        <td>{medication.name}</td>
                                        <td>{medication.type}</td>
                                        <td>{medication.instruction}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <p>No medications found for this appointment.</p>
                    )}
                    </div>
                </div>
            ))
        ) : (
            <p>No prescriptions found.</p>
        )}
        </div>
    </div>
</>
   
  )
}

export default ForPrescription