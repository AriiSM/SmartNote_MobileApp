import React, { useCallback, useContext, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { IonButton, IonContent, IonHeader, IonInput, IonLoading, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { getLogger } from '../../core/index';
import { AuthContext } from './AuthProvider';
import '../../theme/Login.css'; 

const log = getLogger('Login');

interface LoginState {
  username?: string,
  password?: string,
}

const Login: React.FC<RouteComponentProps> = ({ history }) => {
  const { isAuthenticated, isAuthenticating, login, authenticationError } = useContext(AuthContext);
  const [state, setState] = useState<LoginState>({});
  const { username, password } = state;

  const handlePasswordChange = useCallback((e: any) => setState({
    ...state,
    password: e.detail.value || ''
  }), [state]);

  const handleUsernameChange = useCallback((e: any) => setState({
    ...state,
    username: e.detail.value || ''
  }), [state]);

  const handleLogin = useCallback(() => {
    log('handleLogin...');
    login?.(username, password);
  }, [username, password]);

  useEffect(() => {
    if (isAuthenticated) {
      log('redirecting to home');
      history.push('/home');
    }
  }, [isAuthenticated]);

  return (
    <IonPage className="login-page">
      <IonHeader>
        <IonToolbar>
          <IonTitle className="login-header">Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="login-container">
          <IonInput
            className="login-input"
            placeholder="Username"
            value={username}
            onIonChange={handleUsernameChange}
            clearInput
          />
          <IonInput
            className="login-input"
            placeholder="Password"
            type="password"
            value={password}
            onIonChange={handlePasswordChange}
            clearInput
          />
          <IonLoading isOpen={isAuthenticating} />
          {authenticationError && (
            <div className="error-message">{authenticationError.message || 'Failed to authenticate'}</div>
          )}
          <IonButton className="login-button" expand="block" onClick={handleLogin}>Login</IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;