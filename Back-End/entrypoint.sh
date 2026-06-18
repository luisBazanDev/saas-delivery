#!/bin/sh
set -e

if [ ! -f /app/private/private.pem ] || [ ! -f /app/private/public.pem ]; then
  echo "Generating PEM certificates..."
  mkdir -p /app/private
  openssl genrsa -out /app/private/private.pem 2048
  openssl rsa -in /app/private/private.pem -pubout -out /app/private/public.pem
  echo "Certificates generated"
else
  echo "PEM certificates already exist"
fi

exec npm run server
