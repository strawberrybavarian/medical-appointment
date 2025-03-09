import React, { useState, useEffect } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import Select from "react-select";
import axios from "axios";
import { ip } from "../../../../../ContentExport";

function AssignAppointmentModal({ show, handleClose, appointmentId }) {
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [availability, setAvailability] = useState({});
  const [morningTimeRange, setMorningTimeRange] = useState("");
  const [afternoonTimeRange, setAfternoonTimeRange] = useState("");
  const [bookedSlots, setBookedSlots] = useState({ morning: 0, afternoon: 0 });
  const [availableSlots, setAvailableSlots] = useState({ morning: 0, afternoon: 0 });
  const [servicesLoaded, setServicesLoaded] = useState(false);

  const todayDate = new Date().toISOString().split("T")[0];



  console.log('availability', availability)
  useEffect(() => {
    axios.get(`${ip.address}/api/doctor/api/alldoctor`)
      .then((res) => {
        const doctorOptions = res.data.theDoctor.map((doctor) => ({
          value: doctor._id,
          label: `${doctor.dr_firstName} ${doctor.dr_middleInitial}. ${doctor.dr_lastName}`,
        }));
        setDoctors(doctorOptions);
      });
  }, []);

  useEffect(() => {
    axios.get(`${ip.address}/api/admin/getall/services`)
      .then((res) => {
        const serviceOptions = res.data.map((service) => ({
          value: service._id,
          label: service.name,
          category: service.category, // Include category
        }));
        setAllServices(serviceOptions);
        setServices(serviceOptions);
        setServicesLoaded(true);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (show && appointmentId && servicesLoaded) {
      axios.get(`${ip.address}/api/appointments/${appointmentId}`)
        .then((res) => {
          const appointment = res.data;
          if (appointment.doctor) {
            setSelectedDoctor({
              value: appointment.doctor._id,
              label: `${appointment.doctor.dr_firstName} ${appointment.doctor.dr_middleInitial}. ${appointment.doctor.dr_lastName}`,
            });
          }
          if (appointment.appointment_type && appointment.appointment_type.length > 0) {
            const firstType = appointment.appointment_type[0];
            setSelectedService({
              value: firstType._id,
              label: firstType.appointment_type,
              category: firstType.category,
            });
          }
          setDate(appointment.date ? appointment.date.split('T')[0] : '');
          setTime(appointment.time);
        })
        .catch((err) => console.error(err));
    }
  }, [show, appointmentId, servicesLoaded]);


  useEffect(() => {
    if (selectedDoctor) {
      axios.get(`${ip.address}/api/doctor/${selectedDoctor.value}`)
        .then((res) => {
          setAvailability(res.data.doctor.availability);
          const doctorServices = res.data.doctor.dr_services.map((service) => ({
            value: service._id,
            label: service.name,
            category: service.category, // Include category
          }));
          const isSelectedServiceInDoctorServices = doctorServices.some(service => service.value === selectedService?.value);
          if (!isSelectedServiceInDoctorServices && selectedService) {
            doctorServices.push(selectedService);
          }
          setServices(doctorServices);
        });
    } else {
      setServices(allServices);
      setAvailability({});
      setMorningTimeRange("");
      setAfternoonTimeRange("");
    }
  }, [selectedDoctor, selectedService, allServices]);

  useEffect(() => {
    if (date && selectedDoctor) {
      const selectedDay = new Date(date).toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
      const availabilityDay = availability[selectedDay];

      axios.get(`${ip.address}/api/appointments/doctor/${selectedDoctor.value}/count?date=${date}`)
        .then((res) => {
          const { morning, afternoon } = res.data;
          setBookedSlots({ morning, afternoon });

          const morningSlots = availabilityDay?.morning?.maxPatients - morning;
          const afternoonSlots = availabilityDay?.afternoon?.maxPatients - afternoon;

          setAvailableSlots({
            morning: Math.max(morningSlots, 0),
            afternoon: Math.max(afternoonSlots, 0),
          });

          if (availabilityDay?.morning?.available) {
            setMorningTimeRange(generateTimeRange(availabilityDay.morning.startTime, availabilityDay.morning.endTime));
          }
          if (availabilityDay?.afternoon?.available) {
            setAfternoonTimeRange(generateTimeRange(availabilityDay.afternoon.startTime, availabilityDay.afternoon.endTime));
          }
        });
    } else {
      setMorningTimeRange("");
      setAfternoonTimeRange("");
    }
  }, [date, selectedDoctor, availability]);

  const generateTimeRange = (start, end) => {
    const startTime = new Date(`1970-01-01T${start}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const endTime = new Date(`1970-01-01T${end}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return `${startTime} - ${endTime}`;
  };

  const handleTimeSelection = (selectedTime) => {
    setTime(selectedTime);
  };

  const updateAppointment = () => {
    if (!selectedService || !date || !time) {
      window.alert("Please fill all required fields.");
      return;
    }

    const data = {
      doctor: selectedDoctor?.value || null,
      appointment_type: [
        {
          appointment_type: selectedService.label,
          category: selectedService.category,
        }
      ],
      date,
      time,
    };

    axios.put(`${ip.address}/api/appointments/${appointmentId}/assign`, data)
      .then(() => {
        window.alert("Appointment updated successfully.");
        handleClose();
        window.location.reload();
      })
      .catch((err) => console.error(err));
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header style={{ width: '100%' }} closeButton>
        <Modal.Title>Assign Appointment</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ width: '100%' }}>
        <Form.Group className="mb-3">
          <Form.Label>Select Doctor (Optional)</Form.Label>
          <Select
            options={doctors}
            value={selectedDoctor}
            onChange={(value) => setSelectedDoctor(value || null)}
            isClearable
            placeholder="Choose a doctor"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Select Service</Form.Label>
          <Select
            options={services}
            value={selectedService}
            onChange={(value) => setSelectedService(value || null)}
            isClearable
            placeholder="Choose a service"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Date</Form.Label>
          <Form.Control
            type="date"
            min={todayDate}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Form.Group>

        {date && (
          <Form.Group className="mb-3">
            <Form.Label>Time</Form.Label>
            {morningTimeRange && availableSlots.morning > 0 && (
              <Button
                variant={time === morningTimeRange ? "secondary" : "outline-primary"}
                onClick={() => handleTimeSelection(morningTimeRange)}
                className="m-1"
              >
                Morning: {morningTimeRange} (Slots left: {availableSlots.morning})
              </Button>
            )}
            {afternoonTimeRange && availableSlots.afternoon > 0 && (
              <Button
                variant={time === afternoonTimeRange ? "secondary" : "outline-primary"}
                onClick={() => handleTimeSelection(afternoonTimeRange)}
                className="m-1"
              >
                Afternoon: {afternoonTimeRange} (Slots left: {availableSlots.afternoon})
              </Button>
            )}
            {!morningTimeRange && !afternoonTimeRange && (
              <Form.Control
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-2"
              />
            )}
          </Form.Group>
        )}
      </Modal.Body>
      <Modal.Footer style={{ width: '100%' }}>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={updateAppointment}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AssignAppointmentModal;
