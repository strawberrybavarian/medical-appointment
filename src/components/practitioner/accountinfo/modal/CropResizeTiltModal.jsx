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

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
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
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));
    
    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    );
    
    const data = ctx.getImageData(0, 0, safeArea, safeArea);
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - croppedAreaPixels.x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - croppedAreaPixels.y)
    );

    // Draw a circle
    const diameter = Math.min(croppedAreaPixels.width, croppedAreaPixels.height);
    const circleCanvas = document.createElement('canvas');
    const circleCtx = circleCanvas.getContext('2d');
    circleCanvas.width = diameter;
    circleCanvas.height = diameter;

    circleCtx.beginPath();
    circleCtx.arc(diameter / 2, diameter / 2, diameter / 2, 0, Math.PI * 2);
    circleCtx.closePath();
    circleCtx.clip();

    circleCtx.drawImage(
      canvas,
      (croppedAreaPixels.width - diameter) / 2,
      (croppedAreaPixels.height - diameter) / 2,
      diameter,
      diameter,
      0,
      0,
      diameter,
      diameter
    );

    return new Promise((resolve) => {
      circleCanvas.toBlob((blob) => {
        const finalCroppedFile = new File([blob], 'cropped-image.png', { type: 'image/png' });
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(finalCroppedFile);
      });
    });
  };

  const handleSave = async () => {
    const croppedImageSrc = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
    onSave(croppedImageSrc);
    onRequestClose();
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
            onCropComplete={onCropComplete}
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

        <Button style={{ marginTop: "15px" }} onClick={handleSave}>Save</Button>
      </div>
    </Modal>
  );
};

export default CropResizeTiltModal;
