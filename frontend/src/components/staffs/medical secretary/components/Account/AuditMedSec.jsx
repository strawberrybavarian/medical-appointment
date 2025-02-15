import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Container, Form } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { ip } from '../../../../../ContentExport';

const CustomStyles = {
    rows: {
        style: {
          minHeight: '50px',
        },
      },
      headCells: {
        style: {
          backgroundColor: '#f5f5f5',
          fontWeight: 'bold',
        },
      },
      cells: {
        style: {
          padding: '8px',
        },
      },
    };
    


const AuditMedSec = ({msid}) => {

    const [medsecData, setMedsecData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    console.log(medsecData);

    useEffect (() => {
        const fetchMedSecData = async () => {   
            try {
                const res = await axios.get(`${ip.address}/api/medicalsecretary/api/getaudit/${msid}`);
                setMedsecData(res.data.medsec);
                setLoading(false);
            } catch (err) {
                setError('Error fetching medical secretary data');
                setLoading(false);
            }
        };
        fetchMedSecData();
    
    
    },[msid]);
    if (loading) {
        return <p>Loading...</p>;
    }
    if (error) {
        return <p>{error}</p>;
    }
    // Search filtering
    const filteredAudits = medsecData.audits.filter((audit) =>  
    Object.values(audit).some((value) =>
    String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
    );


    // Define columns for DataTable
    const columns = [
        {
          name: '#',
          selector: (row, index) => index + 1,
          width: '50px',
        },
        {
          name: 'Action',
          selector: (row) => row.action,
          sortable: true,
        },
        {
          name: 'Description',
          selector: (row) => row.description,
          sortable: true,
        },
        {
          name: 'IP Address',
          selector: (row) => row.ipAddress,
          sortable: true,
        },
        {
          name: 'User Agent',
          selector: (row) => row.userAgent,
        },
        {
          name: 'Timestamp',
          selector: (row) => new Date(row.createdAt).toLocaleString(),
          sortable: true,
        },
      ];
    return (
        <>

<Container className="p-5">
      <h4>Your Activity Log</h4>
      <hr />

      {/* Search Input */}
      <Form.Group controlId="search" className="mb-3">
        <Form.Control
          type="text"
          placeholder="Search audit logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form.Group>

      {/* DataTable Component */}
      <DataTable
        columns={columns}
        data={filteredAudits}
        customStyles={CustomStyles}
        pagination
        highlightOnHover
        striped
        responsive
        defaultSortField="createdAt"
        defaultSortAsc={false}
      />
    </Container>

        </>
    )
};

export default AuditMedSec