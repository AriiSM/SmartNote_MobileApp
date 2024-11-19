import axios from 'axios';
import { getLogger, authConfig } from '../core';
import { NoteProps } from './Note';

const log = getLogger('NoteApi');

const baseUrl = 'localhost:3000';
const itemUrl = `http://${baseUrl}/api/note`;
const pageUrl = `http://${baseUrl}/api/note/page/`;

interface ResponseProps<T> {
    data: T;
}

function withLogs<T>(promise: Promise<ResponseProps<T>>, fnName: string): Promise<T> {
    log(`${fnName} - started`);
    return promise
        .then(res => {
            log(`${fnName} - succeeded`);
            return Promise.resolve(res.data);
        })
        .catch(err => {
            log(`${fnName} - failed`);
            return Promise.reject(err);
        });
}

const config = {
    headers: {
        'Content-Type': 'application/json',
    },
}

export const getNotes: (token: string) => Promise<NoteProps[]> = token => {
    console.log("getNotes");
    console.log(token)
    return withLogs(axios.get(itemUrl, authConfig(token)), 'getNotes');
};

export const getNotes_paginated: (token: string, page: number) => Promise<NoteProps[]> = (token, page) => {
    console.log(pageUrl + page.toString());
    return withLogs(axios.get(pageUrl + page.toString(), authConfig(token)), 'getItems_paginated');
}
export const filterNotes_paginated = (token: string, page: number, filterOption: string) => {
    // Construct URL properly
    const filterURL = `${pageUrl}${page}/filter/${filterOption}`;
    console.log("Constructed filter URL:", filterURL); 
    return withLogs(axios.get(filterURL, authConfig(token)), 'getNotes_filtered');
  };
  
export const searchNotes_paginated: (token: string, page: number, searchTerm: string) => Promise<NoteProps[]> = (token, page, searchTerm) => {
    const searchURL = pageUrl + page.toString() + '/' + searchTerm;
    console.log(searchURL);
    return withLogs(axios.get(searchURL, authConfig(token)), 'getItems_paginated');
}

export const getNoteById: (token: string, id: string) => Promise<NoteProps> = async (token, id) => {
    return withLogs(axios.get(`${itemUrl}/${id}`, authConfig(token)), 'getNoteById');
};

export const createNote: (token: string, note: NoteProps) => Promise<NoteProps[]> = (token, note) => {
    return withLogs(axios.post(itemUrl, note, authConfig(token)), 'createNote');
}

export const updateNote: (token: string, note: NoteProps) => Promise<NoteProps> = async (token, note) => {
    return withLogs(axios.put(`${itemUrl}/${note.id}`, note, authConfig(token)), 'updateNote');
};
export const deleteNote: (id: string) => Promise<void> = (id) => {
    return withLogs(axios.delete(`${itemUrl}/${id}`, config), 'deleteNote');
}


interface MessageData {
    event: string;
    payload: {
        note: NoteProps;
    };
}

export const newWebSocket = (onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`);
    ws.onopen = () => {
        log('web socket onopen');
    };
    ws.onclose = () => {
        log('web socket onclose');
    };
    ws.onerror = error => {
        log('web socket onerror ' + error);
    };
    ws.onmessage = messageEvent => {
        log('web socket onmessage');
        onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
        ws.close();
    };
};