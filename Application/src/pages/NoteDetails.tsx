import { useParams, useLocation, useHistory } from "react-router-dom";
import { NoteProps } from './Note';
import '../theme/NoteDetails.css';
import { AuthContext } from './auth/AuthProvider';
import { useState, useEffect, useContext } from 'react';
import { home } from 'ionicons/icons';
import { IonPage, IonImg, IonHeader, IonToolbar, IonIcon,IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonText, IonButton, IonInput, IonTextarea, IonItem, IonLabel, IonSelect, IonSelectOption, IonCheckbox } from '@ionic/react';
import { getNoteById, updateNote } from './NoteApi';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import  MapComponent  from "./map/MapComponent";

const NoteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation<{ note: NoteProps }>();
  const history = useHistory();
  const { token } = useContext(AuthContext);
  const [note, setNote] = useState<NoteProps | null>(null);

  useEffect(() => {
    if (location.state && location.state.note) {
      setNote(location.state.note);
    } else {
      const fetchNote = async () => {
        try {
          if (token) {
            const data = await getNoteById(token, id);
            console.log('Fetched note:', data); // Verifică datele primite
            setNote(data);
          }
        } catch (error) {
          console.error('Error fetching note:', error);
        }
      };

      fetchNote();
    }
  }, [location.state, id, token]);

  const goToHome = () => {
    history.push('/home');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Detalii Notiță</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
  <div className="note-details">
    <IonButton className="home-button" slot="end" onClick={goToHome}>
            <IonIcon icon={home} />
    </IonButton>
    {!note && <IonText color="medium">Loading...</IonText>}
    {note && (
      <IonCard className="note-card">
        <IonCardHeader>
          <IonCardTitle className="note-title">{note.titlu}</IonCardTitle>
        </IonCardHeader>
          <IonCardContent>
                <div className="note-meta">
                  <p className="note-priority">Prioritate: {note.prioritate}</p>
                  <p className="note-date">Data: {new Date(note.data).toLocaleDateString()}</p>
                </div>
                <p className="note-description">Descriere: {note.descriere}</p>
                <div className="note-images-location">
                  {note.photo && (
                    <IonImg className="note-photo" src={note.photo.webviewPath} />
                  )}
                  {note.coords && (
                    <MapContainer
                      id="map-container"
                      center={note?.coords || [46.78, 23.60]}
                      zoom={17}
                      className="map-container"
                    >
                      <TileLayer
                        attribution="https://leafletjs.com/"
                        url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'
                      />
                      <MapComponent note={note.coords} setNote={null} />

                      <Marker position={note.coords}>
                        <Popup>
                          The Location of the Note!
                        </Popup>
                      </Marker>
                    </MapContainer>
                  )}
                </div>
                <p className="note-completed">Complet: {note.completat ? '✅' : '❌'}</p>
              </IonCardContent>
            </IonCard>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default NoteDetail;