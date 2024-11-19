import React, { memo } from 'react';
import { getLogger } from '../core';
import '../theme/NoteList.css'; 
import { useHistory } from 'react-router-dom';

const log = getLogger('Note');


export interface Photo {
  filepath: string;
  webviewPath?: string;
  data: string;
}
export interface NoteProps {
  id?: string;
  titlu: string;
  descriere: string;
  data: Date;
  prioritate: number;
  completat: boolean;
  userID: string,
  photo?: Photo,
  coords?: [],
  children?: React.ReactNode;
}

const Note: React.FC<NoteProps> = ({ id, titlu, descriere, data, prioritate, completat, photo, coords, children }) => {
  const history = useHistory();

  const handleClick = () => {
    history.push(`/note/${id}`, { note: { id, titlu, descriere, data, prioritate, photo, coords, completat } });
  };
  return (
    <div className="note-preview" onClick={handleClick}>
      {children}
    </div>
  );
};

export default memo(Note);