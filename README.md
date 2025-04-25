# Crollo

A full-stack note taking website built using **NextJS**, **Tanstack-Query** for state-management, **Supabase** for database and authentication, **Tailwind-CSS** and **ShadCN** for styling, and **Gemini-API** for note-summarization.

---

## Features

- **User Authentication:** Login,Register, and Logout with email/password or Google OAuth (via Supabase Auth).
- **Notes CRUD:** Create, read, update, and delete notes. Each note supports rich text formatting.
- **AI Summary:** Instantly generate concise summaries of your notes using an integrated Google's Gemini-API.
- **Auto-Save & Summarize:** Notes can be summarized and changes are saved in real-time.
- **Responsive UI:** Built using Tailwind CSS and Shadcn for a modern, accessible experience.

---

## Getting Started

### Prerequisites
- **Node.js** (v18 or newer recommended)
- **npm** (v9 or newer) or **yarn** or **pnpm**
- **Supabase** project (get your API keys and URL)
- **Gemini API Key** (for AI summarization)

### 1. Clone the Repository
```bash
git clone https://github.com/ChinmayNoob/notesassignment.git
cd notesassignment
```

### 2. Install Dependencies
```bash
pnpm install
# or
npm install
# or
yarn install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory and add:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_GENERATIVE_API_KEY=your_google_api_key
```

### 4. Run the Development Server
```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) to use the app.

You can also try the deployed version here: [https://notesassignment.vercel.app/](https://notesassignment.vercel.app/)

---

