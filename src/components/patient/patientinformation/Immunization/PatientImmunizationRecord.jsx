import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { Table } from 'react-bootstrap';

function PatientImmunizationRecord() {

    const { pid } = useParams(); 
    const [thePrescriptions, setPrescriptions] = useState([]);

    useEffect(() => {
        axios.get(`http://localhost:8000/patient/api/onepatient/${pid}`)
            .then((res) => {
                console.log(res.data);  // Log the entire response to understand its structure
                if (res.data && res.data.thePatient && Array.isArray(res.data.thePatient.patient_appointments)) {
                    setPrescriptions(res.data.thePatient.patient_appointments);
                    console.log(res.data.thePatient);
                } else {
                    setPrescriptions([]);  // If data is not as expected, set to empty array
                }
            })
            .catch((err) => {
                console.log(err);
                setPrescriptions([]);  // In case of error, set to empty array
            });
    }, [pid]);


  return (
   <>
   
   
   </>
  )
}

export default PatientImmunizationRecord
