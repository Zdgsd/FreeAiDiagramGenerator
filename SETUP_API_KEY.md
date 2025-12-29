# How to Configure the Gemini API Key

This application requires a Google Gemini API Key to generate diagrams. Follow these steps to set it up.

## 1. Get your API Key
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Click **"Get API key"**.
3. Create a key in a new or existing Google Cloud project.
4. Copy the key string (it starts with `AIza...`).

## 2. Local Development Setup

To run the app on your computer:

1.  **Create a file** named `.env` in the root directory of this project (at the same level as `package.json` and `vite.config.ts`).
2.  **Paste your key** into the file like this:

    ```env
    API_KEY=paste_your_actual_api_key_here
    ```

3.  **Save the file**.
4.  **Restart your development server** if it is running:
    *   Press `Ctrl + C` in your terminal to stop it.
    *   Run `npm run dev` again.

> **Note:** Do not commit the `.env` file to public repositories (GitHub, GitLab, etc.) to keep your key secure.

## 3. Deployment Setup (Vercel)

If you are deploying this app to the web using Vercel:

1.  Go to your Vercel Project Dashboard.
2.  Navigate to **Settings** > **Environment Variables**.
3.  Add a new variable:
    *   **Key:** `API_KEY`
    *   **Value:** `paste_your_actual_api_key_here`
4.  Click **Save**.
5.  **Redeploy** your project for the changes to take effect.

## Troubleshooting

*   **"Invalid API Key" Error:** Double-check that you pasted the key correctly in the `.env` file without extra spaces or quotes.
*   **App Crash on Start:** Ensure the `.env` file is named exactly `.env` (not `.env.txt` or `config.env`).
