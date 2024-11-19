import { promises as fs } from 'fs';
import path from 'path';

export class RepoDB {
    constructor(filename) {
        this.filePath = filename;
        this.pageSize = 7;
    }

    async readDatabase() {
        try {
            const data = await fs.readFile(this.filePath, 'utf-8');
            return JSON.parse(data);
        } catch (err) {
            if (err.code === 'ENOENT') {
                return { notes: [] };
            }
            throw new Error('Could not read database file');
        }
    }

    async writeDatabase(data) {
        await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    }


    async findAll() {
        const data = await this.readDatabase();
        return data;
    }

    async findMaxId() {
        const data = await this.readDatabase();
        const ids = data.notes.map(note => note.id);
        return Math.max(...ids);
    }

    async delete(id) {
        const data = await this.readDatabase();
        data.notes = data.notes.filter(note => note.id !== id);
        await this.writeDatabase(data);
    }



    //NOTES
    async findOneNoteById(id) {
        const data = await this.findAll();
        return data.notes.find(note => note.id === id);
    }

    async findNotesByUserId(userId) {
        const data = await this.findAll();
        return data.notes.filter(note => note.userID === userId);
    }

    async findNotesByUserID_paginated(userId, page_nr) {
        const data = await this.findAll();
        const notes = data.notes.filter(note => note.userID === userId);
        const start = (page_nr - 1) * this.pageSize;
        return notes.slice(start, start + this.pageSize);
    }
    async searchNoteByUserID_paginated(userId, page_nr, filterTerm) {
        const data = await this.findAll();
        const notes = data.notes;

        if (!filterTerm) {
            return notes
                .filter(note => note.userID === userId)
                .slice((page_nr - 1) * this.pageSize, page_nr * this.pageSize);
        }

        return notes
            .filter(note =>
                note.userID === userId &&
                note.titlu.toLowerCase().includes(filterTerm.toLowerCase())
            )
            .slice((page_nr - 1) * this.pageSize, page_nr * this.pageSize);
    }
    async filterNoteByUserID_paginated(userId, page_nr, filter) {
        const data = await this.findAll();
        const notes = data.notes;

        let filteredNotes = notes.filter(note => note.userID === userId);

        if (filter) {
            switch (filter) {
                case 'completed':
                    filteredNotes = filteredNotes.filter(note => note.completat === true);
                    break;
                case 'notCompleted':
                    filteredNotes = filteredNotes.filter(note => note.completat === false);
                    break;
                case 'highPriority':
                    filteredNotes = filteredNotes.filter(note => note.prioritate >= 8);
                    break;
                default:
                    break;
            }
        }

        const paginatedNotes = filteredNotes.slice(
            (page_nr - 1) * this.pageSize,
            page_nr * this.pageSize
        );

        return paginatedNotes;
    }

    async createNote(note) {
        const data = await this.readDatabase();
        const id = await this.findMaxId();
        note.id = (id + 1).toString();
        data.notes.push(note);
        await this.writeDatabase(data);
        return note;
    }

    async updateNote(updatedNote) {
        const data = await this.readDatabase();
        const noteIndex = data.notes.findIndex(note => note.id === updatedNote.id);
        if (noteIndex === -1) {
            throw new Error(`Notebook with id ${updatedNotebook.id} not found.`);
        }
        data.notes[noteIndex] = updatedNote;
        await this.writeDatabase(data);
        return updatedNote;
    }


    //USERS
    async findUserByUsername(username) {
        const data = await this.findAll();
        return data.users.find(user => user.username === username);
    }

    async createUser(user) {
        const data = await this.readDatabase();
        const id = await this.findMaxId();
        user.id = (id + 1).toString();
        data.users.push(user);
        await this.writeDatabase(data);
        return user;
    }

    async updateUser(updatedUser) {
        const data = await this.readDatabase();
        const userIndex = data.users.findIndex(user => user.id === updatedUser.id);
        if (userIndex === -1) {
            throw new Error(`User with id ${updatedUser.id} not found.`);
        }
        data.users[userIndex] = updatedUser;
        await this.writeDatabase(data);
        return updatedUser;
    }

}