import React from 'react';
import { Container, Table } from 'react-bootstrap';
import moment from 'moment';

const Immunization = ({ immunizations }) => {
    // Sort immunizations by date in descending order (recent first)
    const sortedImmunizations = [...immunizations].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return (
        <Container>
            <h1 className="my-4">Immunization Records</h1>
            {sortedImmunizations.length > 0 ? (
                <Table responsive striped  variant="light" className="mt-3">
                    <thead>
                        <tr>
                            <th>Date Administered</th>
                            <th>Vaccine Name</th>
                            <th>Administered By</th>
                            <th>Dose</th>
                            <th>Route</th>
                            <th>Site</th>
                            <th>Lot Number</th>
                            <th>Expiration Date</th>
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedImmunizations.map((immunization, index) => (
                            <tr key={immunization._id}>
                                <td>{moment(immunization.dateAdministered).format('MMMM DD, YYYY')}</td>
                                <td>{immunization.vaccineName}</td>
                                <td>{immunization.administeredBy}</td>
                                <td>{immunization.dose}</td>
                                <td>{immunization.route}</td>
                                <td>{immunization.site}</td>
                                <td>{immunization.lotNumber}</td>
                                <td>{moment(immunization.expirationDate).format('MMMM DD, YYYY')}</td>
                                <td>{immunization.remarks || 'No remarks available'}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            ) : (
                <p>No immunization records found.</p>
            )}
        </Container>
    );
};

export default Immunization;
