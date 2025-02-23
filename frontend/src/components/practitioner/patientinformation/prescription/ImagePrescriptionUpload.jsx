// ImagePrescriptionUpload.js

import React, { useState } from "react";
import { Form } from "react-bootstrap";
import { ip } from "../../../../ContentExport";
function ImagePrescriptionUpload({ prescriptionImages = [], setPrescriptionImages }) {
  const [dragActive, setDragActive] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5 - prescriptionImages.length); // Limit to 5 images
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPrescriptionImages([...prescriptionImages, ...newImages]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files).slice(0, 5 - prescriptionImages.length);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPrescriptionImages([...prescriptionImages, ...newImages]);
  };

  const removeImage = (index) => {
    const newImages = [...prescriptionImages];
    newImages.splice(index, 1);
    setPrescriptionImages(newImages);
  };

  return (
    <Form.Group>
      <div
        className={`upload-container ${dragActive ? "drag-active" : ""}`}
        onClick={() => document.getElementById("prescriptionImageInput").click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-inside-container">
          {prescriptionImages.length === 0 ? (
            <div className="add-photos-placeholder">
              <span>Add Prescription Images</span>
              <span>or drag and drop (Max 5 images)</span>
            </div>
          ) : (
            <div className="image-previews">
              {prescriptionImages.map((image, index) => (
                <div key={index} className="image-preview">
                  <img
                    src={image.preview || `${ip.address}/${image}`}
                    alt="preview"
                    style={{ cursor: "pointer" }}
                  />
                  <button
                    className="button-delete-image"
                    onClick={() => removeImage(index)}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <input
        id="prescriptionImageInput"
        type="file"
        multiple
        onChange={handleImageChange}
        style={{ display: "none" }}
        accept="image/*"
      />
    </Form.Group>
  );
}

export default ImagePrescriptionUpload;