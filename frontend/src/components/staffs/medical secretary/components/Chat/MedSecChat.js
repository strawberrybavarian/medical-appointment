// MedSecChat.js

import React, { useEffect, useState } from "react";
import axios from 'axios';
import ChatBox from "../../../../patient/chatwidget/ChatBox";
import { ip } from "../../../../../ContentExport";
const MedSecChat = ({ userId, userRole }) => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    // Fetch the list of patients who have chatted with this MedSec
    axios.get(`${ip.address}/api/chat/patients`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }
    }).then(response => {
      setPatients(response.data.data);
    }).catch(error => {
      console.error('Error fetching patients list:', error);
    });
  }, []);

  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
  };

  return (
    <div>
      <div>
        <h3>Patients</h3>
        <ul>
          {patients.map(patient => (
            <li key={patient.patientId} onClick={() => handlePatientClick(patient)}>
              {patient.patientName}
            </li>
          ))}
        </ul>
      </div>
      {selectedPatient && (
        <ChatBox
          userId={userId}
          userRole={userRole}
          receiverId={selectedPatient.patientId}
          receiverRole="Patient"
        />
      )}
    </div>
  );
};

export default MedSecChat;
