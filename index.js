const axios = require('axios');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const apiKey = process.env.OPEN_API_KEY
const express = require('express'); // importing express
const app = express(); // creating an express application
const PORT = process.env.PORT || 8500;
const GeneratedImage = require('./schema'); // Import the Mongoose model


app.use(express.json());
app.use(cors());

//GET Request
app.get("/getall-generated-images", async (request, response) => {
    // Inside an async function or an endpoint handler using async/await
    try {
        const data = await GeneratedImage.find({}).exec();
        console.log(data); // Log the retrieved data

        // Process or send this data as needed
        response.json(data); // For example, send data as a JSON response
    } catch (error) {
        console.error('Error:', error);
        // Handle error
        response.status(500).json({ error: 'An error occurred' });
    }
})

//SAVE Image
app.post('/generate-image', async (req, res) => {
    try {
        console.log(apiKey)
        const postData = {
            prompt: req.body.text,
            // model: 'image-dall-e-3.1', // Choose the DALL·E model
            n: 1, // Number of images to generate
            size: "512x512"
        };

        const response = await axios.post(process.env.OPEN_AI_API, postData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            }
        });
        // Save the response data to MongoDB
        const newGeneratedImage = new GeneratedImage({
            url: response.data.data[0].url,
            // Add more fields from the OpenAI response as needed
        });

        await newGeneratedImage.save();

        res.json(response.data); // Send the generated image data as JSON response
    } catch (error) {
        console.error('Error:', error);
        res.status(error || 500).json({ error: 'An error occurred' });
    }
});

// Route to delete a document by ObjectId
app.delete('/delete-image/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid ObjectId' });
        }

        // Find the document by ObjectId and delete it
        const deletedImage = await GeneratedImage.findByIdAndDelete(id);

        if (!deletedImage) {
            return res.status(404).json({ error: 'Image not found' });
        }

        return res.json({ message: 'Image deleted successfully', deletedImage });
    }
    catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'An error occurred' });
    }
});

mongoose.connect(process.env.MONGO_DB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((err) => console.error('MongoDB connection error:', err));