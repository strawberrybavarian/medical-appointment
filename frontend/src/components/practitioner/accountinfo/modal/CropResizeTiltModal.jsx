import React, { useState, useCallback } from 'react';
import Modal from 'react-modal';
import Cropper from 'react-easy-crop';
import { Button, Form } from "react-bootstrap";
import './UploadImageModal.css';

const CropResizeTiltModal = ({ isOpen, onRequestClose, imageSrc, onSave }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [loading, setLoading] = useState(false); // Track if save operation is in progress

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
    console.log('Cropped Area Pixels:', croppedAreaPixels);  // Debugging to check if crop area is calculated
  }, []);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, croppedAreaPixels, rotation = 0) => {
    try {
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
          const fileReader = new FileReader();
          fileReader.readAsDataURL(blob);
          fileReader.onloadend = () => {
            console.log('Cropped Image Base64:', fileReader.result);  // Debugging: Ensure the image is created
            resolve(fileReader.result);  // Pass base64 image string
          };
        });
      });
    } catch (error) {
      console.error('Error cropping image:', error);
      throw new Error('Failed to crop image');
    }
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) {
      console.error('No cropped area detected!');  // Debugging: Ensure cropping area is defined
      return;
    }

    setLoading(true); // Indicate saving is in progress
    try {
      console.log('Starting image crop...');  // Debugging: Ensure we are in the save flow
      const croppedImageSrc = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      console.log('Image cropped successfully, now saving...');  // Debugging: Ensure cropping is successful

      onSave(croppedImageSrc);  // Pass the cropped image back to parent
      onRequestClose();  // Close the modal
      console.log('Modal closed');  // Debugging: Check if modal closing is triggered
    } catch (error) {
      console.error('Failed to save cropped image:', error);  // Handle error in cropping or saving
    } finally {
      setLoading(false);  // Stop loading state
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Edit Image"
      className="image-edit-modal"
      overlayClassName="modal-overlay"
      ariaHideApp={false}
    >
      <div className="modal-content">
        <h2>Edit Image</h2>
        <div className="crop-container">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}  // Make sure cropping is completed
          />
        </div>

        <div className="controls">
          <Form.Label>Zoom</Form.Label>
          <Form.Control
            type="range"
            value={zoom}
            min="1"
            max="3"
            step="0.1"
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(e.target.value)}
          />
          <Form.Label>Rotation</Form.Label>
          <Form.Control
            type="range"
            value={rotation}
            min="0"
            max="360"
            step="1"
            aria-labelledby="Rotation"
            onChange={(e) => setRotation(e.target.value)}
          />
        </div>

        <Button
          style={{ marginTop: "15px" }}
          onClick={handleSave}
          disabled={loading}  // Disable the button while saving
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </Modal>
  );
};

export default CropResizeTiltModal;
