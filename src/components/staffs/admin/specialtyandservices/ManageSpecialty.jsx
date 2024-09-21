import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ip } from '../../../../ContentExport';

function ManageSpecialty({aid}) {
  const [specialties, setSpecialties] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editSpecialtyId, setEditSpecialtyId] = useState(null);

  useEffect(() => {
    // Fetch all specialties on component mount
    fetchSpecialties();
  }, []);

  // Fetch all specialties from the server
  const fetchSpecialties = async () => {
    try {
      const res = await axios.get(`${ip.address}/admin/specialties`);
      setSpecialties(res.data);
    } catch (err) {
      console.error('Error fetching specialties:', err);
    }
  };

  // Handle adding a new specialty
  const addSpecialty = async () => {
    try {
      const res = await axios.post(`${ip.address}/admin/specialty/add`, { 
        name, 
        description, 
        adminId: aid 
      });
      setSpecialties([...specialties, res.data.specialty]);
      setName('');
      setDescription('');
    } catch (err) {
      console.error('Error adding specialty:', err);
    }
  };

  // Handle editing a specialty
  const editSpecialty = async () => {
    try {
      const res = await axios.put(`${ip.address}/admin/specialty/update`, { specialtyId: editSpecialtyId, name, description });
      const updatedSpecialties = specialties.map(specialty => (specialty._id === editSpecialtyId ? res.data.specialty : specialty));
      setSpecialties(updatedSpecialties);
      setName('');
      setDescription('');
      setEditSpecialtyId(null);
    } catch (err) {
      console.error('Error updating specialty:', err);
    }
  };

  // Handle deleting a specialty
  const deleteSpecialty = async (id) => {
    try {
      await axios.delete(`${ip.address}/admin/specialty/delete/${id}`);
      setSpecialties(specialties.filter(specialty => specialty._id !== id));
    } catch (err) {
      console.error('Error deleting specialty:', err);
    }
  };

  // Handle form submission (either add or edit)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editSpecialtyId) {
      editSpecialty();
    } else {
      addSpecialty();
    }
  };

  return (
    <div>
      <h1>Manage Specialties</h1>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Specialty Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <button type="submit">{editSpecialtyId ? 'Update Specialty' : 'Add Specialty'}</button>
      </form>

      <h2>Specialty List</h2>
      <ul>
        {specialties.map((specialty) => (
          <li key={specialty._id}>
            <strong>{specialty.name}:</strong> {specialty.description}
            <button onClick={() => {
              setEditSpecialtyId(specialty._id);
              setName(specialty.name);
              setDescription(specialty.description);
            }}>
              Edit
            </button>
            <button onClick={() => deleteSpecialty(specialty._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ManageSpecialty;
