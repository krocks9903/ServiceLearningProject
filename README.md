# 🌱 Service Learning Project – Team Setup Guide

This project is a **Volunteer Hours Management App** built with:  
- **Frontend:** React + Vite + TypeScript + Material UI (MUI)  
- **Backend:** Supabase (Postgres, Auth, Storage, RLS)  
- **Hosting:** Vercel (frontend), Supabase (backend)  

---

## 1. Open VS Code
- Launch **Visual Studio Code**.  
- Open the folder where you want this project to live (like Desktop or a `Projects/` folder).  

---

## 2. Clone the Repository
In the VS Code terminal (`` Ctrl + ` ``), run:  
```bash
git clone https://github.com/krocks9903/ServiceLearningProject.git
cd ServiceLearningProject
```

This downloads the project from GitHub and enters the folder.

---

## 3. Open the Project in VS Code
- Open the `ServiceLearningProject` folder in VS Code.
- You should see folders like `src/`, `public/`, and files like `package.json`.

---

## 4. Install Dependencies
Run this once to install everything from `package.json`:

```bash
npm install
```

This creates the `node_modules` folder (not tracked in Git).

---

## 5. Setup Environment Variables
1. In the project root, create a file called:
   ```
   .env.local
   ```

2. Add your Supabase credentials (these will be shared separately):
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

⚠️ Do **not** commit this file — it's in `.gitignore`.

---

## 6. Run the Development Server
Start the app locally:

```bash
npm run dev
```

Then open the link in your browser (usually `http://localhost:5173`).

---

## 7. Git Workflow (Important!)
- Always branch off `main` before starting work:
  ```bash
  git checkout main
  git pull origin main   # get latest changes
  git checkout -b feature/your-feature-name
  ```

- After coding:
  ```bash
  git add .
  git commit -m "Add: your feature description"
  git push origin feature/your-feature-name
  ```

- Go to GitHub → open a **Pull Request** into `main`.

---

## 8. Folder Structure
We already created folders to keep work organized:

```
src/
├── components/       # UI building blocks
│   ├── auth/         # login/signup forms
│   ├── dashboard/    # dashboard widgets
│   ├── profiles/     # volunteer profile components
│   ├── scheduling/   # events/shifts UI
│   ├── kiosk/        # check-in/check-out UI
│   └── shared/       # navbars, buttons, modals
├── hooks/            # custom React hooks
├── services/         # Supabase client, APIs
├── types/            # TypeScript interfaces
├── utils/            # helper functions
└── pages/            # top-level routes
```

---

## 🎯 Week 1 Goal
- Everyone can run the app locally
- Auth page & Supabase schema in progress
- Profile + Dashboard skeletons in place
- Branches are created and no one pushes directly to `main`

✅ Once everyone has this setup running, we can start building features in **parallel**.

---

## Quick Start for Teammates

For a quick setup reference:

```bash
git clone https://github.com/krocks9903/ServiceLearningProject.git
cd ServiceLearningProject
npm install
# Create .env.local with Supabase credentials
npm run dev
```
