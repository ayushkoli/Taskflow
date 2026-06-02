# Taskflow 📌

Taskflow is a clean, modern MERN Stack Single-Page workspace for managing thoughts and daily tasks. It features colorful, interactive pastel sticky notes and an integrated task checklist styled in a dark-black gradient theme.

## 🚀 Features

- **My Sticky Notes (Left Panel):**
  - Add, edit, and delete notes.
  - Choose customizable pastel colors (yellow, pink, green, blue, purple).
  - Live title search (case-insensitive with 300ms debounce protection).
  - Simple pagination.
- **Task Checklist (Right Panel):**
  - Add checklist tasks inline.
  - Toggle completion (adds a line-through visual style).
  - Filter tasks (All, Pending, Completed).
- **Dark Theme:** Premium dark-black gradient background (`bg-gradient-to-br from-neutral-950 via-[#0d0d0f] to-black`) with sleek frosted-glass containers.
- **Delete Confirmation:** Safety modals to prevent accidental deletions.

## 🛠️ Tech Stack

- **Frontend:** React (Vite), Tailwind CSS v3, Axios, Lucide Icons
- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose (Atlas Cloud connection)

## 💻 Local Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/ayushkoli/Taskflow.git
   cd Taskflow
   ```

2. **Configure the Database (.env):**
   Create a `.env` file in the `backend/` folder and paste your MongoDB connection URI:
   ```text
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/taskflow-db?retryWrites=true&w=majority
   ```

3. **Start the Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

4. **Start the Frontend:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   Open `http://localhost:3000` in your web browser.
