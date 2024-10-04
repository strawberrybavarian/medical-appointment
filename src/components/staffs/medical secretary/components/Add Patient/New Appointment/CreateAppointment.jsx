import React, { useState, useEffect } from "react";
import { Container, Form, Row, Col, Button, Card } from "react-bootstrap";
import axios from "axios";
import Select from "react-select";
import AppointmentModal from "../../../../../patient/doctorprofile/AppointmentModal";

const CreateAppointment = ({ onClose }) => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:8000/patient/api/allpatient")
      .then((res) => setPatients(res.data.thePatient))
      .catch((err) => console.log(err));

    axios.get("http://localhost:8000/doctor/api/specialties")
      .then((res) => setSpecialties(res.data.specialties))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    if (selectedSpecialty) {
      axios.get(`http://localhost:8000/doctor/api/alldoctor`)
        .then((response) => {
          const filteredDoctors = response.data.theDoctor.filter(
            (doctor) => doctor.dr_specialty === selectedSpecialty.value
          );
          setDoctors(filteredDoctors);
        })
        .catch((err) => console.log(err));
    }
  }, [selectedSpecialty]);

  const getPatientOptions = () => {
    return patients.map((patient) => ({
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
    return specialties.map((specialty) => ({
      value: specialty,
      label: specialty,
    }));
  };

  return (
    <>
      <Container>
        <Card className="app-box">
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
                    onChange={setSelectedSpecialty}
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

              {/* Show the button if a patient is selected */}
              {selectedPatient && (
                <Row className="mb-3">
                  <Col>
                    <Button variant="primary" onClick={() => setShowModal(true)}>
                      Book Now
                    </Button>
                  </Col>
                </Row>
              )}
            </Form>
          </Card.Body>
        </Card>
      </Container>

      {/* Appointment Modal */}
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
