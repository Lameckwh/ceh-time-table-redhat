#!/bin/bash

# Build script for CEH Timetable Podman deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="ceh-timetable"
VERSION=${1:-"latest"}

echo -e "${GREEN}Building CEH Timetable Container Image with Podman${NC}"
echo -e "${YELLOW}Version: $VERSION${NC}"

# Build production image
echo -e "${GREEN}Building production image...${NC}"
podman build -t ${IMAGE_NAME}:${VERSION} .

# Build development image
echo -e "${GREEN}Building development image...${NC}"
podman build --target builder -t ${IMAGE_NAME}:${VERSION}-dev .

# Tag latest
if [ "$VERSION" != "latest" ]; then
    echo -e "${GREEN}Tagging as latest...${NC}"
    podman tag ${IMAGE_NAME}:${VERSION} ${IMAGE_NAME}:latest
fi

# Show image sizes
echo -e "${GREEN}Image sizes:${NC}"
podman images | grep ${IMAGE_NAME}

echo -e "${GREEN}Build complete!${NC}"
echo -e "${YELLOW}To run: podman-compose up -d${NC}"
echo -e "${YELLOW}To run dev: podman-compose -f docker-compose.dev.yml up -d${NC}"
echo -e "${YELLOW}To create pod: podman pod create --name ceh-timetable-pod -p 3000:3000${NC}"
