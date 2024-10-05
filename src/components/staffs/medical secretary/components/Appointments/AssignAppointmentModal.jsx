import axios from "axios";
import { useState, useEffect } from "react";
import { Row, Col, Button, Form, Modal } from 'react-bootstrap';
import Select from 'react-select';

function AssignAppointmentModal({ show, handleClose, appointmentId }) {
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [doctorName, setDoctorName] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState(""); // Store time in HH:mm format
    const [availability, setAvailability] = useState({});
    const [morningTimeRange, setMorningTimeRange] = useState("");
    const [afternoonTimeRange, setAfternoonTimeRange] = useState("");

    // Fetch all doctors
    useEffect(() => {
        axios.get(`http://localhost:8000/doctor/api/alldoctor`)
            .then((response) => {
                const doctorOptions = response.data.theDoctor.map((doctor) => ({
                    value: doctor._id,
                    label: `${doctor.dr_firstName} ${doctor.dr_middleInitial}. ${doctor.dr_lastName}`,
                }));
                setDoctors(doctorOptions);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    // Fetch doctor's availability based on the selected doctor
    useEffect(() => {
        if (selectedDoctor) {
            axios.get(`http://localhost:8000/doctor/${selectedDoctor.value}`)
                .then((response) => {
                    const doctor = response.data.doctor;
                    setDoctorName(`${doctor.dr_firstName} ${doctor.dr_middleInitial}. ${doctor.dr_lastName}`);
                    setAvailability(doctor.availability || {});
                })
                .catch((err) => {
                    console.log(err);
                });
        } else {
            setDoctorName('No Doctor Selected');
            setAvailability({});
            setMorningTimeRange("");
            setAfternoonTimeRange("");
        }
    }, [selectedDoctor]);

    // Function to generate time range in 12-hour format with AM/PM for display
    const generateTimeRange = (start, end) => {
        const startTime = new Date(`1970-01-01T${start}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        const endTime = new Date(`1970-01-01T${end}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        return `${startTime} - ${endTime}`;
    };

    // Update available time slots based on selected date
    useEffect(() => {
        if (date) {
            const selectedDate = new Date(date);
            const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
            const day = daysOfWeek[selectedDate.getDay()];

            if (availability[day]) {
                const dayAvailability = availability[day];
                if (dayAvailability.morning?.available) {
                    setMorningTimeRange(generateTimeRange(dayAvailability.morning.startTime, dayAvailability.morning.endTime));
                } else {
                    setMorningTimeRange("");
                }

                if (dayAvailability.afternoon?.available) {
                    setAfternoonTimeRange(generateTimeRange(dayAvailability.afternoon.startTime, dayAvailability.afternoon.endTime));
                } else {
                    setAfternoonTimeRange("");
                }
            }
        } else {
            setMorningTimeRange("");
            setAfternoonTimeRange("");
        }
    }, [date, availability]);

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const todayDate = getTodayDate();

    // Function to convert 12-hour format to 24-hour format
    const convertTo24HourFormat = (time12h) => {
        const [time, modifier] = time12h.split(' '); // Split time and AM/PM
        let [hours, minutes] = time.split(':');

        if (hours === '12') {
            hours = '00'; // Handle 12 AM as 00
        }

        if (modifier === 'PM' && hours !== '12') {
            hours = parseInt(hours, 10) + 12; // Add 12 to convert to 24-hour format for PM times
        }

        return `${hours.padStart(2, '0')}:${minutes}`; // Return 24-hour formatted time
    };

    // Convert 24-hour format to 12-hour format (for display)
    const convertTo12HourFormat = (time24h) => {
        const [hours, minutes] = time24h.split(':');
        const period = hours >= 12 ? 'PM' : 'AM';
        const hour12 = hours % 12 || 12; // Convert to 12-hour format
        return `${hour12}:${minutes} ${period}`;
    };

    // Handle appointment update
    const updateAppointment = () => {
        if (selectedDoctor && !selectedDoctor.value) {
            window.alert("Please select a valid doctor.");
            return;
        }

        if (!date || !time) {
            window.alert("Please select a valid date and time.");
            return;
        }

        const formData = {
            doctor: selectedDoctor ? selectedDoctor.value : null,
            date,
            time: convertTo24HourFormat(time), // Store in 24-hour format
        };

        axios.put(`http://localhost:8000/appointments/${appointmentId}/assign`, formData)
            .then(() => {
                window.alert("Appointment updated successfully!");
                window.location.reload();
            })
            .catch((err) => {
                if (err.response) {
                    console.log(err.response.data);
                    window.alert(`Error: ${err.response.data.message}`);
                } else {
                    console.log(err);
                    window.alert('An error occurred while updating the appointment.');
                }
            });
    };

    return (
        <Modal show={show} onHide={handleClose} className='am-overlay'>
            <div className="am-content">
                <Modal.Header className="am-header" closeButton>
                    <Modal.Title>Assign Appointment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* Doctor Selection with react-select */}
                    <Form.Group as={Col} className="mb-3">
                        <Form.Label>Select Doctor</Form.Label>
                        <Select
                            options={doctors}
                            value={selectedDoctor}
                            onChange={(selected) => setSelectedDoctor(selected)}
                            placeholder="Search for a doctor"
                            isClearable={true}
                        />
                    </Form.Group>

                    {/* Date Selection */}
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

                    {/* Time Selection */}
                    <Form.Group as={Col} className="mb-3">
                        <Form.Label>Time</Form.Label>
                        {morningTimeRange && (
                            <Button
                                variant={time === morningTimeRange ? "secondary" : "outline-primary"}
                                onClick={() => setTime(morningTimeRange)}
                                className="m-1"
                            >
                                Morning: {morningTimeRange}
                            </Button>
                        )}
                        {afternoonTimeRange && (
                            <Button
                                variant={time === afternoonTimeRange ? "secondary" : "outline-primary"}
                                onClick={() => setTime(afternoonTimeRange)}
                                className="m-1"
                            >
                                Afternoon: {afternoonTimeRange}
                            </Button>
                        )}
                        {!morningTimeRange && !afternoonTimeRange && (
                            <Form.Control
                                type="time"
                                value={time} // Keep time in 24-hour format for input
                                onChange={(e) => setTime(e.target.value)}
                                placeholder="Enter time"
                                required
                            />
                        )}
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={updateAppointment}>
                        Submit
                    </Button>
                </Modal.Footer>
            </div>
        </Modal>
    );
}

export default AssignAppointmentModal;
