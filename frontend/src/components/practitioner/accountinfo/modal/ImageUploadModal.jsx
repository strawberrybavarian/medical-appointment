import React, { useState, useCallback } from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import Cropper from 'react-easy-crop';
import Swal from 'sweetalert2';
import { ip } from '../../../../ContentExport';
import { CloudUpload, ArrowClockwise, ZoomIn, Check2Circle, X } from 'react-bootstrap-icons';

const ImageUploadModal = ({ isOpen, onRequestClose, did }) => {
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

  const resetEditor = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const handleUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      Swal.fire({
        title: 'Error!',
        text: 'Please select and edit an image first',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    try {
      setIsUploading(true);
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      
      const formData = new FormData();
      formData.append('image', croppedImageBlob, 'profile.jpg');
      
      const response = await axios.post(`${ip.address}/api/doctor/api/${did}/updateimage`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      Swal.fire({
        title: 'Success!',
        text: 'Profile photo updated successfully',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
        // Pass the new image URL back to parent component
        if (response.data && response.data.updatedDoctor && response.data.updatedDoctor.dr_image) {
          onRequestClose(response.data.updatedDoctor.dr_image);
        } else {
          onRequestClose();
        }
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to upload image. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal 
      show={isOpen} 
      onHide={() => onRequestClose()}
      centered
      size="lg"
      className="profileImageModal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Doctor Profile Photo</Modal.Title>
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
              <h5>Update Profile Photo</h5>
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
          onClick={() => onRequestClose()}
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
      
      <style jsx>{`
        .profileImageModal {
          border-radius: 12px;
          overflow: hidden;
        }
        
        .imageUploadDropzone {
          padding: 3rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          border: 2px dashed #dee2e6;
          background-color: #f8f9fa;
          border-radius: 8px;
          margin: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .imageUploadDropzone:hover {
          border-color: #4a90e2;
          background-color: #f0f4f8;
        }
        
        .imageInput {
          display: none;
        }
        
        .uploadLabel {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          color: #495057;
          cursor: pointer;
          width: 100%;
        }
        
        .uploadLabel svg {
          color: #4a90e2;
        }
        
        .uploadLabel h5 {
          margin: 0;
          color: #212529;
          font-weight: 600;
        }
        
        .uploadLabel p {
          margin: 0;
        }
        
        .uploadLabel small {
          color: #6c757d;
        }
        
        .imageEditorContainer {
          display: flex;
          flex-direction: column;
          height: 500px;
        }
        
        .cropContainer {
          position: relative;
          height: 400px;
          background-color: #000;
        }
        
        .editorControlsPanel {
          padding: 1rem;
          background-color: #f8f9fa;
          border-top: 1px solid #e9ecef;
        }
        
        .editorControlsGroup {
          margin-bottom: 1rem;
        }
        
        .editorControlsGroup label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          font-weight: 500;
          font-size: 0.9rem;
          color: #495057;
        }
        
        .rangeSlider {
          width: 100%;
          height: 6px;
          -webkit-appearance: none;
          appearance: none;
          background: #dee2e6;
          outline: none;
          border-radius: 3px;
        }
        
        .rangeSlider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          background: #4a90e2;
          border-radius: 50%;
          cursor: pointer;
        }
        
        .rangeSlider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: #4a90e2;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
        
        .resetBtn {
          font-size: 0.85rem;
          padding: 0.25rem 0.75rem;
        }

        /* Fix for the cropper styling */
        :global(.reactEasyCrop_Container) {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }
        
        :global(.reactEasyCrop_CropArea) {
          border: 2px solid #fff !important;
          box-shadow: 0 0 0 9999em rgba(0, 0, 0, 0.7) !important;
        }
      `}</style>
    </Modal>
  );
};

export default ImageUploadModal;