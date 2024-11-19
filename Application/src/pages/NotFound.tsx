import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Page Not Found</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="not-found">
          <h2>Sorry</h2>
          <p>That page cannot be found</p>
          <IonButton expand="block" routerLink="/" color="primary">
            Back to the homepage...
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
}

export default NotFound;