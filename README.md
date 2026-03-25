# R2 Storage Manager

A modern, multi-tenant SaaS platform for managing Cloudflare R2 cloud storage. Built with Next.js 16, React 19, and TypeScript.

## Features

- **Multi-tenant Architecture** — Each user connects their own R2 buckets
- **Authentication** — Email/password with bcrypt hashing + Google & GitHub OAuth
- **Multiple Buckets** — Connect and switch between multiple R2 buckets
- **File Browser** — Grid and list views with sorting, selection, and breadcrumb navigation
- **Drag & Drop Uploads** — Upload files and folders with real-time progress tracking
- **File Preview** — Preview images, videos, PDFs, and code files in-browser
- **Search** — Global file search across your entire bucket
- **Bulk Operations** — Multi-select, copy, cut, paste, download as ZIP, bulk delete
- **Presigned URLs** — Generate shareable temporary links
- **Analytics Dashboard** — Storage usage, file type breakdown, and top files
- **Dark/Light Theme** — System-aware theme with smooth transitions
- **Keyboard Shortcuts** — Power user support (⌘F search, ⌘Z undo, etc.)
- **Context Menus** — Right-click actions on files and folders
- **Responsive Design** — Works on desktop and tablet

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 6 |
| UI | React 19, Tailwind CSS 4, Radix UI, Framer Motion |
| Icons | Lucide React |
| State | Zustand (client), React Query (server) |
| Auth | bcryptjs, HTTP-only session cookies |
| Storage | AWS SDK v3 (S3-compatible for Cloudflare R2) |
| Notifications | Sonner |
| Charts | Recharts |

## Architecture

```
Platform R2 (your bucket)          User R2 (each user's bucket)
┌─────────────────────┐            ┌─────────────────────┐
│  platform-db/       │            │  (user's files)     │
│  ├── users/         │            │  ├── images/        │
│  ├── sessions/      │            │  ├── documents/     │
│  ├── connections/   │            │  └── ...            │
│  └── users-by-email/│            └─────────────────────┘
└─────────────────────┘
    JSON database                    File management
```

- **Platform R2** — Stores user accounts, sessions, and connection credentials as JSON files
- **User R2** — Each user provides their own R2 credentials; the app connects to their bucket for all file operations

## Getting Started

### Prerequisites

- Node.js 18+
- A Cloudflare account with R2 enabled
- An R2 bucket for platform data (user database)

### Setup

1. **Clone the repository**

```bash
git clone https://github.com/AkashSingh-Github/r2-storage-manager.git
cd r2-storage-manager
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Cloudflare R2 credentials:

```env
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_BUCKET_NAME=your_platform_bucket_name
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
```

4. **Run the development server**

```bash
npm run dev
```

5. **Open [http://localhost:3000](http://localhost:3000)**

### OAuth Setup (Optional)

To enable Google/GitHub login:

**Google:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Set redirect URI to `http://localhost:3000/api/auth/google/callback`
4. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env.local`

**GitHub:**
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set callback URL to `http://localhost:3000/api/auth/github/callback`
4. Add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to `.env.local`

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # Auth endpoints (signup, login, logout, OAuth)
│   │   ├── connections/   # R2 bucket connection CRUD
│   │   └── r2/            # File operations (list, upload, download, etc.)
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   └── page.tsx           # Main app (file browser)
├── components/
│   ├── analytics/         # Storage analytics dashboard
│   ├── dashboard/         # Dashboard overview
│   ├── dialogs/           # Modal dialogs (search, rename, delete, connections)
│   ├── file-browser/      # Core file browser (grid, list, toolbar, detail panel)
│   ├── layout/            # Sidebar, header, breadcrumb
│   ├── preview/           # File preview modal
│   ├── providers/         # Theme, query, and auth providers
│   ├── ui/                # Base UI components
│   └── upload/            # Upload zone and progress
├── hooks/                 # Custom React hooks
├── lib/                   # Core libraries (auth, R2 client, utilities)
├── stores/                # Zustand state stores
└── types/                 # TypeScript interfaces
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Create production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## License

MIT
