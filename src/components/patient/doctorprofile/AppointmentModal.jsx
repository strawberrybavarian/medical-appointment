import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Form, Modal } from 'react-bootstrap';
import axios from "axios";
import { useState, useEffect } from "react";
import './DoctorProfile.css';

function AppointmentModal({ show, handleClose, pid, did, doctorName }) {
    const navigate = useNavigate();
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [reason, setReason] = useState("");
    const [medium, setMedium] = useState("Online");
    const [payment, setPayment] = useState("Cash");
    const [proofOfPayment, setProofOfPayment] = useState(null); // New state for file upload
    const [availableTimes, setAvailableTimes] = useState([]);
    const [bookedTimes, setBookedTimes] = useState([]);
    const [availability, setAvailability] = useState({});
    const [activeAppointmentStatus, setActiveAppointmentStatus] = useState(true);
    const [totalAvailableSlots, setTotalAvailableSlots] = useState(0);

    // Handle file upload change
    const handleFileChange = (e) => {
        setProofOfPayment(e.target.files[0]);
    };

    // Function to create an appointment
// Function to create an appointment
const createAppointment = () => {
    if (!time) {
        window.alert("Please select a valid time for the appointment.");
        return;
    }

    // Ensure proof of payment is uploaded if required
    if ((payment === "GCash" || payment === "Bank Transfer") && !proofOfPayment) {
        window.alert("Please upload proof of payment.");
        return;
    }

    // Use FormData if there is an image to upload
    const formData = new FormData();
    formData.append("doctorId", did);
    formData.append("date", date);
    formData.append("time", time);
    formData.append("reason", reason);
    formData.append("medium", medium);
    formData.append("paymentMethod", payment); // Update field name to paymentMethod
    if (proofOfPayment) {
        formData.append("proofOfPayment", proofOfPayment); 
    }

    axios.post(`http://localhost:8000/patient/api/${pid}/createappointment`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    .then((response) => {
        window.alert("Created an appointment!");
        window.location.reload()
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


    // Get today's date
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Generate time intervals for available slots
    const generateTimeIntervals = (start, end, interval) => {
        const times = [];
        const [startHour, startMinute] = start.split(':').map(Number);
        const [endHour, endMinute] = end.split(':').map(Number);
        let currentTime = new Date(1970, 0, 1, startHour, startMinute);
        const endTime = new Date(1970, 0, 1, endHour, endMinute);

        while (currentTime <= endTime) {
            times.push(currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            currentTime = new Date(currentTime.getTime() + interval * 60000); 
        }

        return times;
    };

    // Get available times for a given day
    const getAvailableTimes = (day) => {
        const dayAvailability = availability[day];
        if (!dayAvailability) return [];

        let times = [];
        if (dayAvailability.morning.available) {
            const morningTimes = generateTimeIntervals(
                dayAvailability.morning.startTime,
                dayAvailability.morning.endTime,
                dayAvailability.morning.interval || 30 
            );
            times = times.concat(morningTimes);
        }
        if (dayAvailability.afternoon.available) {
            const afternoonTimes = generateTimeIntervals(
                dayAvailability.afternoon.startTime,
                dayAvailability.afternoon.endTime,
                dayAvailability.afternoon.interval || 30 
            );
            times = times.concat(afternoonTimes);
        }
        return times;
    };

    // Fetch available times and booked slots when the date changes
    useEffect(() => {
        if (date) {
            const selectedDate = new Date(date);
            const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
            const day = daysOfWeek[selectedDate.getDay()];
            console.log(`Selected Date: ${date}, Day: ${day}`); 

            const times = getAvailableTimes(day);
            console.log(`Available Times for ${day}:`, times); 

            setAvailableTimes(times);
            setTotalAvailableSlots(times.length);

            // Fetch already booked times for the selected date and doctor
            axios.get(`http://localhost:8000/doctor/${did}/booked-slots?date=${date}`)
                .then((response) => {
                    const bookedSlots = response.data.bookedSlots;
                    console.log(`Booked Times for ${date}:`, bookedSlots); 
                    setBookedTimes(bookedSlots);
                })
                .catch((err) => {
                    console.log(err.response.data);
                });
        } else {
            setAvailableTimes([]);
            setBookedTimes([]);
            setTotalAvailableSlots(0);
        }
    }, [date, did, availability]);

    // Fetch doctor's availability when component mounts or when `did` changes
    useEffect(() => {
        axios.get(`http://localhost:8000/doctor/${did}/available`)
            .then((response) => {
                const { availability, activeAppointmentStatus } = response.data;
                console.log('Doctor Availability:', availability); 
                console.log('Active Appointment Status:', activeAppointmentStatus); 
                setAvailability(availability);
                setActiveAppointmentStatus(activeAppointmentStatus);
            })
            .catch((err) => {
                console.log(err.response.data);
            });
    }, [did]);

    const todayDate = getTodayDate();
    const availableSlots = totalAvailableSlots - bookedTimes.length;

    return (
        <Modal show={show} onHide={handleClose} className='am-overlay'>
            <div className="am-content">
                <Modal.Header className="am-header" closeButton>
                    <Modal.Title>Book Appointment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Your Doctor: {doctorName}</p>
                    {activeAppointmentStatus ? (
                        <Form>
                            <Row>
                                <Form.Group as={Col} className="mb-3">
                                    <Form.Label>Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        placeholder="Enter Date"
                                        min={todayDate}
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                </Form.Group>
                            </Row>
                            {availableTimes.length > 0 ? (
                                <>
                                    <Row>
                                        <Form.Group as={Col} className="mb-3">
                                            <Form.Label>Time</Form.Label>
                                            <center>
                                            <div>
                                                {availableTimes.map((timeSlot, index) => (
                                                    <Button
                                                        key={timeSlot}
                                                        variant="outline-primary"
                                                        onClick={() => setTime(timeSlot)}
                                                        disabled={bookedTimes.includes(timeSlot) || time === timeSlot}
                                                        className="m-1"
                                                    >
                                                        {timeSlot}
                                                    </Button>
                                                ))}
                                            </div>
                                            </center>
                                        </Form.Group>
                                        <center><h5>Slots Available: {availableSlots}</h5></center> 
                                    </Row>
                                    <Row>
                                        <Form.Group as={Col} className="mb-3">
                                            <Form.Label>Primary Concern</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                placeholder="Enter Reason"
                                                value={reason}
                                                onChange={(e) => setReason(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Row>
                                    <Row>
                                        <Form.Group as={Col} className="mb-3">
                                            <Form.Label>Medium</Form.Label>
                                            <Form.Check
                                                type="radio"
                                                label="Online"
                                                name="medium"
                                                checked={medium === "Online"}
                                                onChange={() => setMedium("Online")}
                                            />
                                            <Form.Check
                                                type="radio"
                                                label="Face to Face"
                                                name="medium"
                                                checked={medium === "Face to Face"}
                                                onChange={() => setMedium("Face to Face")}
                                            />
                                        </Form.Group>
                                    </Row>
                                    <Row>
                                        <Form.Group as={Col} className="mb-3">
                                            <Form.Label>Payment</Form.Label>
                                            <Form.Check
                                                type="radio"
                                                label="Cash"
                                                name="payment"
                                                checked={payment === "Cash"}
                                                onChange={() => setPayment("Cash")}
                                            />
                                            <Form.Check
                                                type="radio"
                                                label="GCash"
                                                name="payment"
                                                checked={payment === "GCash"}
                                                onChange={() => setPayment("GCash")}
                                            />
                                             <Form.Check
                                                type="radio"
                                                label="Bank Transfer"
                                                name="payment"
                                                checked={payment === "Bank Transfer"}
                                                onChange={() => setPayment("Bank Transfer")}
                                            />
                                        </Form.Group>
                                    </Row>
                                    {(payment === "GCash" || payment === "Bank Transfer") && (
                                        <Row>
                                            <Form.Group as={Col} className="mb-3">
                                                <Form.Label>Upload Proof of Payment</Form.Label>
                                                <Form.Control
                                                    type="file"
                                                    onChange={handleFileChange}
                                                    accept="image/jpeg,image/png"
                                                />
                                            </Form.Group>
                                        </Row>
                                    )}
                                </>
                            ) : (
                                <p>No available times for the selected date.</p>
                            )}
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
                        <Button onClick={createAppointment} variant="primary" type="button">
                            Submit
                        </Button>
                    )}
                </Modal.Footer>
            </div>
        </Modal>
    );
}

export default AppointmentModal;
