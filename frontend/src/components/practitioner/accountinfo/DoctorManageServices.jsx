import axios from "axios";
import { useEffect, useState } from "react";
import { Button, ListGroup } from "react-bootstrap";
import { ip } from "../../../ContentExport";

function DoctorManageServices({ doctorId }) {
  const [availableServices, setAvailableServices] = useState([]);
  const [doctorServices, setDoctorServices] = useState([]);

  useEffect(() => {
    console.log("Available Services:", availableServices);
    console.log("Doctor Services:", doctorServices);  // Log this after fetching doctor services
  }, [availableServices, doctorServices]);

  // Fetch all services and the doctor's current services
  useEffect(() => {
    // Fetch all services
    axios
      .get(`${ip.address}/api/admin/getall/services`)
      .then((res) => {
        setAvailableServices(res.data);
      })
      .catch((err) => {
        console.log(err);
      });

    // Fetch the doctor's current services
    axios
      .get(`${ip.address}/api/doctor/${doctorId}/services-status`)
      .then((res) => {
        console.log("Doctor services response:", res.data);
        if (res.data && res.data.dr_services) {
          setDoctorServices(res.data.dr_services);
        } else {
          setDoctorServices([]);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [doctorId]);

  // Check if a service is in the doctor's current services
  const isServiceSelected = (serviceId) => {
    return doctorServices.some(
      (service) => service && String(service._id) === String(serviceId)
    ); // Compare IDs as strings
  };

  // Add a service to the doctor
  const addService = (serviceId) => {
    axios
      .post(`${ip.address}/api/doctor/${doctorId}/add-service/${serviceId}`)
      .then((res) => {
        if (res.data && res.data.dr_services) {
          setDoctorServices(res.data.dr_services); // Set the updated list of services
          console.log("Updated doctor services after adding:", res.data.dr_services); // DEBUG LOGGING
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // Remove a service from the doctor
  const removeService = (serviceId) => {
    axios
      .delete(`${ip.address}/api/doctor/${doctorId}/remove-service/${serviceId}`)
      .then((res) => {
        if (res.data && res.data.dr_services) {
          setDoctorServices(res.data.dr_services); // Set the updated list of services
          console.log("Updated doctor services after removing:", res.data.dr_services); // DEBUG LOGGING
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div>
      <h3>Manage Your Services</h3>

      <ListGroup>
        {availableServices.map((service) => (
          <ListGroup.Item key={service._id}>
            <div className="d-flex justify-content-between align-items-center">
              <span>{service.name}</span>
              {isServiceSelected(service._id) ? (
                <Button variant="danger" onClick={() => removeService(service._id)}>
                  Remove
                </Button>
              ) : (
                <Button variant="primary" onClick={() => addService(service._id)}>
                  Add
                </Button>
              )}
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
}

export default DoctorManageServices;
