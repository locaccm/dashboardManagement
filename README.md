# Dashboard API Gateway

This project is an API Gateway designed for a multi-service real estate or tenant-owner management platform. It routes requests between the frontend and multiple backend microservices, including profile, lease, accommodation, messaging, and event services.

## Features

- JWT-based authentication and access control
- Middleware for access validation via the Auth service
- Route forwarding to appropriate microservices
- Swagger API documentation
- Jest-based integration tests with Axios mocking

## Microservices Connected

- **Profile Service** – `/profiles`
- **Lease Service** – `/leases`
- **Accommodation Service** – `/accommodations`
- **Message Service** – `/messages`
- **Event Service** – `/events`
- **Auth Service** – For permission checking

## Technologies Used

- Node.js
- Express
- TypeScript
- Axios
- Jest + Supertest
- Swagger for API documentation
- dotenv for environment variable management

## Run Tests

npm test

## Swagger Documentation

- Swagger UI will be available at:
  http://localhost:4000/api-docs
