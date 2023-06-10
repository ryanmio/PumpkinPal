import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

function EditPumpkin() {
  const { id } = useParams();
  const [pumpkin, setPumpkin] = useState(null);
  const navigate = useNavigate();

  // Load the existing pumpkin data from Firestore when the page mounts.
  useEffect(() => {
    const fetchPumpkin = async () => {
      const pumpkinDoc = await getDoc(doc(db, 'Users', auth.currentUser.uid, 'Pumpkins', id));
      setPumpkin({ ...pumpkinDoc.data(), id: pumpkinDoc.id });
    };
    fetchPumpkin();
  }, [id]);

  // Handle changes to the form inputs, updating the state variable.
  const handleChange = (e) => {
    setPumpkin({ ...pumpkin, [e.target.name]: e.target.value });
  };

  // Handle the form submission, updating the pumpkin document in Firestore with the new values.
  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateDoc(doc(db, 'Users', auth.currentUser.uid, 'Pumpkins', id), pumpkin);
    navigate(`/dashboard`);
  };

  if (!pumpkin) return 'Loading...';

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name:
        <input name="name" value={pumpkin.name} onChange={handleChange} required />
      </label>
      <label>
        Description:
        <textarea name="description" value={pumpkin.description} onChange={handleChange} />
      </label>
      <label>
        Maternal Lineage:
        <input name="maternalLineage" value={pumpkin.maternalLineage} onChange={handleChange} />
      </label>
      <label>
        Paternal Lineage:
        <input name="paternalLineage" value={pumpkin.paternalLineage} onChange={handleChange} />
      </label>
      <label>
        Seed Started Date:
        <input type="date" name="seedStarted" value={pumpkin.seedStarted} onChange={handleChange} />
      </label>
      <label>
        Transplant Out Date:
        <input type="date" name="transplantOut" value={pumpkin.transplantOut} onChange={handleChange} />
      </label>
      <label>
        Pollinated Date:
        <input type="date" name="pollinated" value={pumpkin.pollinated} onChange={handleChange} />
      </label>
      <label>
        Weigh-Off Date:
        <input type="date" name="weighOff" value={pumpkin.weighOff} onChange={handleChange} />
      </label>
      <button type="submit">Save Changes</button>
    </form>
  );
}

export default EditPumpkin;
