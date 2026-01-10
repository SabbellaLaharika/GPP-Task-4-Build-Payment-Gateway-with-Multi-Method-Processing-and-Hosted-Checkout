# Payment Gateway with Multi-Method Processing

A complete payment gateway solution with support for UPI and Card payments, featuring a merchant dashboard and hosted checkout experience. Built with Spring Boot, React, PostgreSQL, and Docker.

![System Status](https://img.shields.io/badge/status-production%20ready-brightgreen)
![Java](https://img.shields.io/badge/java-21-orange)
![Spring Boot](https://img.shields.io/badge/spring%20boot-4.0.1-green)
![React](https://img.shields.io/badge/react-18-blue)
![PostgreSQL](https://img.shields.io/badge/postgresql-15-blue)
![Docker](https://img.shields.io/badge/docker-compose-blue)

> 🚀 **Live on Docker Hub**: [sabbellalaharika/payment-gateway-*](https://hub.docker.com/u/sabbellalaharika)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## 🎯 Overview

This project is a full-featured payment gateway that allows merchants to accept payments via UPI and Credit/Debit cards. It includes:

- **Merchant Dashboard**: Web interface for managing transactions and accessing API credentials
- **Hosted Checkout**: Customer-facing payment page with support for multiple payment methods
- **RESTful API**: Complete backend API for order creation and payment processing
- **Payment Validation**: Comprehensive validation including Luhn algorithm, VPA format, card network detection
- **Real-time Processing**: Asynchronous payment processing with status polling

**Access Points:**
- Dashboard: http://localhost:3000
- Checkout: http://localhost:3001
- API: http://localhost:8000
- Database: localhost:5440

---

## ✨ Features

### Core Features
- ✅ **Multi-Method Payment Processing**
  - UPI (Virtual Payment Address)
  - Credit/Debit Cards (Visa, Mastercard, Amex, RuPay)
- ✅ **Complete Payment Lifecycle**
  - Order creation
  - Payment processing (5-10 second simulation)
  - Status tracking (processing → success/failed)
  - Duplicate payment prevention
- ✅ **Comprehensive Validation**
  - VPA format validation
  - Luhn algorithm for card numbers
  - Card network detection
  - Card expiry validation
  - CVV validation (3 digits, 4 for Amex)
- ✅ **Security**
  - API key & secret authentication
  - No storage of full card numbers (only last 4 digits)
  - No storage of CVV
  - CORS protection

### Dashboard Features
- ✅ Merchant login
- ✅ API credentials display
- ✅ Transaction statistics (total, amount, success rate)
- ✅ Complete transaction history
- ✅ Order creation interface
- ✅ Print receipts

### Checkout Features
- ✅ Order summary display
- ✅ Payment method selection (UPI/Card)
- ✅ Real-time payment processing with status updates
- ✅ Success/failure notifications
- ✅ Receipt generation

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────┐         ┌──────────────────────┐     │
│  │   Dashboard (React)  │         │  Checkout (React)    │     │
│  │   Port: 3000         │         │  Port: 3001          │     │
│  │                      │         │                      │     │
│  │  - Login             │         │  - Order Summary     │     │
│  │  - API Credentials   │         │  - Payment Methods   │     │
│  │  - Transactions      │         │  - UPI/Card Forms    │     │
│  │  - Create Orders     │         │  - Status Display    │     │
│  └──────────┬───────────┘         └──────────┬───────────┘     │
│             │                                 │                  │
└─────────────┼─────────────────────────────────┼──────────────────┘
              │         HTTP/REST API           │
              │                                 │
┌─────────────┼─────────────────────────────────┼──────────────────┐
│             └────────────┬────────────────────┘                  │
│                          ▼                                       │
│              ┌───────────────────────┐                          │
│              │   Spring Boot API     │                          │
│              │   Port: 8000          │                          │
│              │                       │                          │
│              │  - Controllers        │                          │
│              │  - Services           │                          │
│              │  - Validators         │                          │
│              │  - Repositories       │                          │
│              └───────────┬───────────┘                          │
│                          │                                       │
│                          │ JPA/Hibernate                        │
│                          ▼                                       │
│              ┌───────────────────────┐                          │
│              │   PostgreSQL          │                          │
│              │   Port: 5440          │                          │
│              │                       │                          │
│              │  - merchants          │                          │
│              │  - orders             │                          │
│              │  - payments           │                          │
│              └───────────────────────┘                          │
│                                                                  │
│             All running in Docker containers                    │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌─────────────────────┐
│     MERCHANTS       │
├─────────────────────┤
│ PK  id (UUID)       │
│     name            │
│     email (unique)  │
│     api_key         │
│     api_secret      │
│     webhook_url     │
│     is_active       │
│     created_at      │
│     updated_at      │
└─────────┬───────────┘
          │ 1:N
          ▼
┌─────────────────────┐
│      ORDERS         │
├─────────────────────┤
│ PK  id              │
│ FK  merchant_id     │
│     amount          │
│     currency        │
│     receipt         │
│     notes           │
│     status          │
│     created_at      │
│     updated_at      │
└─────────┬───────────┘
          │ 1:1
          ▼
┌─────────────────────┐
│     PAYMENTS        │
├─────────────────────┤
│ PK  id              │
│ FK  order_id        │
│ FK  merchant_id     │
│     amount          │
│     currency        │
│     method          │
│     vpa             │
│     card_network    │
│     card_last4      │
│     status          │
│     error_code      │
│     error_desc      │
│     created_at      │
│     updated_at      │
└─────────────────────┘
```

### Key Constraints
- **Foreign Keys**: All relationships enforced at database level
- **Unique Constraints**: merchant email, api_key
- **Indexes**: idx_merchant_id, idx_order_id, idx_payment_status
- **Business Rule**: One payment per order (enforced in application layer)

---

## 🛠️ Tech Stack

### Backend
- **Java 21** - Programming language
- **Spring Boot 4.0.1** - Application framework
  - Spring Web
  - Spring Data JPA
  - Spring Security
  - Spring Boot Actuator
- **PostgreSQL 15** - Database
- **Hibernate** - ORM
- **Maven** - Build tool
- **Lombok** - Code generation

### Frontend
- **React 18** - UI library
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Nginx** - Static file server & reverse proxy

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Docker Hub** - Container registry

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Docker Desktop** (version 20.10+)
  - Download: https://www.docker.com/products/docker-desktop
- **Docker Compose** (version 2.0+, included with Docker Desktop)
- **Git** (for cloning the repository)

**System Requirements:**
- RAM: 4GB minimum, 8GB recommended
- Disk Space: 2GB free space
- OS: Windows 10/11, macOS, or Linux

---

## 🚀 Quick Start

### Option 1: Using Pre-built Docker Images (Recommended)

All images are available on Docker Hub. Simply pull and run:

```bash
# Clone the repository
git clone https://github.com/SabbellaLaharika/GPP-Task-4-Build-Payment-Gateway-with-Multi-Method-Processing-and-Hosted-Checkout.git
cd GPP-Task-4-Build-Payment-Gateway-with-Multi-Method-Processing-and-Hosted-Checkout

# Start all services
docker-compose up -d

# This will:
# 1. Pull pre-built images from Docker Hub
# 2. Start PostgreSQL (port 5440)
# 3. Start Backend API (port 8000)
# 4. Start Frontend Dashboard (port 3000)
# 5. Start Checkout Page (port 3001)
```

**First-time startup takes 2-3 minutes** to pull images.

### Option 2: Building from Source

```bash
# Clone the repository
git clone https://github.com/SabbellaLaharika/GPP-Task-4-Build-Payment-Gateway-with-Multi-Method-Processing-and-Hosted-Checkout.git
cd GPP-Task-4-Build-Payment-Gateway-with-Multi-Method-Processing-and-Hosted-Checkout

# Build and start all services
docker-compose up --build -d
```

### Verify Services are Running

```bash
# Check container status
docker-compose ps

# Expected output:
# NAME                        STATUS
# payment_gateway_db          Up (healthy)
# payment_gateway_backend     Up (healthy)
# payment_gateway_frontend    Up
# payment_gateway_checkout    Up
```

### Access the Applications

| Service | URL | Purpose |
|---------|-----|---------|
| Dashboard | http://localhost:3000 | Merchant interface |
| Checkout | http://localhost:3001 | Customer payment page |
| Backend API | http://localhost:8000 | REST API endpoints |
| Health Check | http://localhost:8000/health | Service health status |
| PostgreSQL | localhost:5440 | Database (external access) |

### Test the Complete Flow

1. **Login to Dashboard**
   - Navigate to http://localhost:3000
   - Email: `test@example.com`
   - Password: (any password)

2. **View API Credentials**
   - API Key: `key_test_abc123`
   - API Secret: `secret_test_xyz789`

3. **Create an Order**
   - Click "Create New Order"
   - Enter amount: `500` (₹500.00)
   - Add optional receipt/notes
   - Click "Create Order"

4. **Complete Payment**
   - Click "Open Checkout Page"
   - Select payment method (UPI or Card)
   
   **For UPI:**
   - Enter VPA: `user@paytm`
   - Click Pay
   
   **For Card:**
   - Card Number: `4111111111111111` (Visa)
   - Expiry: `12/26`
   - CVV: `123`
   - Name: `Test User`
   - Click Pay

5. **View Transaction**
   - Wait for processing (5-10 seconds)
   - See success/failure message
   - Print receipt
   - Return to dashboard
   - View transaction in "Transactions" page

---

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api/v1
```

### Authentication
All API endpoints (except health check) require authentication headers:

```http
X-Api-Key: key_test_abc123
X-Api-Secret: secret_test_xyz789
```

---

### 1. Health Check

**GET** `/health`

Check if the service is running and database is connected.

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-01-08T10:30:00Z"
}
```

---

### 2. Create Order

**POST** `/api/v1/orders`

Create a new order for payment.

**Headers:**
```
X-Api-Key: key_test_abc123
X-Api-Secret: secret_test_xyz789
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 50000,
  "currency": "INR",
  "receipt": "receipt_123",
  "notes": "{\"customer_name\": \"John Doe\"}"
}
```

**Response (201 Created):**
```json
{
  "id": "order_ABC123XYZ456789",
  "merchant_id": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 50000,
  "currency": "INR",
  "receipt": "receipt_123",
  "notes": "{\"customer_name\": \"John Doe\"}",
  "status": "created",
  "created_at": "2026-01-08T10:30:00",
  "updated_at": "2026-01-08T10:30:00"
}
```

**Validation:**
- `amount` must be ≥ 100 (₹1.00)
- `currency` must be "INR"

---

### 3. Get Order

**GET** `/api/v1/orders/{orderId}`

Retrieve details of a specific order.

**Response (200 OK):**
```json
{
  "id": "order_ABC123XYZ456789",
  "merchant_id": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 50000,
  "currency": "INR",
  "status": "created",
  "created_at": "2026-01-08T10:30:00",
  "updated_at": "2026-01-08T10:30:00"
}
```

---

### 4. Create Payment

**POST** `/api/v1/payments`

Process a payment for an order.

**Request Body (UPI):**
```json
{
  "orderId": "order_ABC123XYZ456789",
  "method": "upi",
  "vpa": "user@paytm"
}
```

**Request Body (Card):**
```json
{
  "orderId": "order_ABC123XYZ456789",
  "method": "card",
  "cardNumber": "4111111111111111",
  "expiryMonth": "12",
  "expiryYear": "26",
  "cvv": "123",
  "holderName": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "id": "pay_XYZ789ABC123456",
  "order_id": "order_ABC123XYZ456789",
  "amount": 50000,
  "currency": "INR",
  "method": "upi",
  "status": "processing",
  "created_at": "2026-01-08T10:30:05"
}
```

---

### 5. Get Payment

**GET** `/api/v1/payments/{paymentId}`

Retrieve status of a payment.

**Response (200 OK):**
```json
{
  "id": "pay_XYZ789ABC123456",
  "order_id": "order_ABC123XYZ456789",
  "amount": 50000,
  "method": "upi",
  "vpa": "user@paytm",
  "status": "success",
  "created_at": "2026-01-08T10:30:05",
  "updated_at": "2026-01-08T10:30:12"
}
```

---

### 6. List Payments

**GET** `/api/v1/payments`

Get all payments for the authenticated merchant.

**Response (200 OK):**
```json
[
  {
    "id": "pay_XYZ789ABC123456",
    "order_id": "order_ABC123XYZ456789",
    "amount": 50000,
    "method": "upi",
    "status": "success",
    "created_at": "2026-01-08T10:30:05"
  }
]
```

---

## 📁 Project Structure

```
GPP-Task-4-Build-Payment-Gateway-with-Multi-Method-Processing-and-Hosted-Checkout/
│
├── backend/                          # Spring Boot Backend
│   ├── src/
│   │   └── main/
│   │       ├── java/com/paymentgateway/payment_gateway/
│   │       │   ├── config/
│   │       │   │   ├── CorsConfig.java
│   │       │   │   └── SecurityConfig.java
│   │       │   ├── controller/
│   │       │   │   ├── HealthController.java
│   │       │   │   ├── OrderController.java
│   │       │   │   └── PaymentController.java
│   │       │   ├── dto/
│   │       │   │   ├── ErrorResponse.java
│   │       │   │   ├── OrderRequest.java
│   │       │   │   └── PaymentRequest.java
│   │       │   ├── entity/
│   │       │   │   ├── Merchant.java
│   │       │   │   ├── Order.java
│   │       │   │   └── Payment.java
│   │       │   ├── repository/
│   │       │   │   ├── MerchantRepository.java
│   │       │   │   ├── OrderRepository.java
│   │       │   │   └── PaymentRepository.java
│   │       │   ├── service/
│   │       │   │   ├── MerchantService.java
│   │       │   │   ├── OrderService.java
│   │       │   │   └── PaymentService.java
│   │       │   ├── util/
│   │       │   │   └── PaymentValidator.java
│   │       │   └── PaymentGatewayApplication.java
│   │       └── resources/
│   │           └── application.properties
│   ├── Dockerfile
│   ├── .dockerignore
│   └── pom.xml
│
├── frontend/                         # React Dashboard
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Transactions.jsx
│   │   │   └── CreateOrder.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── nginx.conf
│   └── package.json
│
├── checkout-page/                    # React Checkout
│   ├── public/
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── nginx.conf
│   └── package.json
│
├── docker-compose.yml                # Docker orchestration
├── .gitignore
└── README.md                         # This file
```

---

## ⚙️ Configuration

### Docker Compose Configuration

The `docker-compose.yml` file orchestrates all services:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: payment_gateway_db
    ports:
      - "5440:5432"
    environment:
      POSTGRES_DB: payment_gateway
      POSTGRES_USER: gateway_user
      POSTGRES_PASSWORD: gateway_pass

  backend:
    image: sabbellalaharika/payment-gateway-backend:latest
    container_name: payment_gateway_backend
    ports:
      - "8000:8000"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/payment_gateway
      - SPRING_DATASOURCE_USERNAME=gateway_user
      - SPRING_DATASOURCE_PASSWORD=gateway_pass

  frontend:
    image: sabbellalaharika/payment-gateway-frontend:latest
    container_name: payment_gateway_frontend
    ports:
      - "3000:3000"

  checkout:
    image: sabbellalaharika/payment-gateway-checkout:latest
    container_name: payment_gateway_checkout
    ports:
      - "3001:3001"
```

### Environment Variables

**Do you need a `.env.example` file?**

**Answer: Yes, for production deployment!**

Create **`.env.example`** in project root:

```env
# Database Configuration
POSTGRES_DB=payment_gateway
POSTGRES_USER=gateway_user
POSTGRES_PASSWORD=gateway_pass
POSTGRES_PORT=5440

# Backend Configuration
BACKEND_PORT=8000
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/payment_gateway
SPRING_JPA_HIBERNATE_DDL_AUTO=update

# Frontend Configuration
FRONTEND_PORT=3000
CHECKOUT_PORT=3001

# Optional: Test Mode
TEST_MODE=false
TEST_PAYMENT_SUCCESS=true
```

**For actual deployment, create `.env`** (copy from .env.example and modify):

```bash
cp .env.example .env
# Edit .env with your actual values
```

**Update docker-compose.yml to use .env:**

```yaml
services:
  postgres:
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "${POSTGRES_PORT}:5432"
```

---

## 🧪 Testing

### Test Merchant Credentials

The application automatically creates a test merchant on startup:

```
Email: test@example.com
API Key: key_test_abc123
API Secret: secret_test_xyz789
```

### Test Card Numbers

| Card Network | Card Number | CVV | Expiry |
|--------------|-------------|-----|--------|
| Visa | `4111111111111111` | 123 | 12/26 |
| Mastercard | `5555555555554444` | 456 | 12/26 |
| Amex | `378282246310005` | 1234 | 12/26 |
| RuPay | `6076430000000001` | 789 | 12/26 |

### Test UPI IDs

- `user@paytm`
- `john.doe@okaxis`
- `9876543210@ybl`

---

## 🐳 Deployment

### Using Docker Hub Images (Production)

```bash
# Pull latest images
docker-compose pull

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Building Custom Images

```bash
# Build backend
cd backend
docker build -t your-username/payment-gateway-backend:latest .

# Build frontend
cd ../frontend
docker build -t your-username/payment-gateway-frontend:latest .

# Build checkout
cd ../checkout-page
docker build -t your-username/payment-gateway-checkout:latest .

# Push to Docker Hub
docker push your-username/payment-gateway-backend:latest
docker push your-username/payment-gateway-frontend:latest
docker push your-username/payment-gateway-checkout:latest
```

### Accessing PostgreSQL

```bash
# Connect to PostgreSQL
docker exec -it payment_gateway_db psql -U gateway_user -d payment_gateway

# Or from host machine
psql -h localhost -p 5440 -U gateway_user -d payment_gateway

# View tables
\dt

# Query merchants
SELECT * FROM merchants;

# Exit
\q
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Check which process is using the port
netstat -ano | findstr :8000

# Kill the process (Windows)
taskkill /PID <PID> /F

# Or change the port in docker-compose.yml
```

### Database Connection Failed

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check logs
docker logs payment_gateway_db

# Restart PostgreSQL
docker restart payment_gateway_db
```

### Backend Health Check Failing

```bash
# Check backend logs
docker logs payment_gateway_backend

# Test health endpoint manually
curl http://localhost:8000/health

# Restart backend
docker restart payment_gateway_backend
```

### Images Not Pulling from Docker Hub

```bash
# Login to Docker Hub
docker login

# Pull images manually
docker pull sabbellalaharika/payment-gateway-backend:latest
docker pull sabbellalaharika/payment-gateway-frontend:latest
docker pull sabbellalaharika/payment-gateway-checkout:latest
```

---

## 🎯 Business Rules

1. **One Payment Per Order**: An order can only have one payment attempt
2. **Minimum Amount**: ₹1.00 (100 paise)
3. **Supported Currency**: INR only
4. **Payment Status Flow**: `processing` → `success` OR `failed`
5. **Order Status Updates**: 
   - Order created: `status = "created"`
   - Payment success: `order.status = "paid"`
   - Payment failed: `order.status = "failed"`

---

## 🔒 Security Features

- ✅ **API Authentication**: Key & Secret based authentication
- ✅ **CORS Protection**: Configured for specific origins
- ✅ **PCI Compliance**: 
  - Never store full card numbers
  - Never store CVV
  - Only last 4 digits stored
- ✅ **Input Validation**: 
  - Server-side validation for all inputs
  - Luhn algorithm for card numbers
  - VPA format validation
- ✅ **SQL Injection Protection**: JPA with parameterized queries

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Author

**Sabbella Laharika**
- GitHub: [@SabbellaLaharika](https://github.com/SabbellaLaharika)
- Docker Hub: [sabbellalaharika](https://hub.docker.com/u/sabbellalaharika)

---

## 🎉 Acknowledgments

- Spring Boot Documentation
- React Documentation
- PostgreSQL Documentation
- Docker Documentation
- Payment Gateway Industry Best Practices

---

## 📞 Support

For questions or issues:
- Create an issue in the [GitHub repository](https://github.com/SabbellaLaharika/GPP-Task-4-Build-Payment-Gateway-with-Multi-Method-Processing-and-Hosted-Checkout/issues)
- Email: [Your Email]

---

**Built using Spring Boot, React, PostgreSQL, and Docker**

**🚀 Deploy in 2 minutes with Docker!**