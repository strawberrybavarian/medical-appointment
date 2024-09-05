import React, { useState } from "react";
import { Form } from "react-bootstrap";

function ImageUpload({ postImages, setPostImages }) {
  const [dragActive, setDragActive] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPostImages([...postImages, ...newImages]);
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
    }));
    setPostImages([...postImages, ...newImages]);
  };

  const removeImage = (index) => {
    const newImages = [...postImages];
    newImages.splice(index, 1);
    setPostImages(newImages);
  };

  return (
    <Form.Group>
      <div
        className={`upload-container ${dragActive ? "drag-active" : ""}`}
        onClick={() => document.getElementById("imageInput").click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-inside-container">

     
        {postImages.length === 0 ? (
          <div className="add-photos-placeholder">
            <span>Add Photos/Videos</span>
            <span>or drag and drop</span>
          </div>
        ) : (
          <div className="image-previews">
            {postImages.map((image, index) => (
              <div key={index} className="image-preview">
                <img
                  src={image.preview}
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
        id="imageInput"
        type="file"
        multiple
        onChange={handleImageChange}
        style={{ display: "none" }}
      />
    </Form.Group>
  );
}

export default ImageUpload;
