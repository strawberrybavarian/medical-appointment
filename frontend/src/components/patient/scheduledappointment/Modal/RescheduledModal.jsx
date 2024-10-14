import { Modal, Button, Form } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ip } from '../../../../ContentExport';
const RescheduleModal = ({ show, handleClose, appointment, onSubmit }) => {
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [bookedTimes, setBookedTimes] = useState([]);
  const [availability, setAvailability] = useState({});
  const [error, setError] = useState('');
  
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const generateTimeIntervals = (start, end, interval) => {
    const times = [];
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    let currentTime = new Date(1970, 0, 1, startHour, startMinute);
    const endTime = new Date(1970, 0, 1, endHour, endMinute);

    while (currentTime <= endTime) {
      times.push(currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      currentTime = new Date(currentTime.getTime() + interval * 60000); // interval in minutes
    }

    return times;
  };

  const getAvailableTimes = (day) => {
    const dayAvailability = availability[day];
    if (!dayAvailability) return [];

    let times = [];
    if (dayAvailability.morning.available) {
      const morningTimes = generateTimeIntervals(
        dayAvailability.morning.startTime,
        dayAvailability.morning.endTime,
        dayAvailability.morning.interval || 30 // Ensure default interval is used if not present
      );
      times = times.concat(morningTimes);
    }
    if (dayAvailability.afternoon.available) {
      const afternoonTimes = generateTimeIntervals(
        dayAvailability.afternoon.startTime,
        dayAvailability.afternoon.endTime,
        dayAvailability.afternoon.interval || 30 // Ensure default interval is used if not present
      );
      times = times.concat(afternoonTimes);
    }
    return times;
  };

  useEffect(() => {
    if (appointment) {
      axios.get(`${ip.address}/api/doctor/${appointment.doctor._id}/available`)
        .then((response) => {
          console.log("Doctor availability fetched:", response.data);
          const { availability } = response.data;
          setAvailability(availability);
        })
        .catch((err) => {
          console.log(err.response.data);
        });
    }
  }, [appointment]);

  useEffect(() => {
    if (newDate) {
      const selectedDate = new Date(newDate);
      const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      const day = daysOfWeek[selectedDate.getDay()];

      const times = getAvailableTimes(day);
      setAvailableTimes(times);

      // Fetch already booked times for the selected date and doctor
      axios.get(`${ip.address}/api//doctor/${appointment.doctor._id}/booked-slots?date=${newDate}`)
        .then((response) => {
          const bookedSlots = response.data.bookedSlots;
          setBookedTimes(bookedSlots);
        })
        .catch((err) => {
          console.log(err.response.data);
        });
    } else {
      setAvailableTimes([]);
      setBookedTimes([]);
    }
  }, [newDate, appointment]);

  const handleSubmit = () => {
    if (!newDate || !newTime) {
      setError('Please select a date and time');
      return;
    }
    onSubmit(newDate, newTime);
  };

  const todayDate = getTodayDate();
  const availableSlots = availableTimes.length - bookedTimes.length;

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Reschedule Appointment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formNewDate">
            <Form.Label>New Date</Form.Label>
            <Form.Control 
              type="date" 
              value={newDate} 
              min={todayDate}
              onChange={(e) => setNewDate(e.target.value)} 
            />
          </Form.Group>
          {availableTimes.length > 0 ? (
            <>
              <Form.Group controlId="formNewTime">
                <Form.Label>New Time</Form.Label>
                <center>
                <div>
                  {availableTimes.map((timeSlot) => (
                    <Button
                      key={timeSlot}
                      variant="outline-primary"
                      onClick={() => setNewTime(timeSlot)}
                      disabled={bookedTimes.includes(timeSlot) || newTime === timeSlot}
                      className="m-1"
                    >
                      {timeSlot}
                    </Button>
                  ))}
                </div>
                </center>
                <center><h5>Slots Available: {availableSlots}</h5></center> 
              </Form.Group>
            </>
          ) : (
            <p>No available times for the selected date.</p>
          )}
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Close</Button>
        <Button variant="primary" onClick={handleSubmit}>Submit</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RescheduleModal;
