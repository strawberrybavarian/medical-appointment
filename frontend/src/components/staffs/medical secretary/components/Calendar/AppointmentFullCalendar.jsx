import React, { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import { Container, Card, Modal, Button, Badge, Row, Col, ListGroup } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { ip } from '../../../../../ContentExport';
import { CalendarCheck, Clock, Person, ClipboardCheck, ChevronRight } from 'react-bootstrap-icons';

function AppointmentFullCalendar() {
  const [allAppointments, setAllappointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateAppointments, setSelectedDateAppointments] = useState([]);
  const calendarRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { userId: msid, userName: name, role: roles } = location.state || {};

  const [headerToolbar, setHeaderToolbar] = useState({
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay',
  });

  useEffect(() => {
    axios
      .get(`${ip.address}/api/medicalsecretary/api/allappointments`)
      .then((result) => {
        setAllappointments(result.data.Appointments);
      })
      .catch((error) => {
        console.log(error);
      });

    // Handle window resize
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setHeaderToolbar({
          left: 'prev,next',
          center: 'title',
          right: 'today',
        });
      } else {
        setHeaderToolbar({
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  // Group appointments by date and create aggregated events
  const events = React.useMemo(() => {
    const eventsByDate = {};
    
    allAppointments.forEach(appointment => {
      const datePart = appointment.date.split('T')[0];
      
      if (!eventsByDate[datePart]) {
        eventsByDate[datePart] = {
          date: datePart,
          appointments: []
        };
      }
      
      eventsByDate[datePart].appointments.push(appointment);
    });
    
    return Object.values(eventsByDate).map(dateGroup => {
      // Count by status
      const statusCounts = dateGroup.appointments.reduce((counts, app) => {
        counts[app.status] = (counts[app.status] || 0) + 1;
        return counts;
      }, {});
      
      return {
        start: dateGroup.date,
        title: `${dateGroup.appointments.length} Patient${dateGroup.appointments.length > 1 ? 's' : ''}`,
        extendedProps: {
          appointments: dateGroup.appointments,
          statusCounts
        },
        classNames: ['appointment-count-event']
      };
    });
  }, [allAppointments]);

  const handleDateClick = (info) => {
    const clickedDate = info.dateStr;
    const dateAppointments = allAppointments.filter(appointment => 
      appointment.date.split('T')[0] === clickedDate
    );
    
    if (dateAppointments.length > 0) {
      setSelectedDate(clickedDate);
      setSelectedDateAppointments(dateAppointments);
      setShowModal(true);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const navigateToAppointmentTab = (status) => {
    let tab;
    if (status === 'Scheduled') {
      tab = 'todays';
    } else if (status === 'Ongoing') {
      tab = 'ongoing';
    } else if (status === 'Pending') {
      tab = 'pending';
    } else if (status === 'Completed') {
      tab = 'completed';
    } else if (status === 'Cancelled') {
      tab = 'cancelled';
    } else if (status === 'Rescheduled') {
      tab = 'rescheduled';
    }

    if (tab) {
      navigate(`/medsec/appointments?tab=${tab}`, {
        state: { userId: msid, userName: name, role: roles },
      });
    }
  };

  const convertTimeRangeTo12HourFormat = (timeRange) => {
    // Check if the timeRange is missing or empty
    if (!timeRange) return 'Not Assigned';

    const convertTo12Hour = (time) => {
        // Handle single time values like "10:00"
        if (!time) return '';

        let [hours, minutes] = time.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12; // Convert 0 or 12 to 12 in 12-hour format

        return `${hours}:${String(minutes).padStart(2, '0')} ${period}`;
    };

    // Handle both single times and ranges
    if (timeRange.includes(' - ')) {
        const [startTime, endTime] = timeRange.split(' - ');
        return `${convertTo12Hour(startTime)} - ${convertTo12Hour(endTime)}`;
    } else {
        return convertTo12Hour(timeRange); // Single time case
    }
};

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Pending':
        return <Badge bg="warning" text="dark">Pending</Badge>;
      case 'Scheduled':
        return <Badge bg="info">Scheduled</Badge>;
      case 'Ongoing':
        return <Badge bg="primary">Ongoing</Badge>;
      case 'Completed':
        return <Badge bg="success">Completed</Badge>;
      case 'Cancelled':
        return <Badge bg="danger">Cancelled</Badge>;
      case 'Rescheduled':
        return <Badge bg="secondary">Rescheduled</Badge>;
      default:
        return <Badge bg="light" text="dark">{status}</Badge>;
    }
  };

  return (
    <>
      <Card className="shadow mb-4">
        <Card.Header className="py-3 d-flex justify-content-between align-items-center bg-gradient-primary-to-secondary text-white">
          <h6 className="m-0 font-weight-bold">Appointment Calendar</h6>
        </Card.Header>
        <Card.Body>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={headerToolbar}
            height="auto"
            events={events}
            dateClick={handleDateClick}
            eventContent={(eventInfo) => {
              const { statusCounts, appointments } = eventInfo.event.extendedProps;
              
              return (
                <div className="calendar-event-content d-flex flex-column align-items-center">
                  <div className="appointment-count font-weight-bold">
                    {appointments.length}
                  </div>
                  <div className="appointment-label small">
                    {appointments.length === 1 ? 'Patient' : 'Patients'}
                  </div>
                  <div className="status-indicators d-flex mt-1 justify-content-center">
                    {statusCounts['Scheduled'] && (
                      <div className="status-dot scheduled-dot" title={`${statusCounts['Scheduled']} Scheduled`}></div>
                    )}
                    {statusCounts['Pending'] && (
                      <div className="status-dot pending-dot" title={`${statusCounts['Pending']} Pending`}></div>
                    )}
                    {statusCounts['Ongoing'] && (
                      <div className="status-dot ongoing-dot" title={`${statusCounts['Ongoing']} Ongoing`}></div>
                    )}
                    {statusCounts['Completed'] && (
                      <div className="status-dot completed-dot" title={`${statusCounts['Completed']} Completed`}></div>
                    )}
                  </div>
                </div>
              );
            }}
            eventClassNames={(arg) => {
              return ['calendar-event'];
            }}
          />
        </Card.Body>
      </Card>

      {/* Appointments Modal */}
      <Modal
        show={showModal}
        onHide={handleModalClose}
        size="lg"
        centered
        className="appointments-modal"
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <CalendarCheck className="me-2" />
            Appointments for {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {selectedDateAppointments.length > 0 ? (
            <ListGroup variant="flush">
              {selectedDateAppointments.map((appointment, index) => (
                <ListGroup.Item 
                  key={appointment._id}
                  className="appointment-item p-3 border-bottom"
                  action
                  onClick={() => navigateToAppointmentTab(appointment.status)}
                >
                  <Row className="align-items-center">
                    <Col xs={12} md={6} className="mb-2 mb-md-0">
                      <div className="d-flex align-items-center">
                        <div className="patient-icon me-3 rounded-circle bg-light p-2">
                          <Person size={22} className="text-primary" />
                        </div>
                        <div>
                          <h6 className="mb-0 fw-bold">
                            {appointment.patient?.patient_firstName} {appointment.patient?.patient_lastName}
                          </h6>
                          <div className="text-muted small">
                            Patient ID: {appointment.patient?.patient_ID || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </Col>
                    <Col xs={6} md={3}>
                      <div className="d-flex align-items-center mb-2">
                        <Clock size={16} className="text-muted me-2" />
                        <span>{convertTimeRangeTo12HourFormat (appointment.time)}</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <ClipboardCheck size={16} className="text-muted me-2" />
                        <span>{appointment.appointment_type?.[0]?.appointment_type || 'General'}</span>
                      </div>
                    </Col>
                    <Col xs={6} md={2} className="text-center">
                      {getStatusBadge(appointment.status)}
                    </Col>
                    <Col xs={12} md={1} className="text-end">
                      <ChevronRight className="text-muted" />
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <div className="text-center p-5">
              <p className="text-muted mb-0">No appointments for this date</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

    </>
  );
}

export default AppointmentFullCalendar;