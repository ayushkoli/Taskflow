import Note from '../models/Note.js';

// ==========================================
// 1. GET ALL NOTES (Supports Search & Pagination)
// ==========================================
export const getNotes = async (req, res) => {
  try {
    // Get query variables from URL (e.g., /api/notes?search=work&page=1)
    // If no values are passed, we define default values
    const search = req.query.search || '';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 6;

    // Step A: Build filter object
    const query = {};
    if (search !== '') {
      // Find notes where title contains search string
      // 'i' means case-insensitive (ignores capital/small letters difference)
      query.title = { $regex: search, $options: 'i' };
    }

    // Step B: Calculate skip count for pagination page math
    // E.g., Page 2 with limit 6 means we skip the first 6 notes: (2 - 1) * 6 = 6
    const skipCount = (page - 1) * limit;

    // Step C: Fetch notes list matching query from MongoDB
    const notes = await Note.find(query)
      .sort({ createdAt: -1 }) // Sort notes newest first
      .skip(skipCount)         // Skip items from previous pages
      .limit(limit);           // Retrieve only requested limit size

    // Step D: Find total notes count matching query (to calculate total pages)
    const totalNotes = await Note.countDocuments(query);

    // Step E: Send back data as JSON response
    res.status(200).json({
      notes: notes,
      currentPage: page,
      totalPages: Math.ceil(totalNotes / limit), // Math.ceil rounds up (e.g. 1.2 pages -> 2 pages)
      totalNotes: totalNotes
    });
  } catch (error) {
    // If a database error occurs, return status 500
    res.status(500).json({ message: 'Error fetching notes', error: error.message });
  }
};

// ==========================================
// 2. GET SINGLE NOTE BY ID
// ==========================================
export const getNoteById = async (req, res) => {
  try {
    // Find note using ID from URL (e.g. /api/notes/65fd...)
    const note = await Note.findById(req.params.id);
    
    // If database returned null (note not found), send 404
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving the note', error: error.message });
  }
};

// ==========================================
// 3. CREATE NEW NOTE
// ==========================================
export const createNote = async (req, res) => {
  try {
    // Extract data sent from React frontend body
    const title = req.body.title;
    const description = req.body.description;
    const color = req.body.color;

    // Validate that inputs are not empty
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    // Create a new Mongoose document instance
    const newNote = new Note({
      title: title,
      description: description,
      color: color
    });

    // Save the document into MongoDB
    const savedNote = await newNote.save();

    // Send back the saved note with success code 201 (Created)
    res.status(201).json(savedNote);
  } catch (error) {
    res.status(500).json({ message: 'Error creating note', error: error.message });
  }
};

// ==========================================
// 4. UPDATE EXISTING NOTE
// ==========================================
export const updateNote = async (req, res) => {
  try {
    // Extract update data from request body
    const title = req.body.title;
    const description = req.body.description;
    const color = req.body.color;

    // Validate that inputs are not empty
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    // Find note by ID and update fields in database
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      {
        title: title,
        description: description,
        color: color
      },
      { new: true } // 'new: true' returns updated document instead of old one
    );

    // If ID doesn't exist, send 404
    if (!updatedNote) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.status(200).json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: 'Error updating note', error: error.message });
  }
};

// ==========================================
// 5. DELETE NOTE
// ==========================================
export const deleteNote = async (req, res) => {
  try {
    // Find note by ID and delete from database
    const deletedNote = await Note.findByIdAndDelete(req.params.id);

    // If note ID was not found, send 404
    if (!deletedNote) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.status(200).json({ message: 'Note deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting note', error: error.message });
  }
};
