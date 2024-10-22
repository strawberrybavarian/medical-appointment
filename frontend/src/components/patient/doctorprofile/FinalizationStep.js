import React from "react";
import { Container } from "react-bootstrap";

const FinalizationStep = ({ date, time, reason, formatTicketDate }) => {
  return (
    <Container>
      <h6>Step 2: Finalizing Information</h6>
      <div className="ticket-container">
        <div className="ticket-item">
          <div className="ticket-left">
            {date && (
              <Container className="pt-4">
                <p className="ticket-month">{formatTicketDate(date).month}</p>
                <h2 className="ticket-num">{formatTicketDate(date).day}</h2>
                <p className="ticket-month">{formatTicketDate(date).dayOfWeek}</p>
              </Container>
            )}
            <span className="ticket-up-border"></span>
            <span className="ticket-down-border"></span>
          </div>
          <div className="ticket-right">
            <Container>
              <p className="ticket-event">Appointment Details</p>
              <hr />
            </Container>

            <Container className="d-flex align-items-center m-0 pb-3">
              <div className="ticket-icon"><i className="fa fa-table"></i></div>
              <p className="m-0 px-2">
                {formatTicketDate(date).month} {formatTicketDate(date).day}, {formatTicketDate(date).year} <br /> {time}
              </p>
            </Container>

            <Container className="d-flex align-items-center m-0 pb-3">
              <div className="ticket-icon"><i className="fa fa-info-circle"></i></div>
              <p className="m-0 px-2">Primary Concern: {reason}</p>
            </Container>

            <div className="fix"></div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default FinalizationStep;
