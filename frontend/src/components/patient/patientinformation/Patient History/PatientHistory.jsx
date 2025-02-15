import React, { useState } from "react";
import { Card, Collapse, Button, Container, Pagination, Row, Col, Table } from "react-bootstrap";
import moment from "moment";
import { FaStethoscope, FaHeartbeat, FaTemperatureHigh } from 'react-icons/fa'; // Medical icons
import GeneratePDF from './GeneratePDF'; // Import the GeneratePDF component

const PatientHistory = ({ patientHistory }) => {
  const [openRecords, setOpenRecords] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const sortedHistory = [...patientHistory].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = sortedHistory.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(sortedHistory.length / recordsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const toggleCollapse = (id) => {
    setOpenRecords((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  return (
    <Container>
      <h1 className="my-4">Patient Medical History</h1>
      <Table bordered responsive striped variant="light" className="mt-3">
        <thead>
          <tr>
            <th>Date</th>
            <th>Doctor Attended</th>
            <th>Medical History</th>
            <th>Interpretation</th>
            <th>Assessment</th>
            <th>Recommendation</th>
            <th>Remarks</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentRecords.map((record) => {
            const doctorFullName = `${record.doctor.dr_firstName} ${record.doctor.dr_lastName}`;
            return (
              <tr key={record._id}>
                <td>{moment(record.createdAt).format("MMMM Do YYYY, h:mm a")}</td>
                <td>{doctorFullName}</td>
                <td>{record.historyOfPresentIllness.currentSymptoms.join(", ")}</td>
                <td>{record.interpretation}</td>
                <td>{record.assessment}</td>
                <td>{record.recommendations}</td>
                <td>{record.remarks}</td>
                <td>
                  <Button
                    variant="outline-primary"
                    onClick={() => toggleCollapse(record._id)} // Toggle collapse for each record
                  >
                    View Details
                  </Button>
                  <GeneratePDF record={record} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      {/* Expanded View for Allergies, Skin Conditions, Family History */}
      {currentRecords.map((record) => (
        <Collapse in={openRecords[record._id]} key={record._id}>
          <Card className="mt-3">
            <Card.Body>
              <Table bordered responsive striped variant="light">
                <thead>
                  <tr>
                    <th className="text-primary" colSpan={2}>Vitals</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Blood Pressure</td>
                    <td>{record.bloodPressure?.systole} / {record.bloodPressure?.diastole}</td>
                  </tr>
                  <tr>
                    <td><FaHeartbeat /> Pulse Rate</td>
                    <td>{record.pulseRate}</td>
                  </tr>
                  <tr>
                    <td>Temperature</td>
                    <td>{record.temperature}</td>
                  </tr>
                  <tr>
                    <td>Respiratory Rate</td>
                    <td>{record.respiratoryRate}</td>
                  </tr>
                  <tr>
                    <td>Weight</td>
                    <td>{record.weight}</td>
                  </tr>
                  <tr>
                    <td>Height</td>
                    <td>{record.height}</td>
                  </tr>
                </tbody>
              </Table>

              <Table bordered responsive striped variant="light">
                <thead>
                  <tr>
                    <th className="text-primary">Allergies</th>
                    <th className="text-primary">Skin Conditions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{record.allergy.length > 0 ? record.allergy.join(", ") : "No allergies"}</td>
                    <td>{record.skinCondition.length > 0 ? record.skinCondition.join(", ") : "No skin condition"}</td>
                  </tr>
                </tbody>
              </Table>

              <Table bordered responsive striped variant="light">
                <thead>
                  <tr>
                    <th className="text-primary">Family History</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{record.familyHistory.length > 0 ? record.familyHistory.map(item => `${item.relation}: ${item.condition}`).join(", ") : "No family history"}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Collapse>
      ))}

      {/* Pagination Controls */}
      <Pagination className="justify-content-center">
        <Pagination.Prev
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        />
        {Array.from({ length: totalPages }, (_, index) => (
          <Pagination.Item
            key={index + 1}
            active={index + 1 === currentPage}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        />
      </Pagination>
    </Container>
  );
};

export default PatientHistory;
