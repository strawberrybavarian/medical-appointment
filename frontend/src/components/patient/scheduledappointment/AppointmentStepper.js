import React from 'react';
import './AppointmentStepper.css';
import {
  PeopleFill,
  ClockFill,
  PersonFill,
  PencilFill,
  CheckCircleFill,
  XCircleFill,
  CalendarCheckFill,
  CurrencyDollar,
  EnvelopePaperFill,
  HourglassSplit
} from 'react-bootstrap-icons';
import { Row, Col, Card, Badge } from 'react-bootstrap';

const statusSteps = [
  'Pending',
  'Scheduled',
  'Ongoing',
  'For Payment',
  'To-send',
  'Completed',
  'Rescheduled',
  'Cancelled',
];

// Icons for each status step
const statusIcons = {
  'Pending': <HourglassSplit className="step-icon" />,
  'Scheduled': <CalendarCheckFill className="step-icon" />,
  'Ongoing': <PeopleFill className="step-icon" />,
  'For Payment': <CurrencyDollar className="step-icon" />,
  'To-send': <EnvelopePaperFill className="step-icon" />,
  'Completed': <CheckCircleFill className="step-icon" />,
  'Rescheduled': <CalendarCheckFill className="step-icon" />,
  'Cancelled': <XCircleFill className="step-icon" />,
};

function AppointmentStepper({ currentStatus, latestAppointment }) {
  const activeStep = statusSteps.indexOf(currentStatus);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const dayOfWeek = date.toLocaleString('default', { weekday: 'short' });
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return `${dayOfWeek}, ${month} ${day}, ${year}`;
  };
  
  const getAppointmentType = () => {
    if (Array.isArray(latestAppointment.appointment_type)) {
      return latestAppointment.appointment_type[0]?.appointment_type || 'N/A';
    }
    return latestAppointment.appointment_type?.appointment_type || 'N/A';
  };
  
  const convertTimeRangeTo12HourFormat = (timeRange) => {
    if (!timeRange) return 'Not Assigned';
    const convertTo12Hour = (time) => {
      if (!time) return '';
      let [hours, minutes] = time.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${hours}:${String(minutes).padStart(2, '0')} ${period}`;
    };
    if (timeRange.includes(' - ')) {
      const [startTime, endTime] = timeRange.split(' - ');
      return `${convertTo12Hour(startTime)} - ${convertTo12Hour(endTime)}`;
    } else {
      return convertTo12Hour(timeRange);
    }
  };

  // Helper function to get status color
  const getStatusColor = (status, index, activeStep) => {
    if (index < activeStep) return "completed";
    if (index === activeStep) return "active";
    if (status === "Cancelled") return "cancelled";
    if (status === "Rescheduled") return "rescheduled";
    return "pending";
  };
  
  // Get appropriate background gradient based on appointment status
  const getStatusGradient = () => {
    if (currentStatus === "Cancelled") {
      return "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)";
    } else if (currentStatus === "Completed") {
      return "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)";
    } else if (currentStatus === "Ongoing") {
      return "linear-gradient(135deg, #f6d365 0%, #fda085 100%)";
    } else if (currentStatus === "Rescheduled") {
      return "linear-gradient(135deg, #f6d365 0%, #fda085 100%)";
    } else {
      return "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)";
    }
  };
  
  // Get appropriate main color for appointment elements
  const getStatusMainColor = () => {
    if (currentStatus === "Cancelled") return "#dc3545";
    if (currentStatus === "Completed") return "#28a745";
    if (currentStatus === "Ongoing") return "#fd7e14";
    if (currentStatus === "Rescheduled") return "#ffc107";
    return "#007bff";
  };

  return (
    <div className="stepper-container horizontal">
      <div className="stepper-header">
        <h4 className="mb-3">Appointment Progress</h4>
        <Badge 
          bg={
            currentStatus === "Cancelled" ? "danger" :
            currentStatus === "Completed" ? "success" :
            currentStatus === "Ongoing" ? "warning" :
            "primary"
          } 
          pill 
          className="status-badge mb-3"
        >
          {currentStatus}
        </Badge>
      </div>
      
      <div className="stepper-timeline-horizontal">
        {statusSteps.map((status, index) => {
          const statusClass = getStatusColor(status, index, activeStep);
          return (
            <div
              key={index}
              className={`step-item-horizontal ${statusClass}`}
            >
              <div className="step-marker-horizontal">
                <div className="step-circle">
                  {statusIcons[status]}
                </div>
                {index < statusSteps.length - 1 && <div className="step-line-horizontal" />}
              </div>
              <div className="step-content-horizontal">
                <div className={`step-label ${statusClass}`}>{status}</div>
              </div>
            </div>
          );
        })}
      </div>

      {activeStep >= 0 && latestAppointment && (
        <div className="appointment-details-container mt-4">
          <div className="appointment-details-card">
            <div className="appointment-card-header" style={{background: getStatusGradient()}}>
              <h5 className="appointment-header-title">Active Appointment Details</h5>
              <Badge 
                pill 
                className="appointment-id-badge"
              >
                ID: {latestAppointment.appointment_ID}
              </Badge>
            </div>
            
            <div className="appointment-card-body">
              <Row className="appointment-info">
                <Col md={6} className="mb-4">
                  <div className="info-item">
                    <div className="info-icon" style={{color: getStatusMainColor()}}>
                      <CalendarCheckFill />
                    </div>
                    <div className="info-content">
                      <div className="info-label">Date</div>
                      <div className="info-value">{formatDate(latestAppointment.date)}</div>
                    </div>
                  </div>
                </Col>
                <Col md={6} className="mb-4">
                  <div className="info-item">
                    <div className="info-icon" style={{color: getStatusMainColor()}}>
                      <ClockFill />
                    </div>
                    <div className="info-content">
                      <div className="info-label">Time</div>
                      <div className="info-value">
                        {latestAppointment.time ? 
                          convertTimeRangeTo12HourFormat(latestAppointment.time) : 
                          'Not Assigned'}
                      </div>
                    </div>
                  </div>
                </Col>
                <Col md={6} className="mb-4">
                  <div className="info-item">
                    <div className="info-icon" style={{color: getStatusMainColor()}}>
                      <PersonFill />
                    </div>
                    <div className="info-content">
                      <div className="info-label">Doctor</div>
                      <div className="info-value">
                        {latestAppointment.doctor
                          ? `Dr. ${latestAppointment.doctor.dr_firstName} ${latestAppointment.doctor.dr_middleInitial ? latestAppointment.doctor.dr_middleInitial + '.' : ''} ${latestAppointment.doctor.dr_lastName}`
                          : 'Not assigned yet'}
                      </div>
                    </div>
                  </div>
                </Col>
                <Col md={6} className="mb-4">
                  <div className="info-item">
                    <div className="info-icon" style={{color: getStatusMainColor()}}>
                      <PencilFill />
                    </div>
                    <div className="info-content">
                      <div className="info-label">Appointment Type</div>
                      <div className="info-value">{getAppointmentType()}</div>
                    </div>
                  </div>
                </Col>
              </Row>
              
              <div className="follow-up-container">
                <Badge 
                  bg={latestAppointment.followUp ? "info" : "secondary"}
                  className="follow-up-badge"
                >
                  {latestAppointment.followUp ? 'Follow-up Required' : 'No Follow-up'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .appointment-details-container {
          width: 100%;
        }
        
        .appointment-details-card {
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          background: white;
          transition: all 0.3s ease;
          border: none;
          position: relative;
        }
        
        .appointment-details-card:hover {
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
          transform: translateY(-5px);
        }
        
        .appointment-card-header {
          padding: 20px 25px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: white;
          position: relative;
          overflow: hidden;
        }
        
        .appointment-card-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.1);
          transform: skewX(-20deg) translateX(-70%);
          transition: transform 0.5s ease;
        }
        
        .appointment-details-card:hover .appointment-card-header::before {
          transform: skewX(-20deg) translateX(170%);
        }
        
        .appointment-header-title {
          margin: 0;
          font-weight: 600;
          font-size: 1.25rem;
          z-index: 1;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
        }
        
        .appointment-id-badge {
          background: rgba(255, 255, 255, 0.25);
          color: white;
          font-weight: 500;
          padding: 8px 16px;
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          z-index: 1;
          font-size: 0.85rem;
        }
        
        .appointment-card-body {
          padding: 25px;
        }
        
        .info-item {
          display: flex;
          align-items: flex-start;
          padding: 10px 15px;
          background: #f8f9fa;
          border-radius: 12px;
          transition: all 0.2s ease;
          height: 100%;
        }
        
        .info-item:hover {
          background: #f0f0f0;
          transform: translateY(-2px);
        }
        
        .info-icon {
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border-radius: 12px;
          margin-right: 15px;
          font-size: 1.25rem;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          flex-shrink: 0;
        }
        
        .info-content {
          flex: 1;
        }
        
        .info-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #6c757d;
          margin-bottom: 4px;
          font-weight: 600;
        }
        
        .info-value {
          font-weight: 600;
          font-size: 1rem;
          color: #343a40;
          line-height: 1.4;
          word-break: break-word;
        }
        
        .follow-up-container {
          display: flex;
          justify-content: flex-end;
          margin-top: 10px;
        }
        
        .follow-up-badge {
          padding: 8px 16px;
          font-weight: 500;
          font-size: 0.9rem;
          border-radius: 30px;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
        }
        
        @media (max-width: 767px) {
          .appointment-card-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .appointment-id-badge {
            margin-top: 10px;
            align-self: flex-start;
          }
          
          .info-item {
            margin-bottom: 15px;
          }
        }
      `}</style>
    </div>
  );
}

export default AppointmentStepper;