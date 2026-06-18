#!/bin/bash

set -e

BACKEND_DIR="Back-End"
PRIVATE_DIR="$BACKEND_DIR/private"
ENV_FILE="$BACKEND_DIR/.env"
EXAMPLE_ENV="$BACKEND_DIR/example.env"

echo "Checking PEM certificates..."

if [ ! -f "$PRIVATE_DIR/private.pem" ] || [ ! -f "$PRIVATE_DIR/public.pem" ]; then
    echo "Generating PEM certificates..."
    mkdir -p "$PRIVATE_DIR"
    
    openssl genrsa -out "$PRIVATE_DIR/private.pem" 2048
    openssl rsa -in "$PRIVATE_DIR/private.pem" -pubout -out "$PRIVATE_DIR/public.pem"
    
    echo "Certificates generated"
else
    echo "PEM certificates already exist"
fi

echo ""
echo "Checking backend .env file..."

if [ ! -f "$ENV_FILE" ]; then
    echo "Creating .env from example.env..."
    
    cat > "$ENV_FILE" << 'EOF'
DB_NAME=saas_delivery
DB_USER=saas_user
DB_PASSWORD=saas_password
DB_HOST=localhost
EOF
    
    echo ".env file created with default values"
else
    echo ".env file already exists"
fi

echo ""
echo "Setup completed"
