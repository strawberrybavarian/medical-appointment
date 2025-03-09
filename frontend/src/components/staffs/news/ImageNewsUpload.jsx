import React, { useState } from "react";
import { Form } from "react-bootstrap";
import { ip } from "../../../ContentExport";
import './ImageNewsUpload.css';

function ImageNewsUpload({ newsImages = [], setNewsImages, handleImageDelete }) {
  const [dragActive, setDragActive] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isNew: true
    }));
    setNewsImages([...newsImages, ...newImages]);
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
    const files = Array.from(e.dataTransfer.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isNew: true
    }));
    setNewsImages([...newsImages, ...newImages]);
  };

  const removeImage = (index, e) => {
    e.stopPropagation(); // Prevent opening file dialog
    const imageToDelete = newsImages[index];
    if (typeof handleImageDelete === 'function') {
      handleImageDelete(imageToDelete);
    }
    const newImages = [...newsImages];
    newImages.splice(index, 1);
    setNewsImages(newImages);
  };

  // Helper function to get image source
  const getImageSource = (image) => {
    if (typeof image === 'string') {
      return `${ip.address}/${image}`;
    } else if (image.preview) {
      return image.preview;
    } else if (image.path) {
      return `${ip.address}/${image.path}`;
    } else if (image.url) {
      return image.url;
    } else if (image.src) {
      return image.src;
    } else if (image.image) {
      return image.image;
    }
    return ""; // Fallback
  };

  return (
    <Form.Group className="image-upload-container">
      <div
        className={`image-dropzone ${dragActive ? "dropzone-active" : ""} ${newsImages.length > 0 ? "has-images" : ""}`}
        onClick={() => document.getElementById("imageInput").click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {newsImages.length === 0 ? (
          <div className="dropzone-placeholder">
            <div className="upload-icon">
              <i className="fas fa-cloud-upload-alt"></i>
            </div>
            <div className="upload-text">
              <p className="upload-primary-text">Drag and drop images here</p>
              <p className="upload-secondary-text">or click to browse files</p>
            </div>
            <p className="upload-formats">Supported formats: JPG, PNG, GIF</p>
          </div>
        ) : (
          <div className="image-gallery">
            {newsImages.map((image, index) => (
              <div key={index} className="image-item">
                <div className="image-preview-wrapper">
                  <img
                    src={getImageSource(image)}
                    alt={`preview-${index}`}
                    onError={(e) => {
                      console.error("Image failed to load:", image);
                      e.target.src = "https://via.placeholder.com/150?text=Error";
                    }}
                  />
                  <button
                    className="image-delete-btn"
                    onClick={(e) => removeImage(index, e)}
                    type="button"
                    aria-label="Remove image"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            ))}
            <div className="add-more-images" onClick={(e) => {
              e.stopPropagation();
              document.getElementById("imageInput").click();
            }}>
              <div className="add-more-icon">+</div>
              <span style={{marginBottom: '3rem'}}>Add More</span>
            </div>
          </div>
        )}
      </div>

      <input
        id="imageInput"
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: "none" }}
      />
    </Form.Group>
  );
}

export default ImageNewsUpload;