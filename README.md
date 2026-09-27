# Habit Tracker

A simple web app for building good habits. Create an account, add the habits you want to keep up with, and check them off each day. The app tracks your current streak and how many times you've completed each habit.

**Live app:** https://habit-tracker2094.netlify.app/

**Demo video:** _YouTube link coming soon_

## What the app does

- **Register, log in, and log out.** You stay logged in when you refresh the page.
- **Add a habit** with a name and optional notes
- **View your habits.** Each user only sees their own habits.
- **Mark a habit done for today** (click again to undo)
- **Streaks:** see how many days in a row you've kept up each habit, plus the total times you've done it
- **Edit** a habit's name or notes
- **Delete** a habit

## Technologies used

- **HTML, CSS, and JavaScript** for the frontend (no framework or build step)
- **Back4App (Parse)** for the database and user accounts, using the Parse JavaScript SDK
- **Netlify** for hosting
- **Claude Code** as the AI coding tool used to build the app

## How it works

- `index.html` has the page layout: the log in / register screen and the habits screen.
- `app.js` handles registering, logging in, and logging out with `Parse.User`.
- `habits.js` handles everything with habits. It creates, reads, updates, and deletes rows in the `Habit` table, and calculates streaks.
- `styles.css` has the styling.
- `config.js` holds the Back4App App ID and JavaScript Key. These are client-side keys and are meant to be public.

Each habit is saved in a `Habit` table with these fields:

| Field | Type | Description |
| --- | --- | --- |
| `name` | String | The habit's name |
| `notes` | String | Optional notes |
| `checkIns` | Array | Dates the habit was completed (`YYYY-MM-DD`) |
| `owner` | Pointer to User | The user who created it |

Every habit gets an access control list (ACL) so only its owner can read or change it.

## Setup instructions

1. Clone the repo:
   ```
   git clone https://github.com/inky-0/habit-tracker.git
   cd habit-tracker
   ```
2. Create a free app on [Back4App](https://www.back4app.com/). Go to **App Settings → Security & Keys** and copy the **Application ID** and **JavaScript Key**.
3. Put them in `config.js`:
   ```js
   const BACK4APP_APP_ID = "your app id";
   const BACK4APP_JS_KEY = "your javascript key";
   ```
4. Run it locally with any static server, for example:
   ```
   python3 -m http.server 8000
   ```
   Then open http://localhost:8000. The `Habit` table is created automatically the first time you add a habit.
5. To deploy, import the repo on [Netlify](https://www.netlify.com/). There is no build command, and the publish directory is the repo root.
