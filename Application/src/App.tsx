import { Redirect, Route, Switch } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { AuthProvider } from './pages/auth/AuthProvider';
import PrivateRoute from './pages/auth/PrivateRoute';
import NoteDetail from './pages/NoteDetails';

import Login from './pages/auth/Login';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import {IonHeader} from '@ionic/react';
import NewNote from './pages/NewNoteModal';
import NoteList from './pages/NoteList';
import { NoteProvider } from './pages/NoteProvider';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
  <IonReactRouter>
    <IonHeader>
      {/* <IonToolbar>
        <Navbar />
      </IonToolbar> */}
    </IonHeader>
    <IonRouterOutlet>
      <AuthProvider>
        <Route path="/login" component={Login} exact/>
        <NoteProvider>
          <PrivateRoute path="/home" component={NoteList} exact />
          <PrivateRoute path="/note/:id" component={NoteDetail} exact />
          <PrivateRoute path="/newNote" component={NewNote} exact />
        </NoteProvider>
        <Route path="/" render={() => <Redirect to="/login"/>}/>
      </AuthProvider>
    </IonRouterOutlet>
  </IonReactRouter>
</IonApp >
);
export default App;