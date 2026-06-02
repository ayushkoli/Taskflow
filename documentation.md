# Project Documentation: MERN Sticky Notes & Todo Workspace (Taskflow)

This project is a beginner-friendly MERN (MongoDB, Express, React, Node.js) Stack application. The entire UI is built on a single unified dashboard-less screen named **Taskflow**, featuring **colorful pastel sticky notes** and a **basic todo checklist** on the side, styled with a premium **black gradient dark theme**.

---

## 1. Folder Structure Explanation

The codebase is organized cleanly to separate backend and frontend operations:

```text
notes project/
├── backend/
│   ├── config/
│   │   └── db.js            # Database connection logic via Mongoose
│   ├── controllers/
│   │   ├── noteController.js# Notes CRUD handlers (handles title search, pagination, and color choices)
│   │   └── todoController.js# Todos CRUD handlers (handles adding, toggling completion, and filtering)
│   ├── models/
│   │   ├── Note.js          # Mongoose Schema defining Sticky Notes (with 'color' field)
│   │   └── Todo.js          # Mongoose Schema defining tasks
│   ├── routes/
│   │   ├── noteRoutes.js    # Routes mapping /api/notes endpoints
│   │   └── todoRoutes.js    # Express route mappings for Todo APIs
│   ├── .env                 # Server configuration environment variables
│   ├── package.json         # Backend node scripts and express/mongoose dependencies
│   └── server.js            # Entry server launching Express and mounting routes
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DeleteModal.jsx# Reusable dark delete confirmation overlay
│   │   │   └── Toast.jsx     # Reusable popup dark toast alerts
│   │   ├── services/
│   │   │   └── api.js        # Axios network services for Note & Todo requests
│   │   ├── App.jsx           # Unified single-screen layout with dark-black gradient theme
│   │   ├── index.css         # Styling, Tailwind imports, and transition keyframes
│   │   └── main.jsx          # React app DOM mounting entry script
│   ├── index.html            # Core HTML template containing Google Font imports
│   ├── postcss.config.js     # PostCSS configuration for compilation
│   ├── tailwind.config.js    # Tailwind color palette and typography theme overrides
│   ├── vite.config.js        # Vite config with backend server proxy definitions
│   └── package.json          # React dependencies and vite tooling
└── documentation.md          # Comprehensive user manual (this file)
```

---

## 2. Database Models (MongoDB Schemas)

Mongoose provides schema validation for our database objects:

### Note Model (`backend/models/Note.js`)
Stores pastel sticky notes:
```javascript
{
  title: String,        // Required, trimmed
  description: String,  // Required content
  color: String,        // Pastel background ('yellow', 'pink', 'green', 'blue', 'purple'), defaults to 'yellow'
  createdAt: Date       // Creation timestamp, defaults to Date.now
}
```

### Todo Model (`backend/models/Todo.js`)
Stores simple checklist tasks:
```javascript
{
  task: String,         // Required task content description
  completed: Boolean,   // Status tracking indicator, defaults to false
  createdAt: Date       // Creation timestamp, defaults to Date.now
}
```

---

## 3. API Documentation

| Method | Endpoint | Description | Query Parameters |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/notes` | Get paginated list of notes | `search` (filter titles), `page` (current page, default `1`), `limit` (max notes, default `6`) |
| **GET** | `/api/notes/:id` | Fetch a single note object | None |
| **POST** | `/api/notes` | Create a new sticky note | Req Body: `{ "title": "...", "description": "...", "color": "yellow" }` |
| **PUT** | `/api/notes/:id` | Update note details | Req Body: `{ "title": "...", "description": "...", "color": "pink" }` |
| **DELETE**| `/api/notes/:id` | Remove note document | None |
| **GET** | `/api/todos` | Get filtered tasks | `completed` (`true` or `false` or none for all) |
| **POST** | `/api/todos` | Add a new pending task | Req Body: `{ "task": "..." }` |
| **PUT** | `/api/todos/:id` | Toggle task completion / update task text | Req Body: `{ "completed": true/false }` |
| **DELETE**| `/api/todos/:id` | Permanently remove task | None |

---

## 4. Backend Flow (Request-Response Cycle)

When the frontend initiates a request:
1. **Request Dispatch:** Frontend triggers a request via Axios (e.g. `POST /api/notes` with JSON payload `{ title, description, color }`).
2. **Server Middleware:** In `server.js`, CORS headers are appended, the JSON body parser reads the payload, and request is forwarded to `routes/noteRoutes.js`.
3. **Routing Match:** Route matches `POST /` on notes path and triggers the `createNote` controller.
4. **Controller Logic:** The controller (`noteController.js`) validates that `title` and `description` are present, instantiates a `new Note()`, and saves it via `await newNote.save()`.
5. **Database Interaction:** MongoDB saves the document and responds with the generated record (including `_id` and default values).
6. **Express Response:** The controller returns the record to the client with `201 Created` status code as a JSON response. In case of errors, a `500` status with error details is sent back.

---

## 5. Frontend Flow (Single-Page Setup)

The React client mounts without routers:
1. **App Mount (`main.jsx`):** Bootstraps `<App />` into the DOM.
2. **Single Workspace (`App.jsx`):** Renders a responsive top navbar and a grid layout containing the sticky note board on the left and the task checklists sidebar on the right.
3. **API Fetching (`useEffect`):** On component mount, the app queries `notesService.getNotes()` and `todosService.getTodos()` to populate initial cards and lists.
4. **Sticky Notes CRUD:**
   - Notes are represented as pastel cards colored according to their `color` state mapping (e.g. `bg-amber-100` for yellow, `bg-rose-100` for pink).
   - Adding a note opens a modal popup where you can choose content and choose a color (represented as visual circles).
   - Validation ensures both title and content are typed before posting.
   - Editing loads the note's active values into the form modal.
   - Deletions display the `<DeleteModal />` confirmation dialog before firing the API.
5. **Todo Management:**
   - Tasks are added via an inline input box on the checklist card.
   - Checking a circle marks a task completed (adding a line-through styling) and posts the change to the backend.
   - Filters (All, Pending, Completed) toggle the displayed list.

---

## 6. How to Run the Project Locally

### Prerequisites
1. **Node.js** (v16.0 or higher)
2. **MongoDB** (Local instance running at `mongodb://127.0.0.1:27017` or Atlas URL)

### Execution Steps
1. **Start the Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   *Verify console says "Server running on port 5000" and "MongoDB Connected".*

2. **Start the Frontend:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   *Open the access link `http://localhost:3000` to interact with the application.*

---

## 7. MERN Interview Questions & Answers

### Q1: Why did you merge the Notes and Todos interfaces onto a single page?
**Answer:**
A single-page split layout creates a unified dashboard-less workspace. It eliminates the need for React Router, which reduces boilerplate code and keeps the codebase simple and readable for junior-level interviews, while providing an intuitive desktop experience where users can see thoughts and tasks side-by-side.

### Q2: How did you implement the sticky note color feature?
**Answer:**
We added a `color` field of type `String` to the Mongoose `Note` schema. On the frontend, when creating or editing a note, a color selector updates the form state. The note is sent to the backend with the selected color, and when rendered, React references a style dictionary that maps the color name to pastel Tailwind classes (`bg-amber-100`, `bg-rose-100`, etc.).

### Q3: What is Debouncing, and why is it used on the notes search bar?
**Answer:**
Debouncing is a technique used to limit the rate of execution of a function. In our search bar, instead of triggering a database query on every character input, we delay the search call by 300ms using a timeout inside a `useEffect` hook. If the user types another character before 300ms, the previous timeout is cancelled. This prevents overloading the MongoDB database with unnecessary text queries.

### Q4: How is deletion made safe in this application?
**Answer:**
To prevent accidental deletions, we implemented a reusable `<DeleteModal />` component. Clicking a delete button does not trigger the API immediately. Instead, it prompts an overlay modal with confirmation and cancel buttons. The API is called only when the user confirms, providing a standard, professional UX flow.

### Q5: How do you handle relative URL API requests in React development?
**Answer:**
We configured a dev server proxy in Vite (`vite.config.js`). Any requests starting with `/api` are automatically redirected by Vite to `http://localhost:5000`, solving CORS (Cross-Origin Resource Sharing) restrictions and allowing us to use clean relative paths like `/api/notes` instead of hardcoded backend server URLs.
