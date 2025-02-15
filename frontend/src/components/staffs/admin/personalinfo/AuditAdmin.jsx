import React, { useEffect, useState } from 'react';
import { Container, Form } from 'react-bootstrap';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import { ip } from '../../../../ContentExport';

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


const AuditAdmin = ({adminId}) => {
    const aid = adminId;
    const [adminData, setAdminData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    console.log(adminData)
    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const res = await axios.get(`${ip.address}/api/admin/api/getaudit/${aid}`);
                setAdminData(res.data.admin);
                setLoading(false);
            } catch (err) {
                setError('Error fetching admin data');
                setLoading(false);
            }
        };

        fetchAdminData();
    }, [aid]);


    if (loading) {  
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    const filteredAudits = adminData.audits.filter((audit) =>
        Object.values(audit).some((value) =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const columns = [
        {
            name:'#',
            selector: (row, index) => index + 1,
            width: '50px'

        },
        {
            name: 'Action',
            selector: (row) => row.action,
            sortable: true
        },
        {
            name: 'Description',
            selector: (row) => row.description,
            sortable: true
        },
        {
            name: 'IP Address',
            selector: (row) => row.ipAddress,
            sortable: true
        },
        {
            name: 'User Agent',
            selector: (row) => row.userAgent,
            sortable: true
        },
        {
            name: 'Timestamp',
            selector: (row) => new Date(row.createdAt).toLocaleString(),    
            sortable: true
        }

    ]
    return (
        <>
<Container>

                <Form.Group controlId="search" className="mb-3">
                    <Form.Control
                        type="text"
                        placeholder="Search audit logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Form.Group>

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
}

export default AuditAdmin;