import React, { useState, useContext, useEffect } from 'react';
import { IonContent, IonHeader, IonToolbar, IonImg, IonInput, IonTextarea, IonButton, IonItem, IonLabel, IonCheckbox, IonSelect, IonSelectOption, IonModal, IonToast, IonLoading } from '@ionic/react';
import { AuthContext } from './auth/AuthProvider';
import '../theme/NewNote.css';
import { NoteProps } from './Note';
import { NoteContext } from './NoteProvider';
import { usePhotos } from "./camera/usePhotos";
import { useCamera } from './camera/useCamera';
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MyMap from "./map/MapComponent";
import L from "leaflet";
import MapComponent from "./map/MapComponent";
import { FaMapMarkerAlt, FaCamera } from 'react-icons/fa';

const customIcon = new L.DivIcon({
  className: 'custom-marker-icon',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});



export interface NewNoteModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const NewNoteModal: React.FC<NewNoteModalProps> = ({ isOpen, setIsOpen }) => {
  const [titlu, setTitlu] = useState('');
  const [descriere, setDescriere] = useState('');
  const [prioritate, setPrioritate] = useState<number | null>(null);
  const [data, setData] = useState<Date | null>(null);
  const [completat, setCompletat] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const { user } = useContext(AuthContext);
  const { notes, saving, savingError, saveNote } = useContext(NoteContext);
  const { photos, takePhoto, deletePhoto } = usePhotos();
  const [note, setNote] = useState<NoteProps | null>(null);
  const [photo, setPhoto] = useState<any>(null);
  
  // State pentru a controla vizibilitatea hărții și coordonatele locației
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<[number, number] | null>(null);

  // Obține locația actuală a utilizatorului
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentCoords([latitude, longitude]);
        },
        (error) => {
          console.error("Error getting geolocation:", error);
          setCurrentCoords([46.78, 23.60]); // Coordonate de rezervă în caz de eroare
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
      setCurrentCoords([46.78, 23.60]); // Coordonate de rezervă
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const idU = user?.id?.toString() ?? '';
    const newNote: NoteProps = {
      titlu,
      descriere,
      prioritate: prioritate ?? 0,
      data: data ?? new Date(),
      completat,
      userID: idU,
      photo,
      coords: note?.coords ?? currentCoords, // Folosim coordonatele actuale dacă nu au fost setate altfel
    };

    if (saveNote) {
      await saveNote(newNote);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        setIsOpen(false);
        resetForm(); 
      }, 1500);
    }
  };

  const dismiss = () => {
    setIsOpen(false);
    setIsMapVisible(false);
    resetForm(); 
  };

  const resetForm = () => {
    setTitlu('');
    setDescriere('');
    setPrioritate(null);
    setData(null);
    setCompletat(false);
    setPhoto(null);
    
  };

  const doPhoto = async () => {
    const newPhoto = await takePhoto();
    setPhoto(newPhoto);
  };

  const removePhoto = () => {
    if (photo) {
      deletePhoto(photo);
      setPhoto(null);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm(); 
    }
  }, [isOpen]);

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={() => setIsOpen(false)} className="dimension-modal">
        <IonHeader>
          <IonToolbar>
            <IonButton strong={true} onClick={dismiss} color={"danger"} style={{ height: 40, width: 40, paddingRight: 10 }}> X </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <form onSubmit={handleSubmit} className="new-note-form">
            <IonItem lines="none">
              <IonInput value={titlu} placeholder="Titlu" onIonChange={e => setTitlu(e.detail.value!)} required />
            </IonItem>
            <IonItem lines="none">
              <IonTextarea value={descriere} placeholder="Descriere" onIonChange={e => setDescriere(e.detail.value!)} required />
            </IonItem>
            <div className="priority-date-completed">
              <IonItem lines="none">
                <IonSelect value={prioritate} placeholder="Prioritate" onIonChange={e => setPrioritate(e.detail.value)}>
                  {[...Array(10).keys()].map(num => (
                    <IonSelectOption key={num + 1} value={num + 1}>{num + 1}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              <IonItem lines="none">
                <IonInput type="date" value={data ? data.toISOString().substring(0, 10) : ''} onIonChange={e => setData(new Date(e.detail.value!))} required />
              </IonItem>
              <IonItem lines="none">
                <IonLabel>Completat</IonLabel>
                <IonCheckbox checked={completat} onIonChange={e => setCompletat(e.detail.checked)} />
              </IonItem>
            </div>
            <IonItem lines="none">
            <IonButton onClick={doPhoto}>
                <FaCamera />
              </IonButton>
              <IonButton className="add-location-button" onClick={() => setIsMapVisible(true)} expand="block">
              <FaMapMarkerAlt />
            </IonButton>            </IonItem>
            {photo && (
              <IonItem lines="none">
                <IonImg src={photo.webviewPath} />
                <IonButton onClick={removePhoto}>Remove Photo</IonButton>
              </IonItem>
            )}
            {isMapVisible && currentCoords && (
              <MapContainer
                id="map-container"
                center={currentCoords}  
                zoom={13}
                style={{ height: '50vh', width: '100%' }}
              >
                <TileLayer
                  attribution="https://leafletjs.com/"
                  url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'
                />
                <MapComponent note={note} setNote={setNote} />
                <Marker position={currentCoords} icon={customIcon}>
                          <Popup>
                            Your location!
                          </Popup>
                    </Marker>
                {note?.coords && (
                    <Marker position={note.coords}>
                          <Popup>
                            Here I want to be!
                          </Popup>
                    </Marker>
                  )}
              </MapContainer>
            )}

            <IonButton type="submit" expand="block">Adaugă Notiță</IonButton>
          </form>
        </IonContent>
      </IonModal>
    </>
  );
};

export default NewNoteModal;
