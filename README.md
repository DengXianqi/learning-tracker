# Learning Progress Tracker

A full-stack web application for tracking learning goals, courses, skills, and milestones. Built with React and Express as a Full-Stack Capstone Project.

## 🎯 Overview

Learning Progress Tracker helps users organize their learning journey by:
- Setting and tracking learning goals
- Managing course progress and milestones
- Visualizing progress with interactive charts
- Discovering courses through external API integration

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Frontend │────▶│  Express API    │────▶│   PostgreSQL    │
│  (Vercel/etc)   │     │  (Google Cloud) │     │   Database      │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       │
        ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  Google OAuth   │     │  Coursera API   │
│  Authentication │     │  (Course Data)  │
└─────────────────┘     └─────────────────┘
```

## ✨ Features

### Frontend (React)
- **Google OAuth Login** - Secure authentication via Google
- **Goal Management** - Create, edit, delete learning goals
- **Milestone Tracking** - Track progress with completable milestones
- **Progress Visualization** - Interactive charts using Recharts
- **Course Discovery** - Integration with external course API
- **Responsive Design** - Mobile-first, accessible UI

### Backend (Express)
- **RESTful API** - Full CRUD operations for goals and milestones
- **PostgreSQL Database** - Persistent data storage with validation
- **JWT Authentication** - Secure API endpoints
- **Error Handling** - Comprehensive error responses

### Advanced React Features
1. **useReducer** - Complex state management for goal creation workflow
2. **Context API** - Global auth and theme state management
3. **useEffect** - Data fetching and synchronization

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, React Router |
| Styling | CSS Modules, CSS Animations |
| Charts | Recharts |
| Backend | Express.js, Node.js |
| Database | PostgreSQL |
| Auth | Google OAuth 2.0, JWT |
| Testing | Playwright |
| Deployment | Vercel (FE), Google Cloud Run (BE) |

## 📁 Project Structure

```
learning-tracker/
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React Context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   ├── styles/          # CSS modules and global styles
│   │   ├── utils/           # Helper functions
│   │   └── tests/           # Playwright tests
│   ├── public/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── models/          # Database models
│   │   ├── middleware/      # Express middleware
│   │   └── config/          # Configuration files
│   ├── tests/
│   └── package.json
├── .devcontainer/           # Dev container config
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Google Cloud account (for OAuth credentials)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/DengXianqi/learning-tracker
   cd learning-tracker
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database and OAuth credentials
   npm run dev
   ```

3. **Set up the frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with your API URL and Google Client ID
   npm run dev
   ```

4. **Run database migrations**
   ```bash
   # Install PostgreSQL
   sudo apt update
   sudo apt install -y postgresql postgresql-contrib

   # Start PostgreSQL service
   sudo service postgresql start

   # Create the database and user
   sudo -u postgres psql -c "CREATE DATABASE learning_tracker;"
   sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"

   # Now run the migration
   cd /workspaces/learning-tracker/backend
   npm run migrate
   ```

### Using Dev Container

1. Open the project in VS Code
2. Install the "Dev Containers" extension
3. Click "Reopen in Container" when prompted
4. All dependencies will be automatically installed

## 🔧 Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### Backend (.env)
```
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/learning_tracker
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
JWT_SECRET=your-jwt-secret
FRONTEND_URL=http://localhost:5173
```

## 📊 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/google` | Authenticate with Google |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout user |

### Goals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/goals` | Get all user goals |
| GET | `/api/goals/:id` | Get single goal |
| POST | `/api/goals` | Create new goal |
| PUT | `/api/goals/:id` | Update goal |
| DELETE | `/api/goals/:id` | Delete goal |

### Milestones
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/goals/:goalId/milestones` | Get milestones for goal |
| POST | `/api/goals/:goalId/milestones` | Create milestone |
| PUT | `/api/milestones/:id` | Update milestone |
| PATCH | `/api/milestones/:id/complete` | Mark milestone complete |
| DELETE | `/api/milestones/:id` | Delete milestone |

### Courses (External API)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses/search` | Search courses |
| GET | `/api/courses/:id` | Get course details |

## 🧪 Testing

### Run Playwright Tests
```bash
cd frontend
npm run test:e2e
```

### Test Coverage
- User authentication flow
- Goal CRUD operations
- Milestone completion
- Progress visualization

## 🚢 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Backend (Google Cloud Run)
1. Build Docker image:
   ```bash
   cd backend
   docker build -t learning-tracker-api .
   ```
2. Push to Google Container Registry
3. Deploy to Cloud Run with environment variables

## 🎨 Design Decisions

### State Management Pattern
Uses a combination of:
- **useReducer** for complex form state in goal creation wizard
- **Context API** for global auth state
- **Local state** for simple component state

### Database Schema
```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  google_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Goals table
CREATE TABLE goals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  target_date DATE,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Milestones table
CREATE TABLE milestones (
  id SERIAL PRIMARY KEY,
  goal_id INTEGER REFERENCES goals(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📝 Attribution

### External APIs
- **Course Data**: [Coursera API](https://build.coursera.org/) or [Udemy API](https://www.udemy.com/developers/)

### Libraries & Frameworks
- [React](https://reactjs.org/) - MIT License
- [Express](https://expressjs.com/) - MIT License
- [Recharts](https://recharts.org/) - MIT License
- [React Router](https://reactrouter.com/) - MIT License
- [Playwright](https://playwright.dev/) - Apache 2.0 License
- [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google) - MIT License

### Design Resources
- Icons: [Lucide React](https://lucide.dev/)
- Fonts: Google Fonts (Instrument Sans, Space Grotesk)

## 📹 Demo Video

[Watch the demo video](https://github.com/DengXianqi/learning-tracker/blob/main/bandicam%202025-12-14%2014-17-23-356.mp4) showcasing:
1. Google OAuth login flow
2. Creating and managing goals
3. Adding and completing milestones
4. Progress visualization
5. Course discovery feature
6. Architecture walkthrough

## 📜 License

This project is created for educational purposes as part of a Full-Stack Capstone Project.

## 👤 Author

Xianqi Deng - [GitHub](https://github.com/DengXianqi)

---

*Built with ❤️ as a Full-Stack Capstone Project*
