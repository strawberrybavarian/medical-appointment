import axios from "axios";
import { useState, useEffect } from "react";
import { Row, Col, Button, Form, Modal } from 'react-bootstrap';
import Select from 'react-select';
import { ip } from "../../../../../ContentExport";

function AssignAppointmentModal({ show, handleClose, appointmentId }) {
    const [doctors, setDoctors] = useState([]);
    const [services, setServices] = useState([]); // Store available services
    const [selectedService, setSelectedService] = useState(null); // Store selected service
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [doctorName, setDoctorName] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState(""); // Store time in AM/PM format
    const [availability, setAvailability] = useState({});
    const [morningTimeRange, setMorningTimeRange] = useState("");
    const [afternoonTimeRange, setAfternoonTimeRange] = useState("");

    // Fetch all doctors
    useEffect(() => {
        axios.get(`${ip.address}/api/doctor/api/alldoctor`)
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

    // Fetch doctor's availability and services based on the selected doctor
    useEffect(() => {
        if (selectedDoctor) {
            axios.get(`${ip.address}/api/doctor/${selectedDoctor.value}`)
                .then((response) => {
                    const doctor = response.data.doctor;
                    setDoctorName(`${doctor.dr_firstName} ${doctor.dr_middleInitial}. ${doctor.dr_lastName}`);
                    setAvailability(doctor.availability || {});
                    setServices(doctor.dr_services || []); // Fetch only doctor's specific services
                })
                .catch((err) => {
                    console.log(err);
                });
        } else {
            // Fetch all services if no doctor is selected
            axios.get(`${ip.address}/api/admin/getall/services`)
                .then((response) => {
                    setServices(response.data); // Fetch all available services
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [selectedDoctor]);

    // Fetch existing appointment details when the modal is opened
    useEffect(() => {
        if (show && appointmentId) {
            axios.get(`${ip.address}/api/appointments/${appointmentId}`)
                .then((response) => {
                    const appointment = response.data;

                    // Pre-fill the form fields with appointment details
                    if (appointment.doctor) {
                        setSelectedDoctor({
                            value: appointment.doctor._id,
                            label: `${appointment.doctor.dr_firstName} ${appointment.doctor.dr_middleInitial}. ${appointment.doctor.dr_lastName}`
                        });
                    }
                    if (appointment.appointment_type) {
                        setSelectedService({
                            value: appointment.appointment_type._id,
                            label: appointment.appointment_type.appointment_type,
                            category: appointment.appointment_type.category
                        });
                    }
                    if (appointment.date) {
                        setDate(new Date(appointment.date).toISOString().split('T')[0]); // Format date for the input
                    }
                    if (appointment.time) {
                        setTime(appointment.time); // Assuming time is in AM/PM format
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [show, appointmentId]);

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

    // Function to handle time selection and directly set AM/PM formatted time
    const handleTimeSelection = (selectedTime) => {
        setTime(selectedTime); // Save time directly in AM/PM format
    };

    // Handle appointment update
    const updateAppointment = () => {
        if (selectedDoctor && !selectedDoctor.value) {
            window.alert("Please select a valid doctor.");
            return;
        }

        if (!date || !time || !selectedService) {
            window.alert("Please select a valid date, time, and service.");
            return;
        }

        const appointmentType = {
            appointment_type: selectedService.label,
            category: selectedService.category || 'General'
        };

        const formData = {
            doctor: selectedDoctor ? selectedDoctor.value : null,
            appointment_type: appointmentType,
            date,
            time,
        };

        axios.put(`${ip.address}/api/appointments/${appointmentId}/assign`, formData)
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
            
                <Modal.Header className="am-header" closeButton>
                    <Modal.Title>Assign Appointment</Modal.Title>
                </Modal.Header>
                <Modal.Body className="w-100">
                    {/* Doctor Selection with react-select */}
                    <Form.Group as={Col} className="mb-3">
                        <Form.Label>Select Doctor</Form.Label>
                        <Select
                          options={doctors}
                          value={selectedDoctor}
                          onChange={(selected) => {
                              setSelectedDoctor(selected);
                              if (!selected) {
                                  setSelectedService(null);
                                  setDoctorName("");
                                  setDate("");
                                  setTime("");
                                  setAvailability({});
                                  setMorningTimeRange("");
                                  setAfternoonTimeRange("");
                              }
                          }}
                          placeholder="Search for a doctor"
                          isClearable={true}
                      />
                    </Form.Group>

                    {/* Service Selection with react-select */}
                    <Form.Group as={Col} className="mb-3">
                        <Form.Label>Select Service</Form.Label>
                        <Select
                          options={services.map(service => ({
                              value: service._id,
                              label: service.name,
                              category: service.category  // Assuming the category field is available
                          }))}
                          value={selectedService}
                          onChange={(selected) => setSelectedService(selected)}
                          placeholder="Select a service"
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
                                onClick={() => handleTimeSelection(morningTimeRange)}
                                className="m-1"
                            >
                                Morning: {morningTimeRange}
                            </Button>
                        )}
                        {afternoonTimeRange && (
                            <Button
                                variant={time === afternoonTimeRange ? "secondary" : "outline-primary"}
                                onClick={() => handleTimeSelection(afternoonTimeRange)}
                                className="m-1"
                            >
                                Afternoon: {afternoonTimeRange}
                            </Button>
                        )}
                        {!morningTimeRange && !afternoonTimeRange && (
                            <Form.Control
                                type="time"
                                value={time}
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
          
        </Modal>
    );
}

export default AssignAppointmentModal;
