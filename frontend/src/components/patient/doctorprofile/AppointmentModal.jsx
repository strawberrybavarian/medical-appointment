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
    const [doctorServices, setDoctorServices] = useState([]); 
    const [selectedServices, setSelectedServices] = useState([]); 

    const doctorId = did;
    console.log(doctorId)
    // Reset modal state when the modal is closed or the doctor changes
    useEffect(() => {
        if (!show) {
            // Clear all states when the modal is closed
            setDate("");
            setTime("");
            setReason("");
            setAvailableTimes([]);
            setDoctorServices([]);
            setSelectedServices([]);
        }
    }, [show]);

    useEffect(() => {
        if (did) {
            // If a doctor ID is provided, fetch the doctor's specific services
            axios.get(`${ip.address}/api/api/doctor/${did}`)
                .then((response) => {
                    const doctor = response.data.doctor;
                    setDoctorServices(doctor.dr_services || []); 
                    setAvailability(doctor.availability || {});
                    setActiveAppointmentStatus(doctor.activeAppointmentStatus);
                })
                .catch((err) => {
                    console.log(err);
                });
        } else {
            // If no doctor ID, fetch all services
            axios.get(`${ip.address}/api/admin/getall/services`)
                .then((response) => {
                    setDoctorServices(response.data); 
                    setActiveAppointmentStatus(true); 
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [did]);

    const handleServiceChange = (service) => {
        setSelectedServices((prevSelected) => {
            const isSelected = prevSelected.some(s => s.appointment_type === service.name);
            
            if (isSelected) {
                return prevSelected.filter((s) => s.appointment_type !== service.name);
            } else {
                return [...prevSelected, { appointment_type: service.name, category: service.category }];
            }
        });
    };

    const createAppointment = () => {
        if (!date) {
            window.alert("Please select a valid date for the appointment.");
            return;
        }
    
        console.log("Doctor ID:", doctorId); // Check if doctorId is present
    
        const formData = {
            doctor: doctorId || null, // Ensure the doctor ID is included in the formData
            date,
            time: time || null,
            reason,
            appointment_type: selectedServices, 
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
    
    

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getAvailableTimes = (day) => {
        const dayAvailability = availability[day];
        if (!dayAvailability) return [];

        let times = [];
        if (dayAvailability.morning?.available) {
            const morningTime = `${new Date(`1970-01-01T${dayAvailability.morning.startTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(`1970-01-01T${dayAvailability.morning.endTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            times.push({ label: "Morning", timeRange: morningTime });
        }

        if (dayAvailability.afternoon?.available) {
            const afternoonTime = `${new Date(`1970-01-01T${dayAvailability.afternoon.startTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(`1970-01-01T${dayAvailability.afternoon.endTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            times.push({ label: "Afternoon", timeRange: afternoonTime });
        }

        return times;
    };

    useEffect(() => {
        if (date) {
            const selectedDate = new Date(date);
            const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
            const day = daysOfWeek[selectedDate.getDay()];
            setAvailableTimes(getAvailableTimes(day));
        } else {
            setAvailableTimes([]);
        }
    }, [date, did, availability]);

    const todayDate = getTodayDate();

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

                            {availableTimes.length > 0 && (
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
                                                    {timeSlot.label}: {timeSlot.timeRange}
                                                </Button>
                                            ))}
                                        </div>
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

                            <Row>
                                <Form.Group as={Col} className="mb-3">
                                    <Form.Label>Select Services (Appointment Type)</Form.Label>
                                    <div>
                                        {doctorServices.map(service => (
                                            <Form.Check
                                                key={service._id}
                                                type="checkbox"
                                                label={service.name}
                                                onChange={() => handleServiceChange(service)}
                                                checked={selectedServices.some(s => s.appointment_type === service.name)}
                                                disabled={service.availability === 'Not Available' || service.availability === 'Coming Soon'}
                                            />
                                        ))}
                                    </div>
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
