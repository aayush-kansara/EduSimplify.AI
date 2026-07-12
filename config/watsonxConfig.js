require("dotenv").config();

module.exports = {
  apiKey: process.env.IBM_API_KEY,
  projectId: process.env.IBM_PROJECT_ID,
  url: process.env.IBM_URL,
  model: process.env.IBM_MODEL
};