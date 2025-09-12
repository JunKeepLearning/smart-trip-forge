# Smart Trip Forge

Smart Trip Forge is a modern travel planning application built with React + TypeScript + FastAPI. The project provides comprehensive travel planning features including trip management, checklist system, favorites, destination exploration, and expense management.

## Features

- **Trip Planning**: Create and manage travel plans with detailed itineraries
- **Checklist System**: Customizable travel checklists with category organization
- **Favorites**: Save favorite destinations and points of interest
- **Destination Exploration**: Browse and search destinations with detailed information
- **Expense Management**: Track travel expenses and budget planning
- **User Authentication**: Secure login and registration with Supabase Auth
- **Responsive Design**: Mobile-friendly interface with dark/light theme support

## Installation and Setup

### Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- Supabase account for backend services

### Frontend Setup

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd smart-trip-forge

# Install dependencies
npm install

# Start development server (port 8080)
npm run dev
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server (port 8000)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Environment Configuration

Create a `.env` file in the root directory with:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:8000
```

Create a `.env` file in the `backend/` directory with:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key
DATABASE_URL=postgresql://username:password@host:port/database
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080
```

## API Documentation

The API documentation is available through Swagger UI when the backend server is running:

- **API Base URL**: http://localhost:8000
- **Swagger UI**: http://localhost:8000/docs

### Main API Endpoints

#### Data API (`/data`)
- `GET /data/search/destinations` - Search destinations by name
- `GET /data/museums` - Get museums data

#### Favorites API (`/favorites`)
- `GET /favorites` - Get user's favorite items
- `POST /favorites` - Add item to favorites
- `DELETE /favorites` - Remove item from favorites

#### Checklists API (`/checklists`)
- `GET /checklists` - Get all checklists (user's + templates)
- `POST /checklists` - Create a new checklist
- `GET /checklists/{id}` - Get detailed checklist information
- `DELETE /checklists/{id}` - Delete a checklist
- `POST /checklists/{id}/categories` - Add category to checklist
- `POST /checklists/categories/{category_id}/items` - Add item to category
- `PATCH /checklists/items/{item_id}` - Update checklist item
- `DELETE /checklists/items/{item_id}` - Delete checklist item

## Contributing

We welcome contributions to Smart Trip Forge! Here's how you can contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Ensure all tests pass before submitting a pull request
- Update documentation as needed
- Write clear, descriptive commit messages

## Deployment

### Frontend Deployment

- **Platforms**: Vercel, Netlify, or GitHub Pages
- **Build Command**: `npm run build`
- **Output Directory**: `dist/`
- **Environment Variables**: Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` on your deployment platform

### Backend Deployment

- **Platforms**: Render, Railway, Heroku, or DigitalOcean App Platform
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port 8000`
- **Python Version**: 3.8+
- **Dependencies**: `pip install -r requirements.txt`
- **Environment Variables**: Configure `SUPABASE_URL`, `SUPABASE_KEY`, and `DATABASE_URL`

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: FastAPI (Python), Supabase
- **UI Components**: shadcn-ui, Tailwind CSS, Radix UI
- **State Management**: Zustand, React Query
- **Form Handling**: React Hook Form, Zod
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Maps**: Leaflet, React Leaflet
- **Charts**: Recharts
- **Notifications**: Sonner

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please check:
- [Supabase Documentation](https://supabase.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [React Documentation](https://react.dev)