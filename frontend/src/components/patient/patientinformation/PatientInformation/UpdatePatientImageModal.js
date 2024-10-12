import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import CropResizeTiltModal from './CropResizeTiltModal'; // Import the cropping modal
import { ip } from '../../../../ContentExport';

const UpdatePatientImageModal = ({ show, handleClose, pid, onImageUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null); // For previewing the selected image
  const [editedImage, setEditedImage] = useState(null); // Cropped image after editing
  const [isCropModalOpen, setIsCropModalOpen] = useState(false); // Manage crop modal visibility

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result); // Preview the selected image
      setIsCropModalOpen(true); // Open the crop modal after image selection
    };
    reader.readAsDataURL(file);
  };

  const handleImageEdit = (croppedImageSrc) => {
    setEditedImage(croppedImageSrc); // Set the cropped image as base64
    setIsCropModalOpen(false); // Close the crop modal after editing
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();

    if (editedImage) {
      // Convert the base64 cropped image to a Blob
      const response = await fetch(editedImage);
      const blob = await response.blob();
      const file = new File([blob], 'edited-image.png', { type: 'image/png' });
      formData.append('image', file); // Append the cropped image to formData
    } else if (selectedFile) {
      formData.append('image', selectedFile); // Append the original selected image
    }

    try {
      const response = await axios.post(`${ip.address}/patient/api/${pid}/updateimage`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Notify the parent component of the image change
      onImageUpload(response.data.updatedPatient.patient_image);
      handleClose(); // Close the modal
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Update Profile Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>Select a new profile image</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
            </Form.Group>
            {editedImage || imageSrc ? (
              <div className="mt-3">
                <h5>Image Preview</h5>
                <img
                  src={editedImage || imageSrc}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: '300px' }}
                />
              </div>
            ) : null}
            <Button variant="primary" type="submit" className="mt-3">
              Upload
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Crop, Resize, and Tilt modal */}
      <CropResizeTiltModal
        show={isCropModalOpen} // Show the crop modal when it's triggered
        handleClose={() => setIsCropModalOpen(false)} // Close the crop modal
        imageSrc={imageSrc} // Pass the image source for cropping
        onSave={handleImageEdit} // Handle the cropped image
      />
    </>
  );
};

export default UpdatePatientImageModal;
