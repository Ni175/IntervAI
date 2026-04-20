# IntervAI

> **Practice. Get Feedback. Get Hired.**

IntervAI is a full-stack, single-page web application designed to simulate real-world job interviews using Artificial Intelligence. Powered by the Google Gemini API, it allows candidates to practice customized interview questions tailored strictly to their desired role, experience level, and interview type.

## Features

- **🎯 Role-Specific Configuration**: Select from Software Engineer, Product Manager, Data Analyst, UX Designer, and more alongside seniority levels.
- **🤖 Gemini-Powered Interrogation**: Dynamically generates context-aware questions instantly.
- **📈 Real-Time Feedback Evaluation**: Receive instantaneous scoring out of 10, strengths, improvement areas, and model ideal answers after every response.
- **📊 Comprehensive Post-Interview Report**: Displays an interactive Recharts Donut distribution of performance efficiency and overarching feedback.
- **✨ Premium Dark UI**: Smooth, glassmorphic aesthetic built purely with vanilla CSS and Lucide React icons.

## Technology Stack

- React + Vite
- Recharts
- `@google/generative-ai` (Gemini 2.5 Flash Model)
- Vanilla CSS 

## Local Setup

1. Install dependencies: `npm install`
2. Create a `.env` file referencing your Gemini key:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. Run locally: `npm run dev`

## Deployment
Deployed on Google Cloud via Firebase Hosting. 

1. `npm install -g firebase-tools`
2. `firebase login`
3. `firebase init hosting`
4. `npm run build && firebase deploy`
