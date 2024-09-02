import React, { useState, useEffect, useRef } from "react";
import { Container, Form, Row, Col, Button, Card } from "react-bootstrap";
import axios from "axios";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import CreateAppointmentModal from "./CreateAppointmentModal";
import './Styles.css'
import AppointmentModal from "../../../../../patient/doctorprofile/AppointmentModal";


const CreateAppointment = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [medium, setMedium] = useState("Online");
  const [payment, setPayment] = useState("Cash");

  const [showModal, setShowModal] = useState(false); // Modal visibility state

  useEffect(() => {
    axios
      .get("http://localhost:8000/patient/api/allpatient")
      .then((res) => {
        console.log(res.data);
        
        setPatients(res.data.thePatient);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:8000/doctor/api/specialties")
      .then((res) => {
        setSpecialties(res.data.specialties);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      axios
        .get(`http://localhost:8000/doctor/api/alldoctor`)
        .then((response) => {
          const filteredDoctors = response.data.theDoctor.filter(
            (doctor) =>
              doctor.dr_specialty &&
              doctor.dr_specialty === selectedSpecialty.value
          );
          setDoctors(filteredDoctors);
        })
        .catch((err) => {
          console.log(err);
        });
    };

    if (selectedSpecialty) {
      fetchDoctors();
    } else {
      setDoctors([]);
    }
  }, [selectedSpecialty]);

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getPatientOptions = () => {
    return (patients || []).map((patient) => ({
      value: patient._id,
      label: `${patient.patient_firstName} ${patient.patient_lastName}`,
    }));
};

  const getDoctorOptions = () => {
    return doctors.map((doctor) => ({
      value: doctor._id,
      label: `${doctor.dr_firstName} ${doctor.dr_lastName}`,
    }));
  };

  const getSpecialtyOptions = () => {
    return (specialties || []).map((specialty) => ({
      value: specialty,
      label: specialty,
    }));
  };

  const todayDate = getTodayDate();

  return (
    <>

      <Card className="app-box" >
        <Card.Header className="app-boxtitle">Create Appointment</Card.Header>
        <Card.Body>
        <Form>
              <Row className="mb-3">
                <Form.Group as={Col} controlId="formPatient">
                  <Form.Label>Select Patient</Form.Label>
                  <Select
                    options={getPatientOptions()}
                    value={selectedPatient}
                    onChange={setSelectedPatient}
                    isClearable
                    placeholder="Search for a patient..."
                  />
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Form.Group as={Col} controlId="formSpecialty">
                  <Form.Label>Filter by Specialty</Form.Label>
                  <Select
                    options={getSpecialtyOptions()}
                    value={selectedSpecialty}
                    onChange={(option) => setSelectedSpecialty(option)}
                    isClearable
                    placeholder="Select specialty..."
                  />
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Form.Group as={Col} controlId="formDoctor">
                  <Form.Label>Select Doctor</Form.Label>
                  <Select
                    options={getDoctorOptions()}
                    value={selectedDoctor}
                    onChange={setSelectedDoctor}
                    isClearable
                    placeholder="Search for a doctor..."
                  />
                </Form.Group>
              </Row>

              {selectedPatient && selectedDoctor && (
                <Row className="mb-3">
                  <Col>
                    <Button
                      variant="primary"
                      onClick={() => setShowModal(true)}
                    >
                      Book Now
                    </Button>
                  </Col>
                </Row>
              )}
            </Form>
        </Card.Body>
      </Card>
      

      <AppointmentModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        pid={selectedPatient?.value}
        did={selectedDoctor?.value}
        doctorName={selectedDoctor?.label}
      />

    </>
    
  );
};

export default CreateAppointment;
