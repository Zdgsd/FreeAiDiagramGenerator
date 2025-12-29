# How to Configure the Gemini API Key

This application requires a Google Gemini API Key to generate diagrams.

## 1. Get your API Key
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Click **"Get API key"**.
3. Create a key in a new or existing Google Cloud project.
4. Copy the key string (it starts with `AIza...`).

## 2. Production Deployment (Vercel) - **Recommended**

If you are deploying this app to the web using Vercel:

1.  Go to your Vercel Project Dashboard.
2.  Navigate to **Settings** > **Environment Variables**.
3.  Add a new variable:
    *   **Key:** `API_KEY`
    *   **Value:** `paste_your_actual_api_key_here`
4.  Click **Save**.
5.  **Redeploy** your project for the changes to take effect.

## 3. Local Development (Optional)

To run the app on your computer locally:

1.  **Create a file** named `.env` in the root directory (same level as `package.json`).
2.  **Paste your key**:
    ```env
    API_KEY=paste_your_actual_api_key_here
    ```
3.  **Run** `npm run dev`.

> **Security Warning:** The `.gitignore` file is configured to exclude `.env` from git commits. Never manually add or commit your `.env` file to a public repository.
