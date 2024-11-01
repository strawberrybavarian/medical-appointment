import axios from "axios";
import { useState, useEffect } from "react";
import { Row, Col, Button, Form, Modal, Alert, Spinner, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ip } from "../../../../../../ContentExport";
import DoctorWeeklySchedule from "../../../../../patient/doctorprofile/DoctorWeeklySchedule";

function AppointmentModal({ show, handleClose, pid, did, doctorName }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [availableTimes, setAvailableTimes] = useState([]);
  const [availability, setAvailability] = useState({});
  const [bookedPatients, setBookedPatients] = useState({ morning: 0, afternoon: 0 });
  const [loading, setLoading] = useState(true);

  const todayDate = new Date().toISOString().split("T")[0];


  useEffect(() => {
    if (did) {
      fetchDoctorData();
    }
  }, [did]);

  useEffect(() => {
    if (date && did) {
      fetchBookedPatients(date);
    }
  }, [date, did]);

  const fetchDoctorData = async () => {
    try {
      const response = await axios.get(`${ip.address}/api/doctor/${did}`);
      const doctor = response.data.doctor;
      setAvailability(doctor.availability || {});
    } catch (error) {
      console.error("Error fetching doctor data:", error);
    }
  };

  const fetchBookedPatients = async (selectedDate) => {
    setLoading(true);
    try {
      const response = await axios.get(`${ip.address}/api/appointments/doctor/${did}/count?date=${selectedDate}`);
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
      doctor: did || null,
      date,
      time,
      reason,
    };

    try {
      await axios.post(`${ip.address}/api/patient/api/${pid}/createappointment`, formData);
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

  return (
    <Modal show={show} onHide={handleClose} className="">
      <div className="">
        <Modal.Header closeButton>
          <Modal.Title>Book Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Render Doctor's Weekly Schedule */}
          <DoctorWeeklySchedule did={did} />

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
                <div>

                <Form.Label>Time</Form.Label>
                {loading ? (
                  <Spinner animation="border" />
                ) : availableTimes.length > 0 ? (
                  <Form.Group className="mb-3">
                  
                    {availableTimes.map((slot, index) => (
                      <Button
                        key={index}
                        variant={time === slot.timeRange ? "secondary" : "outline-primary"}
                        onClick={() => setTime(slot.timeRange)}
                        className="m-1"
                      >
                        {slot.label}: {slot.timeRange} <br /> Slots left: {slot.availableSlots}
                      </Button>
                    ))}
                  </Form.Group>
                ) : (
                  <Alert variant="warning">No available slots for this day.</Alert>
                )}

</div>

                <Form.Group className="mb-3">
                  <Form.Label>Primary Concern</Form.Label>
                  <Form.Control
                    as="textarea"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </Form.Group>
              </Form>
            </>
          )}

          {step === 2 && (
            <>
              <h6>Step 2: Review Appointment Details</h6>
              <p><strong>Date:</strong> {date}</p>
              <p><strong>Time:</strong> {time}</p>
              <p><strong>Primary Concern:</strong> {reason}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {step > 1 && <Button variant="secondary" onClick={handlePrevStep}>Previous</Button>}
          {step < 2 ? (
            <Button variant="primary" onClick={handleNextStep}>Next</Button>
          ) : (
            <Button variant="success" onClick={createAppointment}>Submit</Button>
          )}
        </Modal.Footer>
      </div>
    </Modal>
  );
}

export default AppointmentModal;
