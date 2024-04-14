# Smart Evaluator

## Usage

### Configuration
First you must initialize .env in /backend
```bash
cd backend
nano .env
```

the contents should be
```
OPENAI_API_KEY=
MONGO_DB_USERNAME=
MONGO_DB_PASSWORD=
```
enter relevant data

(Case sensitive)
The mongoDB should be structured as such:
```
Backend_Database.Item
Backend_Database.Session
Backend_Database.System_Data
```

### To start the server after configuring

```
npm install
npm start
```

### Networking, exposing to internet
The backend server and frontend server should be on the same machine  
```
Backend Server Port: 5001  
Frontend Server Port: 5173  
```
NOTE: The backend server port should only be exposed to IPs that can use the API. The user of the API should be able to provide usage of the API through their own interface securely. Direct access to the API by the end user will result in the end user being able to view any session and item.  
For simple demo purposes, you can use apache2 and reverse proxy port 5173.


## API Endpoints Documentation

  

This document outlines the usage and functionality of the API endpoints available in this Express.js application.

### 1. POST /upload - Upload Spreadsheet and Create Session

#### Purpose

Accepts an Excel file containing items data, processes it, and creates a new session in the database with items categorized as 'uncompleted_items'.

#### Request

-  **Method**: POST

-  **Endpoint**: `/upload`

-  **Body**: Form-data with key `excelFile` containing the Excel file to be uploaded.

-  **Content-Type**: multipart/form-data

#### Response

-  **Content-Type**: application/json

-  **Body**:

```json
{
"_id": "<SessionID>",
"uncompleted_items": ["<ItemID1>", "<ItemID2>", "..."]
}
```

  

### 2. GET /itemVendibility - Calculate Item Vendibility

#### Purpose

Accepts a `sessionId` and an `itemId`, checks if the item exists in the given session, and returns vendibility information for the item.

#### Request

-  **Method**: GET

-  **Endpoint**: `/itemVendibility`

-  **Query Parameters**:

-  `sessionId`: The ID of the session to search within.

-  `itemId`: The ID of the item to analyze for vendibility.

  

#### Response

-  **Content-Type**: application/json

-  **Body**: JSON object containing vendibility analysis results. The structure of this object depends on the implementation of `dataAnalysis()` function.

  

### 3. GET /getSessionIDs - Retrieve Session IDs

  

#### Purpose

Retrieves all session IDs from the database along with their completed and uncompleted items.

  

#### Request

-  **Method**: GET

-  **Endpoint**: `/getSessionIDs`

  

#### Response

-  **Content-Type**: application/json

-  **Body**:

```json
{
"_ids": ["<SessionID1>", "<SessionID2>", "..."],
"completedItems": [[], [], "..."],
"uncompletedItems": [[], [], "..."]
}
```

### Error Handling

All endpoints respond with appropriate HTTP status codes and error messages in case of failures. Common responses include:

-  **Status 500 (Internal Server Error)**: When an unexpected condition was encountered.

-  **Status 400 (Bad Request)**: When the request cannot be processed due to client-side errors (e.g., missing or invalid parameters).

### 4. GET /getItem - Retrieve Item Data

#### Purpose

Fetches item data if it exists within a specified session.

#### Request

-  **Method**: GET

-  **Endpoint**: `/getItem`

-  **Query Parameters**:

-  `sessionId`: The ID of the session.

-  `itemId`: The ID of the item.

#### Response

-  **Content-Type**: application/json

-  **Body**: JSON object containing the item's data if found, otherwise an error message.

### 5. POST /createSession - Create New Session

#### Purpose

Creates a new session in the database and returns its ID.

#### Request

-  **Method**: POST

-  **Endpoint**: `/createSession`

#### Response

-  **Content-Type**: application/json

-  **Body**:

```json
{
"sessionId": "<NewSessionID>"
}
```

  

### 6. POST /addItem - Add Item to Session

#### Purpose

Adds a new item to a specified session. The item data must be provided in JSON format.

#### Request

-  **Method**: POST

-  **Endpoint**: `/addItem`

-  **Body**: JSON object containing the item's data and the session ID it should be added to.

#### Response

-  **Content-Type**: application/json

-  **Body**:
- 
```json
{
"success": true
}
```

#### Notes

- The JSON body for adding an item should match the specified format, with optional fields as necessary.

### 7. GET /getTableFromSessionID - Get Table Data From Session ID

#### Purpose

Returns table data for a specified session ID, including both completed and uncompleted items.

#### Request

-  **Method**: GET

-  **Endpoint**: `/getTableFromSessionID`

-  **Query Parameters**:

-  `sessionID`: The ID of the session for which to retrieve table data.

#### Response

-  **Content-Type**: application/json

-  **Body**: JSON object containing an array of items associated with the session.

### Error Handling

All endpoints include error handling and will respond with appropriate HTTP status codes and messages in case of failures.
  
### Notes

- It's important to ensure that the Excel file follows the expected format and contains data starting from the specified rows and columns as assumed by the `/upload` endpoint logic.

- For the `/itemVendibility` endpoint, ensure that both `sessionId` and `itemId` are provided as query parameters.

- This API assumes that the client is responsible for managing session lifecycle and item vendibility analysis workflow.

- Ensure proper handling and validation of request data to avoid errors.

- For `/addItem`, ensure the item JSON matches the expected schema as closely as possible to prevent insertion issues.