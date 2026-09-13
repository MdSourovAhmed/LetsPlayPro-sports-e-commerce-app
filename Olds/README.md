# E-Commerce MERN Stack - Docker Setup

## 📁 Project Structure
Your project should be organized like this:
```
ecommerce-project/
├── admin/              # Admin frontend (React)
├── client/             # Client frontend (React)
├── backend/            # Backend API (Node.js/Express)
├── docker-compose.yml
├── Dockerfile.admin
├── Dockerfile.client
├── Dockerfile.backend
└── nginx.conf
```

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed on your PC
- Your MongoDB connection string in `backend/.env`

### Step 1: Place Dockerfiles
Copy each Dockerfile to your project root:
- `Dockerfile.backend` → place in project root
- `Dockerfile.client` → place in project root
- `Dockerfile.admin` → place in project root
- `nginx.conf` → place in both `admin/` and `client/` folders
- `docker-compose.yml` → place in project root

### Step 2: Update Environment Variables
Make sure your `backend/.env` contains:
```env
MONGODB_URI=your_mongodb_atlas_connection_string
PORT=5000
# Add other env variables as needed
```

### Step 3: Build and Run
```bash
# Build all images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Step 4: Access Your Application
- **Client Frontend**: http://localhost:3000
- **Admin Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5000

## 🛠️ Useful Commands

```bash
# Stop all services
docker-compose down

# Rebuild specific service
docker-compose build backend

# View running containers
docker ps

# Access container shell
docker exec -it ecommerce-backend sh

# View logs for specific service
docker-compose logs -f backend
```

## 🔧 Troubleshooting

**Issue: Backend can't connect to MongoDB**
- Check your MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for testing)
- Verify connection string in `.env`

**Issue: Frontend can't reach backend**
- Update API URLs in your React apps to `http://localhost:5000`
- Check CORS settings in backend

**Issue: Port already in use**
- Change ports in `docker-compose.yml` (e.g., `3002:80` instead of `3000:80`)

## 📝 Notes
- Backend runs in development mode with volume mounting (hot reload)
- Frontend apps are production builds served by nginx
- All services are on the same Docker network for inter-service communication
