import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card } from 'react-bootstrap';
import { ip } from '../../../ContentExport';
import { useLocation } from 'react-router-dom';
const DoctorCalendar = ({did}) => {
  const [doctorAppointments, setDoctorAppointments] = useState([]);
  const calendarRef = useRef(null);
  // const location = useLocation();
  // const { pid, did } = location.state || {}; // Destructure pid and did from state
  useEffect(() => {
    // Fetch the doctor's appointments
    axios
      .get(`${ip.address}/doctor/${did}`)
      .then((res) => {
        const appointments = res.data.doctor.dr_appointments;
        setDoctorAppointments(appointments);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [did]);

  // Function to filter and group the appointments by date, counting only "Scheduled" and "Pending" statuses
  const getPatientCountsByDate = (appointments) => {
    const patientCountByDate = {};

    appointments.forEach((appointment) => {
      const status = appointment.status;
      const appointmentDate = appointment.date.split('T')[0];

      // Only count appointments that are either "Scheduled" or "Pending"
      if (status === 'Scheduled' || status === 'Pending') {
        if (patientCountByDate[appointmentDate]) {
          patientCountByDate[appointmentDate]++;
        } else {
          patientCountByDate[appointmentDate] = 1;
        }
      }
    });

    return patientCountByDate;
  };

  // Get the count of patients for each date
  const patientCountByDate = getPatientCountsByDate(doctorAppointments);

  // Create events for the calendar, one per date, showing the total patients
  const events = Object.keys(patientCountByDate).map((date) => ({
    title: `${patientCountByDate[date]} Patients`,
    start: date, // The date of the appointments
    allDay: true, // We don't need specific time here, just the date
  }));

  return (
    <div className="d-flex justify-content-between pt-3">
      <Card className="shadow mb-4 w-100">
        <Card.Header className="py-3">
          <h6 className="m-0 font-weight-bold text-primary">Doctor's Appointment Calendar</h6>
        </Card.Header>
        <Card.Body>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            height="auto"
            events={events} // Use the events generated from the doctor appointments
            editable={false}
            selectable={true}
            // Disable animations and transitions by ensuring no custom CSS or transitions are applied
          />
        </Card.Body>
      </Card>
    </div>
  );
};

export default DoctorCalendar;
