import axios from 'axios';
import { User } from "./AuthProvider";

const authURL = `http://localhost:3000/api/auth/login`;

export interface AuthProps {
  token: string;
}

export interface ResponseProps<T> {
  data: T;
}

export const getLogger: (tag: string) => (args: string) => void =
    tag => (args) => console.log(tag, ...args);

const log = getLogger('api');

export function withLogs<T>(promise: Promise<ResponseProps<T>>, fnName: string): Promise<T> {
  log(`${fnName} - started`);
  return promise
    .then(res => {
      log(`${fnName} - succeeded`);
      return Promise.resolve(res.data);
    })
    .catch(err => {
      log(`${fnName} - failed: ` + err);
      return Promise.reject(err);
    });
}

export const config = {
  headers: {
    'Content-Type': 'application/json'
  }
};

export const authConfig = (token?: string) => ({
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
});

export const login: (username?: string, password?: string) => Promise<{ token: string, user: User }> = (username, password) => {
  return withLogs(axios.post(authURL, { username, password }, config), 'login');
}