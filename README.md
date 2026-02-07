# Katalog - E-Commerce Platform

Modern B2B e-commerce platform built with Next.js 16, Supabase, and TailwindCSS.

## Features

- 🛒 Full e-commerce functionality (products, cart, orders)
- 👤 User authentication & role-based access
- 💱 Multi-currency support (USD/TRY) with auto-updating exchange rates
- 📦 Admin panel for product & order management
- 🐳 Docker-ready for easy deployment

## Tech Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Docker, Docker Compose

## Quick Start (Development)

### Prerequisites
- Node.js 20+
- npm or yarn
- Docker & Docker Compose (for production)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd katalog
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open** [http://localhost:3000](http://localhost:3000)

## Production Deployment (Docker)

### Prerequisites
- Docker Engine 20.10+
- Docker Compose V2 (included with Docker Desktop/latest Docker Engine)

### Setup Instructions

1. **Clone repository on your VPS**
   ```bash
   git clone <your-repo-url>
   cd katalog
   ```

2. **Create production environment file**
   ```bash
   cp .env.production.example .env.production
   ```

3. **Edit `.env.production`** with your production values:
   ```bash
   nano .env.production
   ```
   
   **Important variables to set:**
   - `POSTGRES_PASSWORD`: Strong database password
   - `JWT_SECRET`: Random 32+ character string
   - `SITE_URL`: Your production domain (e.g., https://yourdomain.com)
   - `NEXT_PUBLIC_SUPABASE_URL`: http://kong:8000 (internal Docker network)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Generate from Supabase
   - `SUPABASE_SERVICE_ROLE_KEY`: Generate from Supabase
   - `CRON_SECRET`: Random string for cron job security

4. **Start all services**
   ```bash
   docker compose up -d
   ```

5. **Check service status**
   ```bash
   docker compose ps
   ```

6. **View logs**
   ```bash
   # All services
   docker compose logs -f
   
   # Specific service
   docker compose logs -f app
   ```

7. **Run database migrations** (first time only)
   ```bash
   # Access the database container
   docker compose exec db psql -U postgres
   
   # Or run migrations from app container
   docker compose exec app sh
   # Then manually apply migrations or use Supabase CLI
   ```

### Access Your Application

- **Application**: http://your-server-ip:3000
- **Supabase API**: http://your-server-ip:8000

### Recommended: Set up Nginx Reverse Proxy

For production, use Nginx with SSL:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Then set up SSL with Let's Encrypt:
```bash
sudo certbot --nginx -d yourdomain.com
```

## Useful Docker Commands

```bash
# Stop all services
docker compose down

# Rebuild and restart
docker compose up -d --build

# View logs
docker compose logs -f app

# Execute command in container
docker compose exec app sh

# Update currency manually
docker compose exec app node scripts/update-currency.mjs

# Remove all data (dangerous!)
docker compose down -v
```

## Currency Updates

Currency exchange rates (USD/TRY) are automatically updated:
- **Schedule**: Daily at 10:00 AM (UTC+3)
- **Source**: https://latest.currency-api.pages.dev
- **Manual update**: Run `node scripts/update-currency.mjs` inside app container

## Troubleshooting

### Container keeps restarting
```bash
# Check logs
docker compose logs app

# Common issues:
# - Missing environment variables
# - Database not ready
# - Port already in use
```

### Database connection failed
```bash
# Ensure database is healthy
docker compose ps

# Restart database
docker compose restart db

# Check database logs
docker compose logs db
```

### Cannot access application
```bash
# Check if port 3000 is open
sudo ufw allow 3000

# Check Docker network
docker network ls
docker network inspect katalog-network
```

## License

MIT
