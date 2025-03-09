import React, { useState, useEffect } from "react";
import { Button, ListGroup, Form } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { ip } from "../../../ContentExport";
import { useUser } from "../../UserContext";

function DoctorManageHMO() {
  const [availableHmos, setAvailableHmos] = useState([]);
  const [selectedHmos, setSelectedHmos] = useState([]);
  const [initialDoctorHmos, setInitialDoctorHmos] = useState([]);
  const {user} = useUser();
  const doctorId = user._id;
  // Fetch all HMOs and the doctor's current HMOs
  useEffect(() => {
    // Fetch all HMOs
    axios
      .get(`${ip.address}/api/admin/getall/hmo`)
      .then((res) => {
        setAvailableHmos(res.data);
      })
      .catch((err) => {
        console.log(err);
      });

    // Fetch the doctor's current HMOs
    axios
      .get(`${ip.address}/api/doctor/${doctorId}/hmo-status`)
      .then((res) => {
        if (res.data && res.data.dr_hmo) {
          setSelectedHmos(res.data.dr_hmo.map((hmo) => hmo._id));
          setInitialDoctorHmos(res.data.dr_hmo.map((hmo) => hmo._id)); // Keep track of initial selections
        } else {
          setSelectedHmos([]);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [doctorId]);

  // Handle checkbox change
  const handleHmoChange = (hmoId) => {
    setSelectedHmos((prevSelectedHmos) =>
      prevSelectedHmos.includes(hmoId)
        ? prevSelectedHmos.filter((id) => id !== hmoId)
        : [...prevSelectedHmos, hmoId]
    );
  };

  // Save the selected HMOs
  const handleSave = () => {
    const addHmos = selectedHmos.filter((id) => !initialDoctorHmos.includes(id));
    const removeHmos = initialDoctorHmos.filter((id) => !selectedHmos.includes(id));

    const requests = [
      ...addHmos.map((hmoId) =>
        axios.post(`${ip.address}/api/hmo/${hmoId}/add-doctor/${doctorId}`)
      ),
      ...removeHmos.map((hmoId) =>
        axios.delete(`${ip.address}/api/hmo/${hmoId}/remove-doctor/${doctorId}`)
      ),
    ];

    // Perform all add/remove requests
    Promise.all(requests)
      .then(() => {
        toast.success("HMOs updated successfully!");
        setInitialDoctorHmos(selectedHmos); // Update initial state after successful save
      })
      .catch((err) => {
        toast.error("Error updating HMOs");
        console.error(err);
      });
  };

  return (
    <div>


      <Form className="mt-3">
        <ListGroup>
          {availableHmos.map((hmo) => (
            <ListGroup.Item key={hmo._id}>
              <Form.Check
                type="checkbox"
                label={hmo.name}
                checked={selectedHmos.includes(hmo._id)}
                onChange={() => handleHmoChange(hmo._id)}
              />
            </ListGroup.Item>
          ))}
        </ListGroup>

        <Button className="mt-3" variant="primary" onClick={handleSave}>
          Save
        </Button>
      </Form>

      {/* Toast container for notifications */}
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}

export default DoctorManageHMO;
