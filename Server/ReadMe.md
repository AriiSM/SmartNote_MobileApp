# Koa API with JWT Authentication and WebSocket Broadcasting

This project provides a RESTful API using Koa.js, with JWT-based authentication, WebSocket support, and basic CRUD operations on a notes resource. It also includes paginated, filtered, and searchable data retrieval for efficient data management. This backend server is well-suited for applications requiring secure, real-time data handling and user authentication.

## Features

- **JWT Authentication**: Secure login and token-based access control for authorized users only.
- **RESTful API**: Supports CRUD operations for notes with a paginated and filtered data retrieval feature.
- **WebSocket Support**: Real-time broadcasting of changes to connected clients using WebSocket.
- **Modular Code Structure**: Organized code structure for easy maintenance and extension.
- **Error Handling and Logging**: Comprehensive error handling and timing logging for efficient debugging.

## Project Structure

- **`auth.js`**: Handles authentication with login and token generation.
- **`note.js`**: Defines routes and operations for creating, updating, retrieving, and deleting notes.
- **`repoDB.js`**: Provides database-like storage, managing JSON data files for notes and users.
- **`wss.js`**: Manages WebSocket initialization and broadcasts messages to clients.
- **`utils.js`**: Contains utility functions for JWT configuration, error handling, and request timing logging.

## Getting Started

### Prerequisites

- **Node.js** >= 12.0.0
- **npm** package manager

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/username/repository-name.git
    cd repository-name
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Configure JSON storage files for data in the `data` directory:
   - `data/users.json` for user data
```{"notes": [
        {
        "titlu": "",
        "descriere": "",
        "prioritate": (number),
        "data": "",
        "completat": true,
        "userID": "",
        "photo": null,
        "coords": {
            "lat": "",
            "lng": ""
        },
        "id": ""
        },
    ]
    }
```
   - `data/notes.json` for notes data
```
    {
    "users": [
        {
        "username": "",
        "password": "",
        "id": ""
        },
    ]
    }
```

### Running the Server

1. Start the server using:

    ```bash
    npm start
    ```

2. The server will run at `http://localhost:3000`.

## API Endpoints

### Authentication

- **`POST /api/auth/login`**: Authenticate a user and return a JWT token if successful.

### Notes (Protected)

- **`GET /api/note`**: Retrieve all notes for the authenticated user.
- **`GET /api/note/page/:nr`**: Retrieve paginated notes for the authenticated user.
- **`GET /api/note/page/:nr/:search?`**: Search for notes by title for the authenticated user.
- **`GET /api/note/page/:nr/filter/:filter?`**: Filter notes by specified criteria (e.g., completed, high priority).
- **`POST /api/note`**: Create a new note.
- **`PUT /api/note/:id`**: Update an existing note by ID.
- **`DELETE /api/note/:id`**: Delete a note by ID.

## WebSocket Broadcasting

The server broadcasts note changes (create, update, delete) in real-time to connected clients. Clients should connect to the WebSocket server with their JWT for authentication.

## Environment Variables

Configure the JWT secret and CORS settings in the `utils.js` file as needed.