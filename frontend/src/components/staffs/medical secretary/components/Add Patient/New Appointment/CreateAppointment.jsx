// CreateAppointment.js
import React, { useState, useEffect } from "react";
import { Container, Form, Row, Col, Button, Card } from "react-bootstrap";
import axios from "axios";
import Select from "react-select";
import { ip } from "../../../../../../ContentExport";
import AppointmentModal from "./AppointmentModal";

const CreateAppointment = ({ onClose, patientId, patientName }) => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch patients and specialties
  useEffect(() => {
    // Fetch patients
    axios
      .get(`${ip.address}/api/patient/api/allpatient`)
      .then((res) => {
        const patientOptions = res.data.thePatient.map((patient) => ({
          value: patient._id,
          label: `${patient.patient_firstName} ${patient.patient_middleInitial || ''} ${patient.patient_lastName}`,
        }));
        setPatients(patientOptions);

        // If patientId is provided, set selectedPatient
        if (patientId) {
          const matchedPatient = patientOptions.find((p) => p.value === patientId);
          if (matchedPatient) {
            setSelectedPatient(matchedPatient);
          }
        }
      })
      .catch((err) => console.log(err));

    // Fetch specialties
    axios
      .get(`${ip.address}/api/doctor/api/specialties`)
      .then((res) => setSpecialties(res.data.specialties))
      .catch((err) => console.log(err));
  }, [patientId]);

  // Fetch doctors based on selected specialty
  useEffect(() => {
    if (selectedSpecialty) {
      axios
        .get(`${ip.address}/api/doctor/api/alldoctor`)
        .then((response) => {
          const filteredDoctors = response.data.theDoctor.filter(
            (doctor) => doctor.dr_specialty === selectedSpecialty.value
          );
          const doctorOptions = filteredDoctors.map((doctor) => ({
            value: doctor._id,
            label: `${doctor.dr_firstName} ${doctor.dr_middleInitial || ''} ${doctor.dr_lastName}`,
          }));
          setDoctors(doctorOptions);
        })
        .catch((err) => console.log(err));
    } else {
      setDoctors([]);
      setSelectedDoctor(null);
    }
  }, [selectedSpecialty]);

  const getSpecialtyOptions = () =>
    specialties.map((specialty) => ({
      value: specialty.name,
      label: specialty.name,
    }));

  const [error, setError] = useState("");

  const handleBookNow = () => {
    if (!selectedPatient) {
      setError("Please select a patient.");
      return;
    }
    setError("");
    setShowModal(true);
  };

  return (
    <>
      <Container>
        <Card className="app-box">
          <Card.Header className="app-boxtitle">Create Appointment</Card.Header>
          <Card.Body>
            {error && <div className="alert alert-danger">{error}</div>}
            <Form>
              <Row className="mb-3">
                <Form.Group as={Col} controlId="formPatient">
                  <Form.Label>Select Patient</Form.Label>
                  <Select
                    options={patients}
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
                    onChange={(selected) => {
                      setSelectedSpecialty(selected);
                      setSelectedDoctor(null);
                    }}
                    isClearable
                    placeholder="Select specialty..."
                  />
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Form.Group as={Col} controlId="formDoctor">
                  <Form.Label>Select Doctor</Form.Label>
                  <Select
                    options={doctors}
                    value={selectedDoctor}
                    onChange={(selected) => {
                      setSelectedDoctor(selected);
                      if (!selected) setSelectedDoctor(null);
                    }}
                    isClearable
                    placeholder="Search for a doctor..."
                  />
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Col>
                  <Button
                    variant="primary"
                    onClick={handleBookNow}
                    disabled={!selectedPatient} // Disable if no patient is selected
                  >
                    Book Now
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      </Container>

      <AppointmentModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        pid={selectedPatient?.value}
        patientName={selectedPatient?.label}
        did={selectedDoctor?.value}
        doctorName={selectedDoctor?.label}
      />
    </>
  );
};

export default CreateAppointment;
