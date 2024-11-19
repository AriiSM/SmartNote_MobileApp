# Note Application

This is a web-based note-taking application built using React, Ionic, and Leaflet. It allows users to create, view, and manage notes, including attaching images and geolocation. The application supports offline functionality, enabling users to store notes locally when offline and sync them with the server when back online.

## Features

- **Note Creation**: Create new notes with a title, description, priority, and completion status.
- **Photo Attachments**: Attach photos to notes, which are displayed within the note details.
- **Geolocation**: Attach coordinates to notes and view them on an interactive map (using Leaflet).
- **Offline Support**: Notes are stored locally when the device is offline and synced to the server when the connection is restored.
- **Note List and Detail View**: View a list of notes and open detailed views for each note.
- **Priority and Status**: Each note can have a priority level and a completion status (completed or not).
- **Search and Filter**: Search and filter notes based on specific criteria.

## Technologies Used

- **React**: A JavaScript library for building user interfaces.
- **Ionic Framework**: Used for building mobile and web applications, providing UI components such as buttons, cards, and inputs.
- **Leaflet**: A leading open-source JavaScript library for mobile-friendly interactive maps.
- **Capacitor**: A native runtime for building cross-platform web apps, enabling local storage and offline support.
- **React Router**: A library for navigating between different views (pages) of the application.
- **Context API & useReducer**: Used for managing global state (notes data and UI status).

## Setup & Installation

Follow the steps below to get the application up and running locally.

### 0. Create Ionic App
```bash
ionic start
```


### 1. Clone Repo
Copy code
```bash
`git clone https://github.com/AriiSM/SmartNote`
cd Applicstion
```
### 2. Install dependencies
Install all required dependencies using npm or yarn:

Copy code
```bash
`npm install`
```
### 3. Start the application

To run the application locally in development mode:

Copy code
```bash 
`npm start`
```

This will start the development server and open the application in your browser at `http://localhost:8100`.
## State Management

The application uses **React Context** and **useReducer** to manage the state of notes, including actions for fetching, saving, and updating notes. Here's a quick overview of the main actions:

- **`FETCH_NOTES_STARTED`**: Triggered when notes are being fetched from the server.
- **`FETCH_NOTES_SUCCEEDED`**: Triggered when notes are successfully fetched.
- **`FETCH_NOTES_FAILED`**: Triggered when there is an error fetching notes.
- **`SAVE_NOTE_STARTED`**: Triggered when a note is being saved.
- **`SAVE_NOTE_SUCCEEDED`**: Triggered when a note is successfully saved.
- **`SAVE_NOTE_FAILED`**: Triggered when there is an error saving a note.

## Offline Support

The application uses **Capacitor**'s `Preferences` API to store notes locally when the device is offline. Notes are saved locally and then uploaded to the server once the network connection is restored.

- **`saveLocally`**: Saves a note to the local storage when offline.
- **`saveToServer`**: Syncs local notes to the server when the device is online.

## UI Components

The application makes use of various UI components from the **Ionic Framework**:

- **IonPage**: A wrapper component for creating a page.
- **IonCard**: Used for displaying the details of each note.
- **IonButton, IonIcon, IonTitle**: Used for UI elements such as buttons, icons, and titles.
- **IonImg**: Displays images associated with the notes.
- **IonText**: Renders text elements in the app.