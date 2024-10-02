import React, { useState } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import { Button, Form, Col } from "react-bootstrap";
import './UploadImageModal.css';
import CropResizeTiltModal from './CropResizeTiltModal'; // Import the CropResizeTiltModal

const ImageUploadModal = ({ isOpen, onRequestClose, did }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null); // For previewing the selected image
  const [editedImage, setEditedImage] = useState(null); // Cropped image after editing
  const [isCropModalOpen, setIsCropModalOpen] = useState(false); // Manage crop modal visibility

  // Handle file selection and display a preview
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result); // Set the original image preview
      setEditedImage(null); // Reset edited image when a new file is selected
      setIsCropModalOpen(true); // Open the crop modal immediately after image is selected
    };
    reader.readAsDataURL(file);
  };

  // Update the edited image from the CropResizeTiltModal
  const handleImageEdit = (croppedImageSrc) => {
    setEditedImage(croppedImageSrc); // Set the cropped/edited image as base64
    setIsCropModalOpen(false); // Close the crop modal after editing
  };

  // Handle form submission for image upload
  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();

    // Upload the edited image if it exists, otherwise upload the selected file
    if (editedImage) {
      // Convert the base64 edited image to a Blob
      const response = await fetch(editedImage);
      const blob = await response.blob();
      const file = new File([blob], 'edited-image.png', { type: 'image/png' });
      formData.append('image', file); // Append the cropped image to formData
    } else if (selectedFile) {
      formData.append('image', selectedFile); // If no edited image, use the original selected file
    }

    try {
      const response = await axios.post(`http://localhost:8000/doctor/api/${did}/updateimage`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Image uploaded successfully:', response.data);
      onRequestClose(response.data.updatedDoctor.dr_image); // Pass the new image URL back to the parent component
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => onRequestClose(null)}
      contentLabel="Image Upload Modal"
      className="image-upload-modal" 
      overlayClassName="modal-overlay" 
      ariaHideApp={false} 
    >
      <div className="modal-content">
        <h2>Upload Image</h2>
        <Form className='ium-form'>
          <Form.Group as={Col} className="mb-3">
            <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
          </Form.Group>
        </Form>

        {imageSrc && (
          <>
            <Button onClick={() => setIsCropModalOpen(true)}>Edit Image</Button> {/* Open crop modal */}
            <img src={editedImage || imageSrc} alt="Preview" className="preview-image" /> 
            {/* If there is an edited image, show that, otherwise show the original */}
          </>
        )}

        <Button style={{ marginTop: "15px" }} type="submit" onClick={handleSubmit}>Upload</Button>

        {/* Crop, Resize, and Tilt modal for image editing */}
        <CropResizeTiltModal
          isOpen={isCropModalOpen} // Open the crop modal based on state
          onRequestClose={() => setIsCropModalOpen(false)} // Close the modal when cropping is done
          imageSrc={imageSrc} // Pass the original image to be cropped
          onSave={handleImageEdit} // When cropping is done, handle the cropped image
        />
      </div>
    </Modal>
  );
};

export default ImageUploadModal;
