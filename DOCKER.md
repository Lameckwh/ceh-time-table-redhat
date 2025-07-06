# Podman Deployment Guide

This project includes a multi-stage Dockerfile using Red Hat Universal Base Images (UBI) for secure and efficient containerization using Podman.

## Container Architecture

The Dockerfile uses a 3-stage build process:

1. **Base Stage**: Sets up the runtime environment and installs production dependencies
2. **Builder Stage**: Compiles and builds the Next.js application
3. **Runtime Stage**: Creates the final lightweight production image

## Prerequisites

- Podman 4.0 or higher
- Podman Compose 1.0 or higher
- Access to Red Hat Container Registry (for UBI images)

## Building the Container Image

### Build for Production
```bash
# Build the production image
podman build -t ceh-timetable:latest .

# Build specific stage
podman build --target runtime -t ceh-timetable:production .
```

### Build for Development
```bash
# Build the development image
podman build --target builder -t ceh-timetable:dev .
```

## Running with Podman Compose

### Production Environment
```bash
# Start all services
podman-compose up -d

# View logs
podman-compose logs -f app

# Stop services
podman-compose down
```

### Development Environment
```bash
# Start development environment with hot reload
podman-compose -f docker-compose.dev.yml up -d

# View logs
podman-compose -f docker-compose.dev.yml logs -f app-dev

# Stop development environment
podman-compose -f docker-compose.dev.yml down
```

## Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL=postgresql://postgres:password@db:5432/ceh_timetable

# Application
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## Database Setup

The application uses PostgreSQL with Prisma ORM. When running with Docker Compose, the database will be automatically set up.

### Run Migrations
```bash
# Inside the container
podman-compose exec app npx prisma migrate deploy

# Or run migrations from host
podman-compose exec app npm run db:migrate
```

### Access Database
```bash
# Connect to PostgreSQL
podman-compose exec db psql -U postgres -d ceh_timetable
```

## Health Checks

The application includes health checks:
- **Application**: `http://localhost:3000/api/health`
- **Database**: PostgreSQL ready check

## Security Features

- Uses Red Hat UBI images for security and compliance
- Runs as non-root user in production
- Minimal runtime image with only necessary dependencies
- Multi-stage build reduces attack surface

## Monitoring

### Check Container Health
```bash
# View container health status
podman-compose ps

# Check detailed health
podman inspect ceh-timetable_app_1 | grep -A 20 Health
```

### View Logs
```bash
# Application logs
podman-compose logs -f app

# Database logs
podman-compose logs -f db

# All services
podman-compose logs -f
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000 and 5432 are not in use
2. **Database connection**: Check DATABASE_URL environment variable
3. **Prisma issues**: Run `npx prisma generate` after schema changes

### Debug Commands
```bash
# Enter container shell
podman-compose exec app /bin/bash

# Check application status
podman-compose exec app npm run health

# View application files
podman-compose exec app ls -la
```

## Production Deployment

### Using Podman Pods
```bash
# Create a pod
podman pod create --name ceh-timetable-pod -p 3000:3000 -p 5432:5432

# Run database in pod
podman run -d --pod ceh-timetable-pod \
  --name ceh-db \
  -e POSTGRESQL_DATABASE=ceh_timetable \
  -e POSTGRESQL_USER=postgres \
  -e POSTGRESQL_PASSWORD=password \
  registry.redhat.io/rhel8/postgresql-13:latest

# Run application in pod
podman run -d --pod ceh-timetable-pod \
  --name ceh-app \
  -e DATABASE_URL=postgresql://postgres:password@localhost:5432/ceh_timetable \
  ceh-timetable:latest
```

### Using Systemd (Podman native)
```bash
# Generate systemd service files
podman generate systemd --files --name ceh-timetable-pod

# Install and enable services
sudo cp *.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now pod-ceh-timetable-pod.service
```

### Using Kubernetes
Convert the Docker Compose file to Kubernetes manifests using tools like Kompose:
```bash
# Install kompose
curl -L https://github.com/kubernetes/kompose/releases/download/v1.26.1/kompose-linux-amd64 -o kompose

# Convert to Kubernetes
kompose convert -f docker-compose.yml
```

## Image Size Optimization

The multi-stage build significantly reduces the final image size:
- **Builder stage**: ~1.2GB (includes build tools)
- **Runtime stage**: ~400MB (minimal runtime only)

## Security Scanning

Scan the image for vulnerabilities:
```bash
# Using Podman built-in scanning (if available)
podman image scan ceh-timetable:latest

# Using Trivy with Podman
trivy image ceh-timetable:latest

# Using Skopeo for image inspection
skopeo inspect containers-storage:localhost/ceh-timetable:latest
```

## Podman-Specific Features

### Rootless Containers
```bash
# Run containers as non-root user (default in Podman)
podman run --rm -p 3000:3000 ceh-timetable:latest

# Check if running rootless
podman system info | grep -i rootless
```

### Pod Management
```bash
# List pods
podman pod ls

# Show pod details
podman pod inspect ceh-timetable-pod

# Stop/start pods
podman pod stop ceh-timetable-pod
podman pod start ceh-timetable-pod
```
