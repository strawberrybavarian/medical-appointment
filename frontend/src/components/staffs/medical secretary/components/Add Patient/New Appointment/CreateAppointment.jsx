// CreateAppointment.js
import React, { useState, useEffect } from "react";
import { Container, Form, Row, Col, Button, Card, Modal, Alert } from "react-bootstrap";
import axios from "axios";
import Select from "react-select";
import { ip } from "../../../../../../ContentExport";
import AppointmentModal from "./AppointmentModal";
import DoctorWeeklySchedule from "../../../../../patient/doctorprofile/DoctorWeeklySchedule";
const CreateAppointment = ({ onClose, patientId, patientName }) => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [showModal, setShowModal] = useState(false);


  const [step, setStep] = useState(1);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [availableTimes, setAvailableTimes] = useState([]);
  const [availability, setAvailability] = useState({});
  const [bookedPatients, setBookedPatients] = useState({ morning: 0, afternoon: 0 });
  const [loading, setLoading] = useState(false);
  console.log(selectedDoctor)
  const todayDate = new Date().toISOString().split("T")[0];
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


  useEffect(() => {
    if (selectedDoctor?.value && showModal) {
      fetchDoctorData();
    }
  }, [selectedDoctor, showModal]);

  
  useEffect(() => {
    if (date && selectedDoctor?.value) {
      fetchBookedPatients(date);
    }
  }, [date, selectedDoctor]);

  const fetchDoctorData = async () => {
    try {
      const response = await axios.get(`${ip.address}/api/doctor/${selectedDoctor.value}`);
      const doctor = response.data.doctor;
      setAvailability(doctor.availability || {});
    } catch (error) {
      console.error("Error fetching doctor data:", error);
    }
  };

  const fetchBookedPatients = async (selectedDate) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${ip.address}/api/appointments/doctor/${selectedDoctor.value}/count?date=${selectedDate}`
      );
      const { morning, afternoon } = response.data;
      setBookedPatients({ morning, afternoon });
      updateAvailableTimes(selectedDate, morning, afternoon);
    } catch (error) {
      console.error("Error fetching booked patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateAvailableTimes = (selectedDate, morningCount, afternoonCount) => {
    const selectedDay = getDayOfWeek(selectedDate);
    const times = getAvailableTimesForDay(selectedDay, morningCount, afternoonCount);
    setAvailableTimes(times);
  };

  const getDayOfWeek = (dateString) => {
    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    return daysOfWeek[new Date(dateString).getDay()];
  };

  const getAvailableTimesForDay = (day, morningCount = 0, afternoonCount = 0) => {
    const dayAvailability = availability[day];
    if (!dayAvailability) return [];

    let times = [];

    if (dayAvailability.morning?.available) {
      const availableSlots = Math.max(dayAvailability.morning.maxPatients - morningCount, 0);
      if (availableSlots > 0) {
        times.push({
          label: "Morning",
          timeRange: `${formatTime(dayAvailability.morning.startTime)} - ${formatTime(dayAvailability.morning.endTime)}`,
          availableSlots,
          period: "morning",
        });
      }
    }

    if (dayAvailability.afternoon?.available) {

      const availableSlots = Math.max(dayAvailability.afternoon.maxPatients - afternoonCount, 0);

      if (availableSlots > 0) {
        times.push({
          label: "Afternoon",
          timeRange: `${formatTime(dayAvailability.afternoon.startTime)} - ${formatTime(dayAvailability.afternoon.endTime)}`,
          availableSlots,
          period: "afternoon",
        });
      }

      
    }

    return times;
  };

  const createAppointment = async () => {
    if (!date || !time) {
      window.alert("Please select a valid date and time.");
      return;
    }
  
    const formData = {
      doctor: selectedDoctor.value,
      date,
      time,
      reason,
    };
  
    try {
      await axios.post(
        `${ip.address}/api/patient/api/${selectedPatient.value}/createappointment`, 
        formData
      );
      window.alert("Appointment created successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error creating appointment:", error);
      const message = error.response?.data?.message || "An error occurred.";
      window.alert(`Error: ${message}`);
    }
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const time = new Date();
    time.setHours(hours);
    time.setMinutes(minutes);
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const handleNextStep = () => {
    if (step === 1 && (!date || !time || !reason)) {
      window.alert("Please fill out all fields.");
      return;
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setStep(1);
    setDate("");
    setTime("");
    setReason("");
    setError("");
  };


  return (
    <>
      <Container>
        
     
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
                    disabled={!selectedPatient || !selectedDoctor} // Disable if no patient is selected
                  >
                    Book Now
                  </Button>
                </Col>
              </Row>
            </Form>
     
      </Container>

      <Modal size="lg" show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Book Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <DoctorWeeklySchedule did={selectedDoctor?.value} />

          {step === 1 && (
            <>
              <h6>Step 1: Fill Out the Form</h6>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    min={todayDate}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Label>Time</Form.Label>
                {loading ? (
                  <Container className="d-flex justify-content-center">
                    <p>Loading available times...</p>
                  </Container>
                ) : availableTimes.length > 0 ? (
                  <Container fluid className="d-flex justify-content-center w-100">
                    <Form.Group className="mb-3">
                      {availableTimes.map((slot, index) => (
                        <Button
                          key={index}
                          variant={time === slot.timeRange ? "secondary" : "outline-primary"}
                          onClick={() => setTime(slot.timeRange)}
                          className="m-1"
                        >
                          {slot.label}: {slot.timeRange} <br /> 
                          Slots left: {slot.availableSlots}
                        </Button>
                      ))}
                    </Form.Group>
                  </Container>
                ) : (
                  <Alert variant="warning">No available slots for this day.</Alert>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>Primary Concern</Form.Label>
                  <Form.Control
                    as="textarea"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </Form.Group>
              </Form>
            </>
          )}

{step === 2 && (
            <>
              <h6>Step 2: Review Appointment Details</h6>
              <p><strong>Patient:</strong> {selectedPatient.label}</p>
              <p><strong>Doctor:</strong> {selectedDoctor.label}</p>
              <p><strong>Date:</strong> {date}</p>
              <p><strong>Time:</strong> {time}</p>
              <p><strong>Primary Concern:</strong> {reason}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {step > 1 && (
            <Button variant="secondary" onClick={handlePrevStep}>
              Previous
            </Button>
          )}
          {step < 2 ? (
            <Button variant="primary" onClick={handleNextStep}>
              Next
            </Button>
          ) : (
            <Button variant="success" onClick={createAppointment}>
              Confirm Appointment
            </Button>
          )}
        </Modal.Footer>
        </Modal>







    </>
  );
};

export default CreateAppointment;
