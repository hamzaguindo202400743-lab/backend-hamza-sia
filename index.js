const express = require('express');
const app = express();

// Import our character "database"
let characters = require('./db.js');

// Middleware to parse JSON bodies
app.use(express.json());

// PORT configuration for Render deployment
const PORT = process.env.PORT || 3000;

// --- API Endpoints ---

// 1. GET /characters - Get all characters
app.get('/characters', (req, res) => {
  res.status(200).json(characters);
});

// 2. GET /characters/:id - Get a single character by ID
app.get('/characters/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const character = characters.find(c => c.id === id);

  if (character) {
    res.status(200).json(character);
  } else {
    res.status(404).json({ message: "Character not found" });
  }
});

// 3. POST /characters - Add a new character
app.post('/characters', (req, res) => {
  const { name, type, health, damage } = req.body;

  if (!name || !type || health === undefined || damage === undefined) {
    return res.status(400).json({ message: "Missing required fields: name, type, health, damage" });
  }

  const newId = characters.length > 0 ? Math.max(...characters.map(c => c.id)) + 1 : 1;
  const newCharacter = {
    id: newId,
    ...req.body
  };
  
  characters.push(newCharacter);
  res.status(201).json(newCharacter);
});

// 4. PUT /characters/:id - Update an existing character
app.put('/characters/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const characterIndex = characters.findIndex(c => c.id === id);

  if (characterIndex === -1) {
    return res.status(404).json({ message: "Character not found" });
  }

  const updatedCharacter = { ...characters[characterIndex], ...req.body };
  characters[characterIndex] = updatedCharacter;
  
  res.status(200).json(updatedCharacter);
});

// 5. DELETE /characters/:id - Delete a character
app.delete('/characters/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const characterIndex = characters.findIndex(c => c.id === id);

  if (characterIndex === -1) {
    return res.status(404).json({ message: "Character not found" });
  }

  characters = characters.filter(c => c.id !== id);
  res.status(200).json({ message: `Character with id ${id} deleted successfully` });
});

// 6. GET /characters/type/:type - Filter characters by type (Plant/Zombie)
app.get('/characters/type/:type', (req, res) => {
  const type = req.params.type.toLowerCase();
  if (type !== 'plant' && type !== 'zombie') {
    return res.status(400).json({ message: "Invalid type. Must be 'plant' or 'zombie'." });
  }

  const filtered = characters.filter(c => c.type.toLowerCase() === type);
  res.status(200).json(filtered);
});

// 7. GET /search?name=... - Search for characters by name
app.get('/search', (req, res) => {
    const { name } = req.query;
    if (!name) {
        return res.status(400).json({ message: "Search query 'name' is required." });
    }

    const results = characters.filter(c => c.name.toLowerCase().includes(name.toLowerCase()));
    res.status(200).json(results);
});

// 8. GET /stats - Get basic stats about the character list
app.get('/stats', (req, res) => {
    const total = characters.length;
    const plants = characters.filter(c => c.type === 'Plant').length;
    const zombies = characters.filter(c => c.type === 'Zombie').length;
    
    res.status(200).json({
        totalCharacters: total,
        plantCount: plants,
        zombieCount: zombies
    });
});

// 9. GET /random - Get a random character
app.get('/random', (req, res) => {
    if (characters.length === 0) {
        return res.status(404).json({ message: "No characters available to choose from." });
    }
    const randomIndex = Math.floor(Math.random() * characters.length);
    res.status(200).json(characters[randomIndex]);
});

// 10. GET /characters/strongest - Get the character with the highest damage
app.get('/characters/strongest', (req, res) => {
    if (characters.length === 0) {
        return res.status(404).json({ message: "No characters available." });
    }
    const strongest = characters.reduce((prev, current) => (prev.damage > current.damage) ? prev : current);
    res.status(200).json(strongest);
});


// Global error handler for unhandled errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong on the server!" });
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});