import React, { useState, useEffect, useRef } from 'react';
import { Button, Container, Modal } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import AdminNavbar from '../../navbar/AdminNavbar';
import SidebarAdmin from '../../sidebar/SidebarAdmin';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-bs5'; // For Bootstrap 5 styling
import $ from 'jquery';
import './Styles.css'
// Import Bootstrap 5 DataTable styles
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
import { ip } from '../../../../../ContentExport';


DataTable.use(DT); // Initialize DataTables with Bootstrap 5 styling

function PatientManagement() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState("");
  const { aid } = useParams();
  const tableRef = useRef();

  useEffect(() => {
    axios.get(`${ip.address}/api/patient/api/allpatient`)
      .then((result) => {
        setPatients(result.data.thePatient);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const handleShowModal = (patient, action) => {
    setSelectedPatient(patient);
    setModalAction(action);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPatient(null);
  };

  const handleAction = () => {
    const status = modalAction === 'register' ? 'Registered' : 'Deactivated';
    axios.put(`${ip.address}/api/admin/patient/account-status/${selectedPatient._id}`, { status })
      .then(() => {
        setPatients(patients.map(pat => pat._id === selectedPatient._id ? { ...pat, accountStatus: status } : pat));
        handleCloseModal();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    // Destroy the existing table if it exists
    if ($.fn.DataTable.isDataTable(tableRef.current)) {
      $(tableRef.current).DataTable().destroy();
    }

    // Reinitialize the table
    const table = $(tableRef.current).DataTable({
      data: patients,  // Use patients state for the table data
      columns: [
        { data: 'patient_firstName', title: 'First Name' },
        { data: 'patient_middleInitial', title: 'Middle Initial' },
        { data: 'patient_lastName', title: 'Last Name' },
        { 
          data: 'patient_email', 
          title: 'Email', 
          defaultContent: 'No Email'  // Fallback if email is missing or null
        },
        { data: 'patient_gender', title: 'Gender' },
        { data: 'accountStatus', title: 'Account Status', className: 'mode' },
        {
          data: null,
          title: 'Actions',
          render: function (data, type, row) {
            return `
              <button class="btn btn-primary register-btn" ${row.accountStatus === 'Registered' ? 'disabled' : ''}>Register</button>
              <button class="btn btn-danger deactivate-btn" ${row.accountStatus === 'Deactivated' ? 'disabled' : ''}>Deactivate</button>
            `;
          }
        }
      ],
      createdRow: function (row, data, index) {
        // Apply the custom class based on account status
        const statusCell = $('td', row).eq(5);  // Assuming accountStatus is the 6th column
        if (data.accountStatus === 'Active') {
          statusCell.addClass('mode_on');
        } else if (data.accountStatus === 'Inactive') {
          statusCell.addClass('mode_off');
        } else if (data.accountStatus === 'Processing') {
          statusCell.addClass('mode_process');
        } else if (data.accountStatus === 'Completed') {
          statusCell.addClass('mode_done');
        }
      },
      pagingType: "simple_numbers",
      language: {
        search: '<div class="searchInput"><label for="search">Search:</label><input type="search" id="filterbox" class="form-control" placeholder="Search..." /></div>',
        paginate: {
          next: '<i class="fa fa-chevron-right"></i>',  // Custom pagination icons
          previous: '<i class="fa fa-chevron-left"></i>'
        }
      }
    });

    // Attach click handlers for dynamically created buttons
    $(tableRef.current).on('click', '.register-btn', function () {
      const rowData = table.row($(this).parents('tr')).data();
      handleShowModal(rowData, 'register');
    });

    $(tableRef.current).on('click', '.deactivate-btn', function () {
      const rowData = table.row($(this).parents('tr')).data();
      handleShowModal(rowData, 'deactivate');
    });

    // Clean up event listeners when the component unmounts
    return () => {
      $(tableRef.current).off('click', '.register-btn');
      $(tableRef.current).off('click', '.deactivate-btn');
    };
  }, [patients]);

  return (
    <div className='d-flex justify-content-center'>
      <SidebarAdmin aid={aid} />
      <div style={{ width: '100%' }}>
        <AdminNavbar />
        <Container className='ad-container' style={{ height: 'calc(100vh - 56px)', overflowY: 'auto', padding: '20px' }}>
          <h1>Patient Management</h1>
          <table ref={tableRef} id="dataTable" className="table table-striped table-bordered display" style={{ width: '100%' }}></table>

          <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>Confirm Action</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you sure you want to {modalAction} the patient "{selectedPatient?.patient_firstName} {selectedPatient?.patient_lastName}"?
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant={modalAction === 'register' ? 'primary' : 'danger'} onClick={handleAction}>
                {modalAction === 'register' ? 'Register' : 'Deactivate'}
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      </div>
    </div>
  );
}

export default PatientManagement;
