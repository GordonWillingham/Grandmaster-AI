♟️ Grandmaster AI Chess

Grandmaster AI Chess is an interactive chess application powered by AI, designed to analyze positions, suggest optimal moves, and provide a challenging opponent experience. The application is built using modern web technologies and integrates with Google’s Gemini API to deliver intelligent, real-time gameplay and analysis.

This repository contains everything needed to run the application locally and deploy it via AI Studio.

🚀 Run and Deploy Your AI Studio App

This project is fully compatible with AI Studio and can be run locally for development or testing.

View the App in AI Studio

You can access the deployed version of the application here:

https://ai.studio/apps/drive/1mTGhd2Xwv2G3MPdX4HzCTrrQbHIHqVlp

🧑‍💻 Run Locally
Prerequisites

Node.js (LTS version recommended)

A valid Gemini API key

Installation & Setup

Install dependencies

npm install


Configure environment variables

Create a file named .env.local in the root directory and add:

GEMINI_API_KEY=your_gemini_api_key_here


Run the application

npm run dev


Open your browser and navigate to the local development URL (typically http://localhost:3000).

🧠 Features

AI-powered chess analysis and move generation

Real-time interaction with Gemini models

Clean, modern UI optimized for gameplay and analysis

Local development support with hot reloading

Easy deployment via AI Studio

📦 Project Structure (High Level)

src/ – Application source code

public/ – Static assets

.env.local – Environment variables (not committed)

package.json – Dependencies and scripts

🔐 Security Notes

Never commit your GEMINI_API_KEY to source control.

Use environment variables for all sensitive credentials.

📄 License

This project is intended for educational and experimental use. Please ensure compliance with all applicable API terms of service when deploying or extending this application.
