import React, { useState } from 'react';
import axios from 'axios';
import { ip } from '../../../ContentExport';
import Swal from 'sweetalert2';
const UploadImage = ({did}) => {
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            const response = await axios.post(`${ip.address}/api/doctor/api/${did}/updateimage`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            Swal.fire({ 
                icon: 'success',
                toast: true,
                title: 'Image uploaded successfully',
                showConfirmButton: false,
                timer: 1500
            }); 

            console.log('Image uploaded successfully:', response.data);
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    return (
        <div>
            <h2>Upload Image</h2>
            <form onSubmit={handleSubmit}>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                <button type="submit">Upload</button>
            </form>
            {selectedFile && (
                <div>
                    <h3>Selected Image Preview</h3>
                    <img src={URL.createObjectURL(selectedFile)} alt="Selected" style={{ maxWidth: '100%', maxHeight: '300px' }} />
                </div>
            )}
        </div>
    );
};

export default UploadImage;
