import axios from "axios";
import { useState, useEffect } from "react";
import { Row, Col, Button, Form, Modal } from 'react-bootstrap';
import { ip } from "../../../ContentExport";

function AppointmentModal({ show, handleClose, pid, did, doctorName }) {
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [reason, setReason] = useState("");
    const [availableTimes, setAvailableTimes] = useState([]);
    const [availability, setAvailability] = useState({});
    const [activeAppointmentStatus, setActiveAppointmentStatus] = useState(true);
    const [bookedPatients, setBookedPatients] = useState({ morning: 0, afternoon: 0 });

    const doctorId = did;

    // Reset modal state when the modal is closed or the doctor changes
    useEffect(() => {
        if (!show) {
            // Clear all states when the modal is closed
            setDate("");
            setTime("");
            setReason("");
            setAvailableTimes([]);
        }
    }, [show]);

    useEffect(() => {
        if (did) {
            // If a doctor ID is provided, fetch the doctor's availability
            axios.get(`${ip.address}/api/doctor/${did}`)
                .then((response) => {
                    const doctor = response.data.doctor;
                    console.log("Doctor Availability:", doctor.availability); // Add this log
                    setAvailability(doctor.availability || {});
                    setActiveAppointmentStatus(doctor.activeAppointmentStatus);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [did]);
    

    useEffect(() => {
        if (date) {
            // Fetch number of patients already booked for the selected date
            axios.get(`${ip.address}/api/appointments/${did}/count?date=${date}`)
                .then((response) => {
                    console.log("Response Data from API:", response.data); // Log the response data
                    const { morning, afternoon } = response.data;
                    setBookedPatients({ morning, afternoon });
                })
                .catch((err) => {
                    console.log(err);
                });
        } else {
            setAvailableTimes([]);
        }
    }, [date]);
    
    

    useEffect(() => {
        if (date && availability) {
            const selectedDate = new Date(date);
            const daysOfWeek = [
                "sunday",
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday"
            ];
            const day = daysOfWeek[selectedDate.getDay()];
            console.log("Selected Day:", day); // Log the selected day
            setAvailableTimes(getAvailableTimes(day));
        }
    }, [date, availability, bookedPatients]);
    

    const getAvailableTimes = (day) => {
        const dayAvailability = availability[day];
        if (!dayAvailability) {
            console.log("No availability for this day:", day); // Log when no availability is found
            return [];
        }
    
        let times = [];
        if (dayAvailability.morning?.available) {
            const startTime = formatTime(dayAvailability.morning.startTime);
            const endTime = formatTime(dayAvailability.morning.endTime);
            const availableSlots = dayAvailability.morning.maxPatients - bookedPatients.morning;
            console.log("Morning Slots:", availableSlots); // Log available slots
    
            if (availableSlots > 0) {
                times.push({
                    label: "Morning",
                    timeRange: `${startTime} - ${endTime}`,
                    availableSlots,
                });
            }
        }
    
        if (dayAvailability.afternoon?.available) {
            const startTime = formatTime(dayAvailability.afternoon.startTime);
            const endTime = formatTime(dayAvailability.afternoon.endTime);
            const availableSlots = dayAvailability.afternoon.maxPatients - bookedPatients.afternoon;
            console.log("Afternoon Slots:", availableSlots); // Log available slots
    
            if (availableSlots > 0) {
                times.push({
                    label: "Afternoon",
                    timeRange: `${startTime} - ${endTime}`,
                    availableSlots,
                });
            }
        }
    
        return times;
    };
    

    const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(":");
        const time = new Date();
        time.setHours(hours);
        time.setMinutes(minutes);

        return time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
    };

    const createAppointment = () => {
        if (!date) {
            window.alert("Please select a valid date for the appointment.");
            return;
        }

        const formData = {
            doctor: doctorId || null, // Ensure the doctor ID is included in the formData
            date,
            time: time || null,
            reason
        };

        axios.post(`${ip.address}/api/patient/api/${pid}/createappointment`, formData)
            .then(() => {
                window.alert("Created an appointment!");
                handleClose(); // Close modal after success
            })
            .catch((err) => {
                if (err.response) {
                    console.log(err.response.data);
                    window.alert(`Error: ${err.response.data.message}`);
                } else {
                    console.log(err);
                    window.alert('An error occurred while creating the appointment.');
                }
            });
    };

    const todayDate = new Date().toISOString().split("T")[0];

    return (
        <Modal show={show} onHide={handleClose} className='am-overlay'>
            <div className="am-content">
                <Modal.Header className="am-header" closeButton>
                    <Modal.Title>Book Appointment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Your Doctor: {doctorName || 'No Doctor Selected (Optional)'}</p>
                    {activeAppointmentStatus ? (
                        <Form>
                            <Row>
                                <Form.Group as={Col} className="mb-3">
                                    <Form.Label>Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        min={todayDate}
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                            </Row>

                            {availableTimes.length > 0 ? (
    <Row>
        <Form.Group as={Col} className="mb-3">
            <Form.Label>Time (Optional)</Form.Label>
            <div>
                {availableTimes.map((timeSlot, index) => (
                    <Button
                        key={index}
                        variant={time === timeSlot.timeRange ? "secondary" : "outline-primary"}
                        onClick={() => setTime(timeSlot.timeRange)}
                        className="m-1"
                    >
                        {timeSlot.label}: {timeSlot.timeRange} <br />
                        Slots left: {timeSlot.availableSlots}
                    </Button>
                ))}
            </div>
        </Form.Group>
    </Row>
) : (
    <Row>
        <Form.Group as={Col} className="mb-3">
            <Form.Label>Time</Form.Label>
            <p>No available appointments for this day.</p>
        </Form.Group>
    </Row>
)}


                            <Row>
                                <Form.Group as={Col} className="mb-3">
                                    <Form.Label>Primary Concern</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                    />
                                </Form.Group>
                            </Row>
                        </Form>
                    ) : (
                        <p>Doctor is not accepting appointments currently.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    {activeAppointmentStatus && (
                        <Button variant="primary" onClick={createAppointment}>
                            Submit
                        </Button>
                    )}
                </Modal.Footer>
            </div>
        </Modal>
    );
}

export default AppointmentModal;