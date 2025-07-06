#!/bin/bash

# Podman pod management script for CEH Timetable

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
POD_NAME="ceh-timetable-pod"
IMAGE_NAME="ceh-timetable"
DB_NAME="ceh-db"
APP_NAME="ceh-app"

# Function to show usage
show_usage() {
    echo -e "${GREEN}CEH Timetable Podman Pod Management${NC}"
    echo -e "${YELLOW}Usage: $0 [command]${NC}"
    echo ""
    echo -e "${YELLOW}Commands:${NC}"
    echo "  create    - Create and start the pod with all services"
    echo "  start     - Start the existing pod"
    echo "  stop      - Stop the pod"
    echo "  restart   - Restart the pod"
    echo "  logs      - Show logs from all containers"
    echo "  status    - Show pod and container status"
    echo "  cleanup   - Stop and remove the pod and containers"
    echo "  systemd   - Generate systemd service files"
    echo "  help      - Show this help message"
}

# Function to create pod
create_pod() {
    echo -e "${GREEN}Creating pod: $POD_NAME${NC}"
    
    # Create pod
    podman pod create --name $POD_NAME -p 3000:3000 -p 5432:5432
    
    # Start database
    echo -e "${GREEN}Starting database container...${NC}"
    podman run -d --pod $POD_NAME \
        --name $DB_NAME \
        -e POSTGRESQL_DATABASE=ceh_timetable \
        -e POSTGRESQL_USER=postgres \
        -e POSTGRESQL_PASSWORD=password \
        -e POSTGRESQL_ADMIN_PASSWORD=adminpassword \
        registry.redhat.io/rhel8/postgresql-13:latest
    
    # Wait for database to be ready
    echo -e "${YELLOW}Waiting for database to be ready...${NC}"
    sleep 10
    
    # Start application
    echo -e "${GREEN}Starting application container...${NC}"
    podman run -d --pod $POD_NAME \
        --name $APP_NAME \
        -e NODE_ENV=production \
        -e DATABASE_URL=postgresql://postgres:password@localhost:5432/ceh_timetable \
        -e NEXT_TELEMETRY_DISABLED=1 \
        $IMAGE_NAME:latest
    
    echo -e "${GREEN}Pod created and started successfully!${NC}"
    echo -e "${YELLOW}Application available at: http://localhost:3000${NC}"
}

# Function to start pod
start_pod() {
    echo -e "${GREEN}Starting pod: $POD_NAME${NC}"
    podman pod start $POD_NAME
    echo -e "${GREEN}Pod started successfully!${NC}"
}

# Function to stop pod
stop_pod() {
    echo -e "${GREEN}Stopping pod: $POD_NAME${NC}"
    podman pod stop $POD_NAME
    echo -e "${GREEN}Pod stopped successfully!${NC}"
}

# Function to restart pod
restart_pod() {
    echo -e "${GREEN}Restarting pod: $POD_NAME${NC}"
    podman pod restart $POD_NAME
    echo -e "${GREEN}Pod restarted successfully!${NC}"
}

# Function to show logs
show_logs() {
    echo -e "${GREEN}Showing logs for pod: $POD_NAME${NC}"
    echo -e "${YELLOW}Database logs:${NC}"
    podman logs $DB_NAME --tail 20
    echo -e "${YELLOW}Application logs:${NC}"
    podman logs $APP_NAME --tail 20
}

# Function to show status
show_status() {
    echo -e "${GREEN}Pod status:${NC}"
    podman pod ps
    echo -e "${GREEN}Container status:${NC}"
    podman ps --filter pod=$POD_NAME
}

# Function to cleanup
cleanup() {
    echo -e "${GREEN}Cleaning up pod and containers...${NC}"
    podman pod stop $POD_NAME 2>/dev/null || true
    podman pod rm $POD_NAME 2>/dev/null || true
    echo -e "${GREEN}Cleanup completed!${NC}"
}

# Function to generate systemd files
generate_systemd() {
    echo -e "${GREEN}Generating systemd service files...${NC}"
    podman generate systemd --files --name $POD_NAME
    echo -e "${GREEN}Systemd files generated!${NC}"
    echo -e "${YELLOW}To install and enable:${NC}"
    echo "  sudo cp *.service /etc/systemd/system/"
    echo "  sudo systemctl daemon-reload"
    echo "  sudo systemctl enable --now pod-$POD_NAME.service"
}

# Main script logic
case "${1:-help}" in
    create)
        create_pod
        ;;
    start)
        start_pod
        ;;
    stop)
        stop_pod
        ;;
    restart)
        restart_pod
        ;;
    logs)
        show_logs
        ;;
    status)
        show_status
        ;;
    cleanup)
        cleanup
        ;;
    systemd)
        generate_systemd
        ;;
    help|*)
        show_usage
        ;;
esac
