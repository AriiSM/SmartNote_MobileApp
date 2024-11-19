import React, { useState } from 'react';
import { IonButton } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import '../theme/Navbar.css';
import NewNoteModal from './NewNoteModal';

const Navbar = () => {
  const history = useHistory();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <nav className="navbar">
      <h1 className="navbar-title">SmartNote</h1>
      <div className="navbar-buttons">
        <IonButton onClick={() => history.push('/home')} className="ion-button">Home</IonButton>
        <IonButton onClick={() => setIsModalOpen(true)} className="ion-button">New Note</IonButton>
      </div>
      <NewNoteModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
    </nav>
  );
}

export default Navbar;