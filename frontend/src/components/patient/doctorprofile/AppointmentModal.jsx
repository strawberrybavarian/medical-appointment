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
    const [bookedSlots, setBookedSlots] = useState([]);

    const doctorId = did;
    const todayDate = new Date().toISOString().split("T")[0];

    useEffect(() => {
        if (did) {
            axios.get(`${ip.address}/api/doctor/${did}`)
                .then((response) => {
                    console.log("Doctor API response:", response.data);
                    const doctor = response.data.doctor || response.data;
                    setAvailability(doctor.availability || {});
                    setActiveAppointmentStatus(doctor.activeAppointmentStatus);
                    console.log("Availability set to:", doctor.availability);
                })
                .catch((err) => console.error(err));
        }
    }, [did]);

    useEffect(() => {
        if (date && did) {
            const selectedDateString = date;

            axios.get(`${ip.address}/api/doctor/${did}/booked-slots?date=${selectedDateString}`)
                .then((response) => {
                    console.log("Booked slots API response:", response.data);
                    const bookedSlots = response.data.bookedSlots || [];
                    setBookedSlots(bookedSlots);
                    console.log("Booked slots set to:", bookedSlots);
                })
                .catch((err) => {
                    console.error(err);
                    setBookedSlots([]);
                });
        } else {
            setAvailableTimes([]);
        }
    }, [date, did]);

    useEffect(() => {
        if (date && availability) {
            const selectedDay = getDayOfWeek(date);
            setAvailableTimes(getAvailableTimesForDay(selectedDay));
        }
    }, [date, availability, bookedSlots]);

    const getDayOfWeek = (date) => {
        const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        const dayIndex = new Date(date).getDay();
        const dayName = daysOfWeek[dayIndex];
        console.log("Computed day of week:", dayName);
        return dayName;
    };

    const getAvailableTimesForDay = (day) => {
        console.log("Day:", day);
        const dayAvailability = availability[day];
        console.log("Day availability:", dayAvailability);
        if (!dayAvailability) return [];

        let times = [];

        if (dayAvailability.morning?.available) {
            const startTime = formatTime(dayAvailability.morning.startTime);
            const endTime = formatTime(dayAvailability.morning.endTime);
            const morningBookedCount = bookedSlots.filter((slot) => slot && parseInt(slot.split(":")[0]) < 12).length;
            const morningSlots = Math.max(
                dayAvailability.morning.maxPatients - morningBookedCount,
                0
            );
            console.log("Morning slots:", morningSlots);
            if (morningSlots > 0) {
                times.push({
                    label: "Morning",
                    timeRange: `${startTime} - ${endTime}`,
                    availableSlots: morningSlots
                });
            }
        }

        if (dayAvailability.afternoon?.available) {
            const startTime = formatTime(dayAvailability.afternoon.startTime);
            const endTime = formatTime(dayAvailability.afternoon.endTime);
            const afternoonBookedCount = bookedSlots.filter((slot) => slot && parseInt(slot.split(":")[0]) >= 12).length;
            const afternoonSlots = Math.max(
                dayAvailability.afternoon.maxPatients - afternoonBookedCount,
                0
            );
            console.log("Afternoon slots:", afternoonSlots);
            if (afternoonSlots > 0) {
                times.push({
                    label: "Afternoon",
                    timeRange: `${startTime} - ${endTime}`,
                    availableSlots: afternoonSlots
                });
            }
        }

        console.log("Available times:", times);
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
            doctor: doctorId || null,
            date,
            time: time || null,
            reason
        };

        axios.post(`${ip.address}/api/patient/api/${pid}/createappointment`, formData)
            .then(() => {
                window.alert("Appointment created successfully!");

                // After successful booking, reduce the available slots on the frontend
                const updatedAvailableTimes = availableTimes.map((slot) => {
                    if (slot.timeRange === time) {
                        return { ...slot, availableSlots: slot.availableSlots - 1 }; // Decrease available slots
                    }
                    return slot;
                });

                setAvailableTimes(updatedAvailableTimes);

                handleClose();
            })
            .catch((err) => {
                const message = err.response?.data?.message || 'An error occurred while creating the appointment.';
                window.alert(`Error: ${message}`);
            });
    };

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
                    <Button variant="secondary" onClick={handleClose}>Close</Button>
                    {activeAppointmentStatus && (
                        <Button variant="primary" onClick={createAppointment}>Submit</Button>
                    )}
                </Modal.Footer>
            </div>
        </Modal>
    );
}

export default AppointmentModal;
