// Import required libraries and modules
const express = require('express');
const axios = require('axios');

// Create an Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON request body
app.use(express.json());

// Define the POST route for retrieving GitHub user information
app.post('/', async (req, res) => {
  const { developers } = req.body; // Get the list of developers from the request body

  if (!developers || !Array.isArray(developers)) {
    return res.status(400).json({ error: 'Invalid input. Send a JSON object with an array of developers.' });
  }

  try {
    // Fetch user information for each developer
    const developerPromises = developers.map(async (username) => {
      const response = await axios.get(`https://api.github.com/users/${username}`);
      const { name, bio } = response.data;

      return { name, bio };
    });

    const developerInfo = await Promise.all(developerPromises);
    res.json(developerInfo);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});