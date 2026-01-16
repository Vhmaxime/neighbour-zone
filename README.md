<div align="center">
<img src="https://github.com/user-attachments/assets/4eed4e75-2e3e-470e-b58d-190829b99e6d" width="800" height="700">
</div>
<h1> Neighbour Zone </h1>

## 🚀 Introduction ##

Neighbour Zone, built by three Full Stack **NgIneers**, aims to bring neighbours together—helping them connect, share items, discover local events, and much more.

The focus is on clean architecture, security, and long-term scalability.

## ✨ Core features ##

- **Explore**: Discover the neighbourhood with a search bar and a map that displays the location of goods and events.
- **Feed**: See the latest posts from people in the community.
- **Marketplace**: A place where people can list items for sale or post requests for things they are looking for.
- **Events**: A dedicated hub to create, discover and stay engaged with events.
- **Global Friends List**: Persistent widget anchored across the entire web app, ensuring your social circle is always accessible.

## 🛠 Tech Stack ##

The application is built using a modern, performance-oriented stack that clearly separates concerns while maintaining strong type guarantees across layers.

- **Frontend**: Angular, Tailwind CSS
- **Backend**: Hono.js, Zod, JWT
- **Database**: PostgreSQL, Drizzle ORM

## 📥 Setup and Installation Instructions

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (version 18 or higher) and **npm**
- **PostgreSQL** (version 14 or higher)
- **Angular CLI** (`npm install -g @angular/cli`)
- **Vercel CLI** (`npm install -g vercel`)

### Database Setup

### Option 1: Local PostgreSQL Database

Create the database using the terminal (or a GUI like pgAdmin):
```bash
# If using psql command line
createdb project_db
```

### Option 2: Remote PostgreSQL Database

If you're using a remote PostgreSQL database (e.g., Supabase, Neon, AWS RDS):
1. **Ensure remote access is enabled** on your PostgreSQL server.
2. **Verify firewall rules** allow connections on port `5432`.
3. **Ensure your IP address is whitelisted** in the server's security settings.
4. **Get your connection string** (e.g., `postgres://user:pass@host:5432/db`).
5. **Configure the** `.env` **file** with your remote credentials (see Backend Setup step 3 below).

### Backend Setup (Hono API)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. **Configure the Environment**: Copy the example file:
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file variables:
   ```bash
   PORT=3000
   JWT_SECRET=your_super_secret_key
   JWT_REFRESH_SECRET=another_super_secret_key
   # For Local Database
   DATABASE_URL="postgresql://postgres:password@localhost:5432/project_db"
   # For Remote Database
   DATABASE_URL="postgresql://user:password@your-remote-host.com:5432/remote_db_name?sslmode=require"
   ```
4. **Apply Database Migrations**: Use the migrate script to update your database schema:
   ```bash
   # Generates migration files (if you made schema changes)
   npm run db:generate
   # Applies migration files to the database
   npm run db:migrate
   ```
5. **Start the server**:
   ```bash
   npm start
   ```
Note: This runs vercel dev. You may be prompted to log in to Vercel or link the project.

### Frontend Setup (Angular)

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the Angular development server**:
   ```bash
   ng serve
   ```
The application will be available at `http://localhost:4200`.

### Running both services

To run the full application, you need both servers running simultaneously:
**Terminal 1 - Backend**:
```bash
cd backend
npm start
```
**Terminal 2 - Frontend**:
```bash
cd frontend
ng serve
```
Access the application at `http://localhost:4200`, which will communicate with the API at `http://localhost:3000`.

## 🔧 Troubleshooting

* **Port conflicts**: If port 3000 or 4200 is already in use:
    * **Backend**: Update `PORT` in your `.env` file.
    * **Frontend**: Run `ng serve --port=4201`.
* **CORS issues**: Ensure CORS is properly configured in your Hono app (`app.use('*', cors())`) to accept requests from `http://localhost:4200`.
* **Database connection errors**: Verify your `DATABASE_URL` in the `.env` file is correct and the PostgreSQL service is running.
* **Remote database connection issues**:
    * Verify the remote host is reachable: `ping your.remote.host.com`.
    * Check if the port is open: `telnet your.remote.host.com 5432`.
    * Ensure your IP is whitelisted (especially for cloud providers like Supabase/Neon).
    * Check SSL requirements (append `?sslmode=require` to your connection string).
