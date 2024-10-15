import React, { useState } from "react";
import { Card, Collapse, Button, Container } from "react-bootstrap";
import moment from "moment";
import axios from "axios";
import { ip } from "../../../../ContentExport";
import { FaDownload, FaEye } from "react-icons/fa"; // Importing icons from react-icons

const PatientLaboratory = ({ laboratoryResults }) => {
  const [openRecords, setOpenRecords] = useState({});

  // Sort the history by date in descending order (most recent first)
  const sortedLabResults = [...laboratoryResults].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  // Toggle the collapse for each record
  const toggleCollapse = (id) => {
    setOpenRecords((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const handleViewPDF = (filePath) => {
    const fullUrl = `${ip.address}/${filePath}`;
    window.open(fullUrl, "_blank"); // Open PDF in new tab
  };

  // Handle file download
  const handleDownload = async (filePath, fileName) => {
    try {
      const fullUrl = `${ip.address}/${filePath}`; // Ensure filePath starts with `/uploads/...`

      const response = await axios.get(fullUrl, {
        responseType: "blob", // Important for downloading binary files
      });

      // Create a new Blob object using the response data
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName); // Filename for the download
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };

  return (
    <Container>
      <h1 className="my-4">Patient Laboratory Results</h1>
      {sortedLabResults.map((result) => (
        <Card key={result._id} className="mb-3">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <div>{moment(result.createdAt).format("MMMM Do YYYY, h:mm a")}</div>
            <Button
              variant="link"
              onClick={() => toggleCollapse(result._id)}
              className="link-collapse"
            >
              {openRecords[result._id] ? (
                <span>&#8722;</span>
              ) : (
                <span>&#43;</span>
              )}
            </Button>
          </Card.Header>
          <Collapse in={openRecords[result._id]}>
            <Card.Body>
              <p>
                <strong>File:</strong>{" "}
                {result.file?.filename || "No file uploaded"}
              </p>
              {result.file && (
                <>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      handleDownload(result.file.path, result.file.filename)
                    }
                    className="me-2"
                  >
                    <FaDownload className="me-1" /> Download Laboratory Result
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleViewPDF(result.file.path)} // Open the PDF in a new tab
                  >
                    <FaEye className="me-1" /> View Laboratory Result
                  </Button>
                </>
              )}
            </Card.Body>
          </Collapse>
        </Card>
      ))}
    </Container>
  );
};

export default PatientLaboratory;
