# Deployment Guide for Medha V2

This guide will help you deploy the Medha V2 application in under 1 hour.

## Architecture Overview
- **Frontend**: Static HTML/CSS/JS (Hosted on Netlify/Vercel/GitHub Pages)
- **Backend**: Python Flask API (Hosted on Render/Railway/Heroku)
- **Database/Auth**: Firebase (Already configured in `js/firebase-config.js`)

---

## Step 1: Deploy the Backend (Python)
The backend is required for AI Question Generation.

1.  **Create a `requirements.txt` file**:
    Ensure the root directory contains a `requirements.txt` with:
    ```
    flask
    flask-cors
    openai
    python-dotenv
    gunicorn
    ```
    *(I have verified `server.py` uses these).*

2.  **Push to GitHub**:
    - Commit all your code to a GitHub repository.

3.  **Deploy to Render.com (Free Tier)**:
    - Sign up/Login to [Render](https://render.com).
    - Click **New +** -> **Web Service**.
    - Connect your GitHub repository.
    - Settings:
        - **Name**: medha-backend
        - **Runtime**: Python 3
        - **Build Command**: `pip install -r requirements.txt`
        - **Start Command**: `gunicorn server:app`
    - **Environment Variables**:
        - Key: `OPENROUTER_API_KEY`
        - Value: `[Your OpenRouter API Key]`
    - Click **Create Web Service**.

4.  **Copy the URL**:
    - Once deployed, Render will give you a URL (e.g., `https://medha-backend.onrender.com`).
    - **IMPORTANT**: Copy this URL.

---

## Step 2: Configure the Frontend
Now point your frontend to the live backend.

1.  Open `js/interactive-quiz.js`.
2.  Find line ~47:
    ```javascript
    const API_BASE_URL = "http://localhost:5000"; // CHANGE THIS...
    ```
3.  Replace `"http://localhost:5000"` with your Render URL (e.g., `"https://medha-backend.onrender.com"`).
    - *Note: Do not add a trailing slash.*

---

## Step 3: Deploy the Frontend
Host the static files.

1.  **Deploy to Netlify (Recommended for ease)**:
    - Go to [Netlify](https://www.netlify.com).
    - Drag and drop your `Medha V2` folder into the "Sites" area.
    - **Boom!** Your site is live.

2.  **Verify**:
    - Open the Netlify URL.
    - Log in.
    - Navigate to a "Games" section and try to start a quiz to verify the AI backend connection.

---

## Connection Troubleshooting
- **CORS Errors**: If you see CORS errors in the console, update `server.py` to explicitly allow your Netlify domain, or leave `CORS(app)` as is (defaults to allow all, which is fine for hackathons).
- **404 API**: Ensure your Render URL in `js/interactive-quiz.js` is correct and doesn't have typos.
