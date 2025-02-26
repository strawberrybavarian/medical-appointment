import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import CropResizeTiltModal from './CropResizeTiltModal';
import Swal from 'sweetalert2';
import { ip } from '../../../../ContentExport';

const ImageUploadModal = ({ isOpen, onRequestClose, did }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = () => {
        setPreviewImage(reader.result);
        setShowCropModal(true);
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  const handleCroppedImage = (croppedImage) => {
    setPreviewImage(croppedImage);
    
    // Convert base64 to blob for upload
    fetch(croppedImage)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "profile-image.jpg", { type: "image/jpeg" });
        setSelectedFile(file);
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      Swal.fire({
        title: 'Error!',
        text: 'Please select an image to upload',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    const formData = new FormData();
    formData.append('image', selectedFile);
    
    try {
      await axios.post(`${ip.address}/api/doctor/api/${did}/updateimage`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      Swal.fire({
        title: 'Success!',
        text: 'Image uploaded successfully',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
        // Close modal and refresh page to show new image
        onRequestClose();
        window.location.reload();
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to upload image. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  return (
    <>
      <Modal show={isOpen} onHide={onRequestClose}>
        <Modal.Header closeButton>
          <Modal.Title>Upload Profile Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Select Image</Form.Label>
              <Form.Control 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
              />
            </Form.Group>
            
            {previewImage && !showCropModal && (
              <div className="text-center my-3">
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="img-thumbnail" 
                  style={{ maxHeight: '200px' }} 
                />
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onRequestClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!selectedFile}>
            Upload
          </Button>
        </Modal.Footer>
      </Modal>
      
      <CropResizeTiltModal 
        show={showCropModal}
        handleClose={() => setShowCropModal(false)}
        imageSrc={previewImage}
        onSave={handleCroppedImage}
      />
    </>
  );
};

export default ImageUploadModal;