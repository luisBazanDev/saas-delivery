# Crear llave publica y private RSA 2048

## Comando para crear llave privada RSA 2048
```bash
    openssl genrsa -out private.pem 2048
```

## Comando para crear llave publica RSA 2048
```bash
    openssl rsa -in private.pem -pubout -out public.pem
```