import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Card, Collapse, Container, Table } from 'react-bootstrap';
import moment from 'moment';
import { ip } from "../../../../ContentExport";

const LaboratoryHistory = ({ pid }) => {
    const [theLaboratory, setLaboratory] = useState([]);
    const [error, setError] = useState(null);
    const [openRecords, setOpenRecords] = useState({});

    const sortedLabResults = [...theLaboratory].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    useEffect(() => {
        axios.get(`${ip.address}/api/patient/api/onepatient/${pid}`)
            .then((res) => {
                console.log(res.data.thePatient.laboratoryResults);  // Log the entire response to understand its structure
                if (res.data && res.data.thePatient && Array.isArray(res.data.thePatient.laboratoryResults)) {
                    setLaboratory(res.data.thePatient.laboratoryResults);

                } else {
                    setLaboratory([]);

                }
            })
            .catch((err) => {
                console.log(err);
                setError('Failed to fetch laboratory results');
                setLaboratory([]);  // In case of error, set to empty array
            });
    }, [pid]);

    const toggleCollapse = (id) => {
        setOpenRecords((prevState) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };

    const handleViewPDF = (filePath) => {
        const fullUrl = `${ip.address}/${filePath}`;
        window.open(fullUrl, '_blank');  // Open PDF in new tab
    };
    
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
            {sortedLabResults.map((result) => (
                <Card key={result._id} className="mb-3">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                        <div>{moment(result.createdAt).format('MMMM Do YYYY, h:mm a')}</div>
                        <Button
                            variant="link"
                            onClick={() => toggleCollapse(result._id)}
                            className="link-collapse"
                        >
                            {openRecords[result._id] ? <span>&#8722;</span> : <span>&#43;</span>}
                        </Button>
                    </Card.Header>
                    <Collapse in={openRecords[result._id]}>
                        <Card.Body>
                           
                           

                           

                            <p><strong>File:</strong> {result.file?.filename || "No file uploaded"}</p>
                            {result.file && (

                                <>

                                    <Button
                                        variant="secondary"
                                        onClick={() => handleDownload(result.file.path, result.file.filename)}
                                    >
                                        Download Laboratory Result
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => handleViewPDF(result.file.path)} // Open the PDF in a new tab
                                    >
                                        View Laboratory Result
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

export default LaboratoryHistory;