import React, { useState, useCallback } from 'react';
import { Modal, Button, Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import Cropper from 'react-easy-crop';
import { ip } from '../../../../ContentExport';
import { CloudUpload, ArrowClockwise, ZoomIn, Crop, Check2Circle, X } from 'react-bootstrap-icons';
import './PatientInformation.css'
const UpdatePatientImageModal = ({ show, handleClose, pid, onImageUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      setIsEditing(true);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, croppedAreaPixels, rotation = 0) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  };

  const handleUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    
    try {
      setIsUploading(true);
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      
      const formData = new FormData();
      formData.append('image', croppedImageBlob, 'profile.jpg');
      
      const response = await axios.post(`${ip.address}/api/patient/api/${pid}/updateimage`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      onImageUpload(response.data.updatedPatient.patient_image);
      handleClose();
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetEditor = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose}
      centered
      size="lg"
      className="profileImageModal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Profile Photo</Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-0 py-0">
        {!imageSrc ? (
          <div className="imageUploadDropzone">
            <input
              type="file"
              id="imageUpload"
              accept="image/*"
              onChange={handleFileSelect}
              className="imageInput"
            />
            <label htmlFor="imageUpload" className="uploadLabel">
              <CloudUpload size={48} />
              <h5>Upload Profile Photo</h5>
              <p>Drag and drop or click to browse</p>
              <small>Supported formats: JPG, PNG (Max size: 5MB)</small>
            </label>
          </div>
        ) : (
          <div className="imageEditorContainer">
            <div className="cropContainer">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                cropShape="round"
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
              />
            </div>
            
            <div className="editorControlsPanel">
              <div className="editorControlsGroup">
                <label>
                  <ZoomIn size={18} /> Zoom
                </label>
                <input
                  type="range"
                  value={zoom}
                  min="1"
                  max="3"
                  step="0.1"
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="rangeSlider"
                />
              </div>
              
              <div className="editorControlsGroup">
                <label>
                  <ArrowClockwise size={18} /> Rotate
                </label>
                <input
                  type="range"
                  value={rotation}
                  min="0"
                  max="360"
                  step="1"
                  aria-labelledby="Rotation"
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="rangeSlider"
                />
              </div>
              
              <Button 
                variant="outline-secondary"
                size="sm"
                className="resetBtn"
                onClick={resetEditor}
              >
                Reset
              </Button>
            </div>
          </div>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <Button 
          variant="light" 
          onClick={handleClose}
          disabled={isUploading}
        >
          <X /> Cancel
        </Button>
        
        {imageSrc && (
          <Button 
            variant="primary" 
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <>Uploading...</>
            ) : (
              <><Check2Circle className="me-1" /> Save Photo</>
            )}
          </Button>
        )}
      </Modal.Footer>
      

    </Modal>
  );
};

export default UpdatePatientImageModal;