import PropTypes from "prop-types";
import React, {useCallback, useEffect, useState} from "react";
import { login as authAPI, getLogger } from "./authApi";
import {clearPreferences, getPreference, setPreference} from "../capacitor/usePreferences";
import {useHistory} from "react-router-dom";


const log = getLogger('AuthProvider');

type LoginFn = (username?: string, password?: string) => void;

export interface User {
  username?: string;
  password?: string;
  id?: number;
}

export interface AuthState {
  authenticationError: Error | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  login?: LoginFn;
  pendingAuthentication?: boolean;
  user?: User;
  token: string;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isAuthenticating: false,
  authenticationError: null,
  pendingAuthentication: false,
  token: '',
}

export const AuthContext = React.createContext<AuthState>(initialState);

interface AuthProviderProps {
  children: PropTypes.ReactNodeLike,
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const { isAuthenticated, isAuthenticating, authenticationError, pendingAuthentication, token, user } = state;
  const login = useCallback<LoginFn>(loginCallback, []);
  const logout = useCallback<LoginFn>(logoutCallback, []);
  useEffect(authenticationEffect, [pendingAuthentication]);
  const value = { isAuthenticated, login, logout, isAuthenticating, authenticationError, token, user };
  const history = useHistory();
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );

  function loginCallback(username?: string, password?: string): void {
    log('login')
    setState({
      ...state,
      pendingAuthentication: true,
      user: {
        username: username,
        password: password,
        id: 0,
      }
    });
  }

  async function logoutCallback(): Promise<void> {
    console.log("Logging out");
    await clearPreferences();
    setState({
      ...state,
      isAuthenticated: false,
    });
    history.replace('/login');
  }


  function authenticationEffect() {
    let canceled = false;

    authenticate();
    return () => {
      canceled = true;
    }

    async function authenticate() {
      try {
        const tokenUserString = await getPreference('token');
        if (tokenUserString) {
          const { token, user } = JSON.parse(tokenUserString);
          console.log("Found auth credentials!")
          log('authenticate succeeded');
          setState({
            ...state,
            token,
            pendingAuthentication: false,
            isAuthenticated: true,
            isAuthenticating: false,
            user: user
          });
        } else {
          console.log('No token found');
        }
      } catch (error) {
        console.error('Error retrieving preference:', error);
      }


      if (!pendingAuthentication) {
        log('authenticate, !pendingAuthentication, return');
        return;
      }
      try {
        log("authenticate...")
        setState({
          ...state,
          isAuthenticating: true,
        });
        const { username, password } = state.user || {};
        const { token, user } = await authAPI(username, password);
        if (canceled) {
          return;
        }
        log('authenticate succeeded');
        setState({
          ...state,
          token,
          pendingAuthentication: false,
          isAuthenticated: true,
          isAuthenticating: false,
          user: user
        });
        try {
          await setPreference('token',
            JSON.stringify({
              token: token, user: user,
            }));
          console.log('Preference saved successfully');
        } catch (error) {
          console.error('Error saving preference:', error);
        }
      } catch (error) {
        if (canceled) {
          return;
        }
        log('authenticate failed');
        setState({
          ...state,
          authenticationError: error as Error,
          pendingAuthentication: false,
          isAuthenticating: false,
        });
      }
    }
  }
};
