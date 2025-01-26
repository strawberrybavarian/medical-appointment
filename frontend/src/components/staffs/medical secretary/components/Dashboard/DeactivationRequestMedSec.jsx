import React, { useEffect, useState } from 'react';
import { Container, Card } from 'react-bootstrap';
import DeactivationRequests from '../../../admin/appointment/doctors/DeactivationRequests';

const DeactivationRequestMedSec = () => {

    return (
        <>
             <Card className="shadow mb-4">
                <Card.Header className="py-3">
                    <h6 className="m-0 font-weight-bold text-primary">Appointment Deactivation Request</h6>
                </Card.Header>
                <Card.Body>
                    <Container>
                        <DeactivationRequests />
                    </Container>
                </Card.Body>
             </Card>
        </>
    )
}


export default DeactivationRequestMedSec;