# logs. — Personal Journal & Visual Chronicles

A full-stack, personal digital notebook designed with a calm, modern **deep blue aesthetic**. Capture daily reflections, attach photos, and preserve memories with ease.

---

## ✦ Architecture

```
React + Vite (Tailwind CSS) ──> Spring Boot REST API ──> PostgreSQL (Metadata & Paths)
                                          │
                                          └──> Supabase Storage (Original Images)
```

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Backend**: Java 21 + Spring Boot 3 + Maven
- **Database**: PostgreSQL (persisting entries and image references)
- **Image Storage**: Supabase Storage
- **Security & Privacy**: The frontend **only** communicates with the Spring Boot backend. No direct client-to-Supabase connections.

---

## ✦ Design Aesthetic

- **Deep Navy & Dark Blue Palette**: `#050811`, `#090e1c`, subtle glowing borders (`border-blue-900/40`).
- **Typography**: Refined serif titles (`Lora`) and crisp modern body text (`Plus Jakarta Sans`).
- **Notebook Feel**: No corporate dashboard clutter. Minimalist, focused writing space with photo lightbox presentation.

---

## ✦ Project Structure

```
logs/
├── frontend/               # React + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── api/            # API client (fetch)
│   │   ├── components/     # Navbar, EntryCard, DetailModal, EditorModal, Lightbox, Toasts
│   │   ├── types/          # TypeScript interfaces
│   │   ├── App.tsx         # Main application controller
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── backend/                # Java 21 + Spring Boot 3
│   ├── src/
│   │   ├── main/java/com/logs/journal/
│   │   │   ├── config/     # CORS & Environment loaders
│   │   │   ├── controller/ # REST Controllers (/api/entries, /api/entries/{id}/images)
│   │   │   ├── dto/        # Request & Response transfer objects
│   │   │   ├── entity/     # JPA Entities (Entry, EntryImage)
│   │   │   ├── exception/  # Global error handler
│   │   │   ├── repository/ # Spring Data JPA Repositories
│   │   │   └── service/    # Business logic & Supabase Storage integration
│   │   └── resources/
│   │       └── application.properties
│   ├── pom.xml
│   └── mvnw
├── docker-compose.yml      # Local PostgreSQL 16 container
├── .env.example            # Environment template
└── README.md
```

---

## ✦ Prerequisites

- **Java**: 21+ (OpenJDK, Eclipse Temurin, or Amazon Corretto)
- **Maven**: 3.9+ (or use the provided `./backend/mvnw`)
- **Node.js**: 18+ (Node 20+ recommended) & `npm`
- **Docker** & **Docker Compose** (or Podman)
- **Supabase Account**: Free project on [supabase.com](https://supabase.com)

---

## ✦ Supabase Storage Setup

1. Log in to [Supabase](https://supabase.com) and create or open your project.
2. Go to **Storage** in the left sidebar.
3. Click **New bucket**:
   - Bucket name: `journal-images`
   - Toggle **Public bucket** to **ON** (this enables public URL access for photos).
   - Click **Save bucket**.
4. Retrieve your API credentials:
   - Go to **Project Settings** (gear icon) ➔ **API**.
   - Copy **Project URL** (e.g. `https://your-project-id.supabase.co`).
   - Copy **anon / public key** or **service_role key** under **Project API keys**.
5. Keep these ready for your `.env` file!

---

## ✦ Getting Started Locally

### 1. Configure Environment Variables

Copy the example file to `.env` in the project root:

```bash
cp .env.example .env
```

Open `.env` and configure your credentials:

```ini
# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=logs_db
DB_USER=postgres
DB_PASSWORD=postgres

# Supabase Storage
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-supabase-api-key
SUPABASE_BUCKET=journal-images

# Application
SERVER_PORT=8080
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

> **Note**: If you run without Supabase credentials, the backend automatically uses a local filesystem fallback (`backend/uploads/`) so you can test immediately!

---

### 2. Start PostgreSQL

Run PostgreSQL locally using Docker Compose:

```bash
docker compose up -d
```

Verify that the database is running:

```bash
docker compose ps
```

---

### 3. Start the Spring Boot Backend

From the project root:

```bash
cd backend
./mvnw spring-boot:run
```

*(or using standard Maven: `mvn spring-boot:run`)*

The backend will start at `http://localhost:8080`.

---

### 4. Start the React Frontend

Open a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be running at `http://localhost:5173`. Open your browser to begin journaling!

---

## ✦ API Reference

### Journal Entries

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/entries` | List all entries, latest first (supports `?search=query`) |
| `GET` | `/api/entries/{id}` | Retrieve a single entry with full content and photos |
| `POST` | `/api/entries` | Create an entry (`{ "title": "...", "content": "..." }`) |
| `PUT` | `/api/entries/{id}` | Update entry title/content (`{ "title": "...", "content": "..." }`) |
| `DELETE` | `/api/entries/{id}` | Delete entry and all its images from storage |

### Entry Photos

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/entries/{id}/images` | Upload multiple photos (`multipart/form-data`, param: `files`) |
| `DELETE` | `/api/entries/{id}/images/{imageId}` | Delete a specific photo from entry and Supabase |

---

## ✦ Running Tests

### Backend Tests (JUnit 5 + MockMvc + H2)

```bash
cd backend
./mvnw test
```

### Frontend Typecheck & Build

```bash
cd frontend
npm run build
```
