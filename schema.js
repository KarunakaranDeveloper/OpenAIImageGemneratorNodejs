const mongoose = require('mongoose');

const generatedImageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  // Add more fields as needed from the OpenAI response
});

const GeneratedImage = mongoose.model('GeneratedImage', generatedImageSchema);

module.exports = GeneratedImage;