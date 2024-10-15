import React, { useState, useEffect } from 'react';
import { Container, Table, Pagination } from 'react-bootstrap';
import axios from 'axios';
import { ip } from '../../../../ContentExport'; // Import your IP or config

const AuditPatient = ({ pid }) => {
    const [patientData, setPatientData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [auditsPerPage] = useState(5); // Number of audits per page

    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                // Fetch patient data along with audits
                const res = await axios.get(`${ip.address}/api/patient/api/getaudit/${pid}`);
                setPatientData(res.data.thePatient);
                setLoading(false);
            } catch (err) {
                setError('Error fetching patient data');
                setLoading(false);
            }
        };

        fetchPatientData();
    }, [pid]);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    // Calculate the number of pages
    const indexOfLastAudit = currentPage * auditsPerPage;
    const indexOfFirstAudit = indexOfLastAudit - auditsPerPage;
    const currentAudits = patientData.audits.slice(indexOfFirstAudit, indexOfLastAudit);
    const totalPages = Math.ceil(patientData.audits.length / auditsPerPage);

    // Pagination logic
    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <Container className='p-5'>
            <h4>Your Activity Log</h4>
            <hr/>

            {/* Display audit logs */}
            {patientData.audits && patientData.audits.length > 0 ? (
                <>
                    <Table responsive striped variant="light" size="sm" className="mt-3">
                        <thead>
                            <tr>
                                <th>Action</th>
                                <th>Description</th>
                                <th>IP Address</th>
                                <th>User Agent</th>
                                <th>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentAudits.map((audit, index) => (
                                <tr key={index}>
                                    <td style={{fontSize: '12px'}}>{audit.action}</td>
                                    <td style={{fontSize: '12px'}}>{audit.description}</td>
                                    <td style={{fontSize: '12px'}}>{audit.ipAddress}</td>
                                    <td style={{fontSize: '12px'}}>{audit.userAgent}</td>
                                    <td style={{fontSize: '12px'}}>{new Date(audit.createdAt).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    {/* Pagination component */}
                    <Pagination>
                        <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                        <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                        {[...Array(totalPages)].map((_, pageIndex) => (
                            <Pagination.Item
                                key={pageIndex + 1}
                                active={pageIndex + 1 === currentPage}
                                onClick={() => handlePageChange(pageIndex + 1)}
                            >
                                {pageIndex + 1}
                            </Pagination.Item>
                        ))}
                        <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                        <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
                    </Pagination>
                </>
            ) : (
                <p>No audit logs available for this patient.</p>
            )}
        </Container>
    );
};

export default AuditPatient;
