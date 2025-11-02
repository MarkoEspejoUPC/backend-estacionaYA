# EstacionaYa Demo Backend

Backend demo usando Serverless + LocalStack para simular AWS (DynamoDB, SQS).
Incluye: auth, parkings, spaces, reservations, stripe payments (test), IA endpoints.

## Requisitos
- Node.js 18+
- Serverless Framework
- LocalStack (docker)
- Stripe (clave test)

## Variables de entorno
Exporta:
- JWT_SECRET
- STRIPE_SECRET

## Instalar y ejecutar
1. npm install
2. localstack start
3. npm run start
