import React, { useReducer, useEffect, useContext, useState, useCallback } from 'react';
import { getLogger } from '../core';
import { createNote, getNotes, newWebSocket, getNotes_paginated, searchNotes_paginated, filterNotes_paginated } from './NoteApi';
import { AuthContext } from './auth/AuthProvider';
import { useNetwork } from "./capacitor/useNetwork";
import { getPreference, removePreference, setPreference } from "./capacitor/usePreferences";

const log = getLogger('NoteProvider');

type SaveItemFn = (note: NoteProps) => Promise<any>;

export interface Photo {
  filepath: string;
  webviewPath?: string;
  data: string;
}

export interface NoteProps {
  id?: string,
  titlu: string,
  descriere: string,
  data: string,
  prioritate: string,
  completat: boolean,
  userID: string,
  photo?: Photo,
  coords?: [],
  children?: React.ReactNode;
}

export interface NotesState {
  notes?: NoteProps[],
  fetching: boolean,
  fetchingError?: Error | null,
  saving: boolean,
  savingError?: Error | null,
  saveNote?: SaveItemFn,
}

interface ActionProps {
  type: string,
  payload?: any,
}

const initialState: NotesState = {
  fetching: false,
  saving: false,
};

const FETCH_NOTES_STARTED = 'FETCH_NOTES_STARTED';
const FETCH_NOTES_SUCCEEDED = 'FETCH_NOTES_SUCCEEDED';
const FETCH_NOTES_FAILED = 'FETCH_NOTES_FAILED';
const SAVE_NOTE_STARTED = 'SAVE_NOTE_STARTED';
const SAVE_NOTE_SUCCEEDED = 'SAVE_NOTE_SUCCEEDED';
const SAVE_NOTE_FAILED = 'SAVE_NOTE_FAILED';

const reducer: (state: NotesState, action: ActionProps) => NotesState = (state, { type, payload }) => {
  switch (type) {
    case FETCH_NOTES_STARTED:
      return { ...state, fetching: true, fetchingError: null };
      case FETCH_NOTES_SUCCEEDED:
        const newNotes = payload.notes;
        if (payload.isSearch) {
          return { ...state, fetching: false, notes: newNotes };
        }
        if (payload.isFilter) {
          return { ...state, fetching: false, notes: newNotes };
        }

        const updatedNotes = [
          ...(state.notes || []), 
          ...newNotes
        ].filter((note, index, self) =>
          index === self.findIndex((n) => n.id === note.id)
        );
  
        return { ...state, fetching: false, notes: updatedNotes };
    case FETCH_NOTES_FAILED:
      return { ...state, fetchingError: payload.error, fetching: false };
    case SAVE_NOTE_STARTED:
      return { ...state, savingError: null, saving: true };
    case SAVE_NOTE_SUCCEEDED:
      const notes = [...(state.notes || [])];
      const note = payload.note;
      if (note && note.id) {
        const index = notes.findIndex(it => it.id === note.id);
        if (index === -1) {
          notes.push(note);
        } else {
          notes[index] = note;
        }
      }
      return { ...state, notes, saving: false };
    case SAVE_NOTE_FAILED:
      return { ...state, savingError: payload.error, saving: false };
    default:
      return state;
  }
};

export const NoteContext = React.createContext<NotesState>(initialState);

interface NoteProviderProps {
  children: React.ReactNode;
}

export const NoteProvider: React.FC<NoteProviderProps> = ({ children }) => {
  const { token, isAuthenticated } = useContext(AuthContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  let unsavedIndex = 0;
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [unsaved, setUnsaved] = useState(0);
  const saveItem = useCallback<SaveItemFn>(saveItemCallback, [token]);
  const { notes, fetching, fetchingError, saving, savingError } = state;
  const { networkStatus } = useNetwork();
  const [pageNumber, setPageNumber] = useState(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterOption, setFilterOption] = useState<string>("all");

  const value = { ...state, saveItem, unsaved, saveNote: saveItemCallback, pageNumber, setPageNumber, setSearchTerm, setFilterOption };

  useEffect(wsEffect, []);

  useEffect(() => {
    readIndex().then(r => {
      if (networkStatus.connected) {
        saveToServer();
      }
      console.log("NetworkStatus changed: " + networkStatus.connected)
    });
  }, [networkStatus.connected]);

  useEffect(() => {
    console.log("TRIGGERED! Page number changed: " + pageNumber);
    getItemsEffect();
  }, [pageNumber]);

  useEffect(() => {
    setPageNumber(1);
    getItemsEffect("",searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    setPageNumber(1);
    getItemsEffect(filterOption,"");
  }, [filterOption]);

  useEffect(() => {
    setPageNumber(1);
  }, []);

  useEffect(() => {
    if (isAuthenticated && token) {
      setPageNumber(1);
      getItemsEffect();
    }
  }, [isAuthenticated, token]);

  function wsEffect() {
    let canceled = false;
    log('wsEffect - connecting');
    const closeWebSocket = newWebSocket(message => {
      if (canceled) {
        return;
      }
      const { event, payload: { note } } = message;
      log(`ws message, note ${event}`);
      if (event === 'created' || event === 'updated') {
        dispatch({ type: SAVE_NOTE_SUCCEEDED, payload: { note } });
      }
    });
    return () => {
      log('wsEffect - disconnecting');
      canceled = true;
      closeWebSocket();
    };
  }

  async function readIndex(): Promise<number> {
    try {
      const pref = await getPreference("unsaved");
      if (pref !== null) {
        console.log('UnsavedIndex retrieved successfully:', pref);
        unsavedIndex = parseInt(pref, 10);
        setUnsaved(unsavedIndex);
      } else {
        console.log('No preference found for "unsaved"');
        return 0;
      }
    } catch (error) {
      console.error('Error retrieving preference:', error);
      return 0;
    }
  }

  async function getItemsEffect(filterOption?: string, searchTerm?: string) {
    let canceled = false;
  
    if (token) {
      fetchItems();
    }
  
    return () => {
      canceled = true;
    };
  
    async function fetchItems() {
      try {
        dispatch({ type: FETCH_NOTES_STARTED });
        let notes;
  
        if (searchTerm) {
          notes = await searchNotes_paginated(token, pageNumber, searchTerm);
        } else if (filterOption && filterOption !== "all") {
          notes = await filterNotes_paginated(token, pageNumber, filterOption);
        } else {
          notes = await getNotes_paginated(token, pageNumber);
        }
  
        if (!canceled) {
          dispatch({
            type: FETCH_NOTES_SUCCEEDED,
            payload: { 
              notes, 
              isSearch: !!searchTerm, 
              isFilter: filterOption && filterOption !== "all" 
            },
          });
        }
      } catch (error) {
        if (!canceled) {
          console.error("Error fetching notes:", error);
          dispatch({ type: FETCH_NOTES_FAILED, payload: { error } });
        }
      }
    }
  }
  

  async function saveLocally(note: NoteProps) {
    try {
      const prefID = 'note' + unsavedIndex;
      await setPreference(prefID, JSON.stringify({ ...note }));
      console.log('Preference  note saved successfully');
      await modifyUnsavedIndex(+1);
    } catch (error) {
      console.error('Error saving preference:', error);
    }
  }

  async function modifyUnsavedIndex(value: number) {
    try {
      unsavedIndex += value;
      setUnsaved(unsavedIndex);
      await removePreference("unsaved");
      await setPreference("unsaved", unsavedIndex.toString());
    } catch (error) {
      console.error('Error saving preference:', error);
    }
  }

  async function deleteLocally() {
    try {
      const index = unsavedIndex - 1;
      const prefID = 'note' + index;
      await removePreference(prefID);
      console.log('Preference note deleted successfully');
      await modifyUnsavedIndex(-1);
    } catch (error) {
      console.error('Error deleting preference:', error);
    }
  }

  async function saveToServer() {
    console.log("entered save to server");
    await (async () => {
      for (let i = unsavedIndex; i > 0; i--) {
        const note = await getFomLocalSave();
        console.log(note);
        if (note) {
          await saveItemCallback(note);
          console.log("Saving item to server!");
          await deleteLocally();
        }
      }
    })();
  }

  async function getFomLocalSave(): Promise<NoteProps | null> {
    try {
      console.log('Preference trying to get note from local:', unsavedIndex - 1);
      const temp = unsavedIndex - 1;
      const prefID = 'note' + temp;
      const pref = await getPreference(prefID);
      if (pref !== null) {
        console.log('Preference retrieved successfully:', pref);
        return JSON.parse(pref as string) as NoteProps;
      } else {
        console.log('No preference found for note:', unsavedIndex);
        return null;
      }
    } catch (error) {
      console.error('Error getting preference:', error);
      return null;
    }
  }

  async function saveItemCallback(note: NoteProps) {
    if (networkStatus.connected) {
      console.log("Online, adding note to server!");
      try {
        log('addNote started');
        dispatch({ type: SAVE_NOTE_STARTED });
        const addedNote = await createNote(token, note);
        log('addNote succeeded');
        dispatch({ type: SAVE_NOTE_SUCCEEDED, payload: { note: addedNote } });
        setSaveStatus("Note added to server!");
      } catch (error) {
        log('addNote failed');
        console.log("Error! Adding note to local storage");
        saveLocally(note);
        dispatch({ type: SAVE_NOTE_FAILED, payload: { error } });
        setSaveStatus("Error! Note added locally!");
      }
    } else {
      console.log("Offline, adding note to local storage!");
      saveLocally(note);
      dispatch({ type: SAVE_NOTE_SUCCEEDED, payload: { note } });
      setSaveStatus("Note added locally!");
    }
  }

  return (
    <NoteContext.Provider value={value}>
      {children}
    </NoteContext.Provider>
  );
};