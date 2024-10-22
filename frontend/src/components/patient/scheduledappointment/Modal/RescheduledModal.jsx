import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Col } from 'react-bootstrap';
import Select from 'react-select';
import axios from 'axios';
import { ip } from '../../../../ContentExport';

function RescheduledModal({ show, handleClose, appointment }) {
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [availability, setAvailability] = useState({});
    const [morningTimeRange, setMorningTimeRange] = useState("");
    const [afternoonTimeRange, setAfternoonTimeRange] = useState("");
    const [bookedSlots, setBookedSlots] = useState({ morning: 0, afternoon: 0 });
    const [availableSlots, setAvailableSlots] = useState({ morning: 0, afternoon: 0 });

    // Function to format time
    const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(":");
        const time = new Date();
        time.setHours(hours);
        time.setMinutes(minutes);
        return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    // Handle time selection
    const handleTimeSelection = (selectedTime) => {
        setTime(selectedTime);
    };

    // Fetch all doctors
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await axios.get(`${ip.address}/api/doctor/api/alldoctor`);
                const doctorOptions = response.data.theDoctor.map((doctor) => ({
                    value: doctor._id,
                    label: `${doctor.dr_firstName} ${doctor.dr_middleInitial ? doctor.dr_middleInitial + '. ' : ''}${doctor.dr_lastName}`,
                }));
                setDoctors(doctorOptions);
            } catch (err) {
                console.error(err);
            }
        };

        fetchDoctors();
    }, []);

    // Fetch availability when a doctor is selected
    useEffect(() => {
        if (selectedDoctor) {
            axios.get(`${ip.address}/api/doctor/${selectedDoctor.value}`)
                .then(response => {
                    const doctor = response.data.doctor;
                    setAvailability(doctor.availability || {});
                })
                .catch(err => {
                    console.error(err);
                });
        } else {
            setAvailability({});
        }
    }, [selectedDoctor]);

    // Handle appointment details when the modal is opened
    useEffect(() => {
        if (show && appointment) {
            setSelectedDoctor({
                value: appointment.doctor._id,
                label: `${appointment.doctor.dr_firstName} ${appointment.doctor.dr_middleInitial ? appointment.doctor.dr_middleInitial + '. ' : ''}${appointment.doctor.dr_lastName}`
            });
            setDate(new Date(appointment.date).toISOString().split('T')[0]);
            setTime(appointment.time);
        }
    }, [show, appointment]);

    // Update available time slots based on selected date and doctor's availability
    useEffect(() => {
        if (date && availability && selectedDoctor) {
            const selectedDate = new Date(date);
            const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
            const day = daysOfWeek[selectedDate.getDay()];
            const dayAvailability = availability[day];

            if (dayAvailability) {
                setMorningTimeRange(dayAvailability.morning?.available ? `${formatTime(dayAvailability.morning.startTime)} - ${formatTime(dayAvailability.morning.endTime)}` : "");
                setAfternoonTimeRange(dayAvailability.afternoon?.available ? `${formatTime(dayAvailability.afternoon.startTime)} - ${formatTime(dayAvailability.afternoon.endTime)}` : "");

                // Fetch booked slots for the selected date and doctor
                axios
                    .get(`${ip.address}/api/doctor/${selectedDoctor.value}/booked-slots?date=${date}`)
                    .then((response) => {
                        const bookedTimes = response.data.bookedSlots || [];

                        // Count morning and afternoon bookings
                        const morningBookedCount = bookedTimes.filter((time) => {
                            const hour = parseInt(time.split(':')[0], 10);
                            return hour < 12;
                        }).length;

                        const afternoonBookedCount = bookedTimes.filter((time) => {
                            const hour = parseInt(time.split(':')[0], 10);
                            return hour >= 12;
                        }).length;

                        setBookedSlots({ morning: morningBookedCount, afternoon: afternoonBookedCount });

                        // Calculate available slots
                        let morningAvailableSlots = 0;
                        let afternoonAvailableSlots = 0;

                        if (dayAvailability.morning?.available) {
                            morningAvailableSlots = dayAvailability.morning.maxPatients - morningBookedCount;
                        }

                        if (dayAvailability.afternoon?.available) {
                            afternoonAvailableSlots = dayAvailability.afternoon.maxPatients - afternoonBookedCount;
                        }

                        setAvailableSlots({ morning: morningAvailableSlots, afternoon: afternoonAvailableSlots });
                    })
                    .catch((err) => {
                        console.error(err);
                        setBookedSlots({ morning: 0, afternoon: 0 });
                        setAvailableSlots({ morning: 0, afternoon: 0 });
                    });
            } else {
                setMorningTimeRange("");
                setAfternoonTimeRange("");
                setBookedSlots({ morning: 0, afternoon: 0 });
                setAvailableSlots({ morning: 0, afternoon: 0 });
            }
        } else {
            setMorningTimeRange("");
            setAfternoonTimeRange("");
            setBookedSlots({ morning: 0, afternoon: 0 });
            setAvailableSlots({ morning: 0, afternoon: 0 });
        }
    }, [date, availability, selectedDoctor]);

    const todayDate = new Date().toISOString().split('T')[0]; // Today's date for the minimum date selection

    // Submit the rescheduled appointment
    const handleRescheduleSubmit = () => {
        if (!selectedDoctor || !date || !time) {
            window.alert("Please fill all fields!");
            return;
        }

        // Determine the period based on the selected time
        let period = '';
        if (time === morningTimeRange) {
            period = 'morning';
            if (availableSlots.morning <= 0) {
                window.alert('No available slots for the selected morning period.');
                return;
            }
        } else if (time === afternoonTimeRange) {
            period = 'afternoon';
            if (availableSlots.afternoon <= 0) {
                window.alert('No available slots for the selected afternoon period.');
                return;
            }
        } else {
            // Custom time
            period = 'custom';
        }

        const rescheduleData = {
            doctor: selectedDoctor.value,
            date: date,
            time: time
        };

        axios.put(`${ip.address}/api/appointments/${appointment._id}/assign`, rescheduleData)
            .then((response) => {
                alert("Appointment successfully rescheduled!");

                // Decrease the available slots after successful rescheduling
                if (period === 'morning' || period === 'afternoon') {
                    setAvailableSlots(prevSlots => ({
                        ...prevSlots,
                        [period]: prevSlots[period] - 1
                    }));
                }

                handleClose();  // Close modal after successful submission
            })
            .catch((err) => {
                console.error(err);
                alert("Error occurred while rescheduling the appointment.");
            });
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Reschedule Appointment</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group as={Col} className="mb-3">
                    <Form.Label>Select Doctor</Form.Label>
                    <Select
                        options={doctors}
                        value={selectedDoctor}
                        onChange={setSelectedDoctor}
                        placeholder="Select a doctor"
                        isClearable
                    />
                </Form.Group>

                <Form.Group as={Col} className="mb-3">
                    <Form.Label>Date</Form.Label>
                    <Form.Control
                        type="date"
                        min={todayDate}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </Form.Group>

                <Form.Group as={Col} className="mb-3">
                    <Form.Label>Time</Form.Label>
                    {morningTimeRange && availableSlots.morning > 0 && (
                        <Button
                            variant={time === morningTimeRange ? "secondary" : "outline-primary"}
                            onClick={() => handleTimeSelection(morningTimeRange)}
                            className="m-1"
                        >
                            Morning: {morningTimeRange} <br />
                            Slots left: {availableSlots.morning}
                        </Button>
                    )}
                    {afternoonTimeRange && availableSlots.afternoon > 0 && (
                        <Button
                            variant={time === afternoonTimeRange ? "secondary" : "outline-primary"}
                            onClick={() => handleTimeSelection(afternoonTimeRange)}
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
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleRescheduleSubmit}>
                    Submit
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default RescheduledModal;
