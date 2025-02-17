import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Col } from 'react-bootstrap';
import axios from 'axios';
import { ip } from '../../../../ContentExport';

function FollowUpModal({ show, handleClose, appointment, pid, setAppointments }) {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [availability, setAvailability] = useState({});
    const [morningTimeRange, setMorningTimeRange] = useState("");
    const [afternoonTimeRange, setAfternoonTimeRange] = useState("");
    const [availableSlots, setAvailableSlots] = useState({ morning: 0, afternoon: 0 });
    const [reason, setReason] = useState(appointment.reason || '');

    const doctorId = appointment.doctor._id;
    const todayDate = new Date().toISOString().split('T')[0]; 

    const convertTo24HourFormat = (time) => {
        const [hours, minutes, period] = time.match(/(\d+):(\d+) (AM|PM)/).slice(1);
        let hour24 = parseInt(hours, 10);
        if (period === 'PM' && hour24 !== 12) hour24 += 12;
        if (period === 'AM' && hour24 === 12) hour24 = 0;
        return `${String(hour24).padStart(2, '0')}:${minutes}`;
    };

    useEffect(() => {
        if (appointment && doctorId) {
            axios.get(`${ip.address}/api/doctor/${doctorId}`)
                .then(response => {
                    const doctor = response.data.doctor;
                    setAvailability(doctor.availability || {});
                })
                .catch(err => {
                    console.error(err);
                });
        }
    }, [appointment, doctorId]);

    useEffect(() => {
        if (date && availability && doctorId) {
            const selectedDate = new Date(date);
            const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
            const day = daysOfWeek[selectedDate.getDay()];
            const dayAvailability = availability[day];

            if (dayAvailability) {
                // Fetch the booked slots count for the selected date and doctor
                axios
                    .get(`${ip.address}/api/appointments/doctor/${doctorId}/count?date=${date}`)
                    .then((response) => {
                        const { morning, afternoon } = response.data;

                        // Calculate the booked count for morning and afternoon
                        const morningBookedCount = morning;
                        const afternoonBookedCount = afternoon;

                        // Calculate available slots
                        let morningAvailableSlots = 0;
                        let afternoonAvailableSlots = 0;

                        const formatTimeRange = (startTime, endTime) => {
                            const formatTime = (timeStr) => {
                                const [hours, minutes] = timeStr.split(":");
                                const time = new Date();
                                time.setHours(hours);
                                time.setMinutes(minutes);
                                return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
                            };
                            return `${formatTime(startTime)} - ${formatTime(endTime)}`;
                        };

                        if (dayAvailability.morning?.available) {
                            const { startTime, endTime, maxPatients } = dayAvailability.morning;
                            setMorningTimeRange(formatTimeRange(startTime, endTime));
                            morningAvailableSlots = maxPatients - morningBookedCount;
                        } else {
                            setMorningTimeRange("");
                        }

                        if (dayAvailability.afternoon?.available) {
                            const { startTime, endTime, maxPatients } = dayAvailability.afternoon;
                            setAfternoonTimeRange(formatTimeRange(startTime, endTime));
                            afternoonAvailableSlots = maxPatients - afternoonBookedCount;
                        } else {
                            setAfternoonTimeRange("");
                        }

                        setAvailableSlots({ morning: morningAvailableSlots, afternoon: afternoonAvailableSlots });
                    })
                    .catch((err) => {
                        console.error(err);
                        setAvailableSlots({ morning: 0, afternoon: 0 });
                    });
            } else {
                setMorningTimeRange("");
                setAfternoonTimeRange("");
                setAvailableSlots({ morning: 0, afternoon: 0 });
            }
        } else {
            setMorningTimeRange("");
            setAfternoonTimeRange("");
            setAvailableSlots({ morning: 0, afternoon: 0 });
        }
    }, [date, availability, doctorId]);

    const handleSubmit = () => {
        if (!date || !time) {
            alert('Please select a date and time.');
            return;
        }

        const [startTime, endTime] = time.split(' - ').map(convertTo24HourFormat);

        const followUpData = {
            doctor: doctorId,
            date,
            time: `${startTime} - ${endTime}`, // Store in 24-hour format
            reason,
            appointment_type: appointment.appointment_type,
        };

        // Create the follow-up appointment
        axios.post(`${ip.address}/api/appointments/${appointment._id}/schedulefollowup`, followUpData)
            .then((response) => {
                const newAppointment = response.data;

                // Decrement available slot count in backend
                axios
                    .post(`${ip.address}/api/doctor/${doctorId}/update-available-slots`, { date, time })
                    .then(() => {
                        // Update available slots locally by mimicking the AppointmentForm logic
                        const updatedSlots = { ...availableSlots };
                        const timePeriod = time.includes("AM") ? "morning" : "afternoon";
                        updatedSlots[timePeriod] -= 1;
                        setAvailableSlots(updatedSlots);

                        alert('Follow-up appointment scheduled successfully.');
                        handleClose();
                    })
                    .catch((err) => {
                        console.error("Error updating available slots in backend", err);
                        alert("Failed to update available slots.");
                    });
            })
            .catch((error) => {
                console.error('Error scheduling follow-up appointment:', error.response ? error.response.data : error.message);
                alert('Failed to schedule follow-up appointment.');
            });
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Schedule Follow-Up Appointment</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
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
                    <Form.Group as={Col} className="mb-3">
                        <Form.Label>Time</Form.Label>
                        {morningTimeRange && availableSlots.morning > 0 && (
                            <Button
                                variant={time === morningTimeRange ? "secondary" : "outline-primary"}
                                onClick={() => setTime(morningTimeRange)}
                                className="m-1"
                            >
                                Morning: {morningTimeRange} <br />
                                Slots left: {availableSlots.morning}
                            </Button>
                        )}
                        {afternoonTimeRange && availableSlots.afternoon > 0 && (
                            <Button
                                variant={time === afternoonTimeRange ? "secondary" : "outline-primary"}
                                onClick={() => setTime(afternoonTimeRange)}
                                className="m-1"
                            >
                                Afternoon: {afternoonTimeRange} <br />
                                Slots left: {availableSlots.afternoon}
                            </Button>
                        )}
                        {((!morningTimeRange || availableSlots.morning <= 0) && (!afternoonTimeRange || availableSlots.afternoon <= 0)) && (
                            <Form.Control
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                required
                            />
                        )}
                    </Form.Group>
                    <Form.Group as={Col} className="mb-3">
                        <Form.Label>Primary Concern</Form.Label>
                        <Form.Control
                            as="textarea"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    Schedule
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default FollowUpModal;
