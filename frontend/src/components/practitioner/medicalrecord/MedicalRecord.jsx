import axios from "axios";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import Table from 'react-bootstrap/Table';
import { useParams } from "react-router-dom";
import { ip } from "../../../ContentExport";
const MedicalRecord = ({ onViewRecord }) => {
    const { did } = useParams();
    const [allPatient, setAllPatient] = useState([]);

    useEffect(() => {
      axios
        .get(`${ip.address}/patient/api/allpatient`)
        .then((res) => {
          setAllPatient(res.data.thePatient);
        })
        .catch((err) => {
          console.log(err);
        });
    }, []);

    return (
      <div style={{ padding: "20px", overflowY: "auto", overflowX: "hidden" }} className="container1 container-fluid">
        <h1 className="removegutter dashboard-title">Medical Records</h1>
        <div style={{paddingLeft:'30px', paddingRight:'30px'}}>
          This is medical records
        </div>
        <Table striped bordered hover variant="light">
          <thead>
            <tr>
              <th> Patient ID </th>
              <th> Patient Name </th>
              <th> Patient Age </th>
              <th> Action </th>
            </tr>
          </thead>
          <tbody>
            {allPatient.map((patient, index) => (
              <tr key={index}>
                <td>{patient.patient_ID}</td>
                <td>{patient.patient_firstName} {patient.patient_middleInitial}. {patient.patient_lastName}</td>
                <td>{patient.patient_age}</td>
                <td>
                  <Button onClick={() => onViewRecord(patient._id)}>View Record</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
};

export default MedicalRecord;
