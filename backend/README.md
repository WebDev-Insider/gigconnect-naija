# GigConnect Backend

A production-ready backend for the Local Freelance & Microgig Platform, built with Node.js, TypeScript, Supabase, and MongoDB.

## 🚀 Features

- **Authentication & Authorization**: Supabase Auth with JWT tokens and role-based access control
- **Real-time Communication**: Socket.IO for chat, notifications, and live updates
- **Payment Processing**: Paystack integration with webhook handling and escrow management
- **Database**: Supabase PostgreSQL for structured data, MongoDB for chat and unstructured data
- **File Storage**: Cloudinary integration for media uploads
- **Background Jobs**: Redis + BullMQ for payment processing and scheduled tasks
- **Security**: Row-level security, rate limiting, input validation, and audit logging
- **Monitoring**: Health checks, logging, and error tracking

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Databases     │
│   (React/PWA)   │◄──►│   (Express)     │◄──►│   (Supabase +   │
└─────────────────┘    └─────────────────┘    │   MongoDB)      │
                                              └─────────────────┘
                                                       ▲
                                                       │
                                              ┌─────────────────┐
                                              │   Redis +       │
                                              │   Background    │
                                              │   Workers       │
                                              └─────────────────┘
```

## 📋 Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Supabase account and project
- Paystack account
- Cloudinary account (optional)
- Redis instance

## 🛠️ Installation

### 1. Clone and Setup

```bash
git clone <repository-url>
cd backend
npm install
```

### 2. Environment Configuration

Copy the environment template and fill in your values:

```bash
cp env.example .env
```

Required environment variables:

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Paystack
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_WEBHOOK_SECRET=your_paystack_webhook_secret

# MongoDB & Redis
MONGO_URI=mongodb://localhost:27017/gigconnect
REDIS_URL=redis://localhost:6379

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@gigconnect.ng
```

### 3. Database Setup

#### Supabase Setup

1. Create a new Supabase project
2. Run the SQL migrations from `src/database/migrations.sql`
3. Configure Row Level Security (RLS) policies
4. Set up authentication providers

#### MongoDB Setup

```bash
# Start MongoDB locally
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# Or use Docker Compose
docker-compose up mongodb -d
```

### 4. Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### 5. Docker Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

## 🗄️ Database Schema

### Supabase Tables (PostgreSQL)

- **users**: User accounts and profiles
- **freelancers**: Freelancer-specific data
- **clients**: Client-specific data
- **gigs**: Service offerings
- **orders**: Job orders and transactions
- **transactions**: Financial transactions
- **wallets**: User wallet balances
- **disputes**: Order disputes
- **kyc_records**: Identity verification
- **audit_logs**: System audit trail

### MongoDB Collections

- **chats**: Chat rooms between users
- **messages**: Individual chat messages
- **activity_logs**: User activity tracking
- **file_metadata**: File upload information
- **audit_events**: Security audit events

## 🔌 API Endpoints

### Authentication

- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user profile
- `PUT /api/v1/auth/me` - Update user profile

### Users

- `GET /api/v1/users/:id` - Get user profile
- `PUT /api/v1/users/:id` - Update user profile
- `POST /api/v1/users/:id/kyc` - Submit KYC documents

### Gigs

- `GET /api/v1/gigs` - List gigs with filters
- `POST /api/v1/gigs` - Create new gig
- `GET /api/v1/gigs/:id` - Get gig details
- `PUT /api/v1/gigs/:id` - Update gig
- `DELETE /api/v1/gigs/:id` - Delete gig

### Orders

- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders` - List user orders
- `GET /api/v1/orders/:id` - Get order details
- `PUT /api/v1/orders/:id/status` - Update order status

### Payments

- `POST /api/v1/payments/initiate` - Initiate payment
- `POST /api/v1/payments/verify` - Verify payment proof
- `GET /api/v1/payments/status/:orderId` - Get payment status

### Chat

- `GET /api/v1/chat/rooms` - List user chat rooms
- `GET /api/v1/chat/:chatId/messages` - Get chat messages
- `POST /api/v1/chat/:chatId/messages` - Send message

### Admin

- `GET /api/v1/admin/users` - List all users
- `POST /api/v1/admin/users/:id/verify` - Verify user KYC
- `POST /api/v1/admin/orders/:id/release` - Release escrow funds
- `GET /api/v1/admin/analytics` - Platform analytics

### Webhooks

- `POST /api/v1/webhooks/paystack` - Paystack payment webhooks
- `POST /api/v1/webhooks/supabase/auth` - Supabase auth webhooks

## 🔐 Authentication & Authorization

### JWT Tokens

- Tokens are issued by Supabase Auth
- Include user ID, email, and role
- Validated on protected endpoints

### Role-Based Access Control

- **client**: Can create orders, view gigs, chat with freelancers
- **freelancer**: Can create gigs, accept orders, manage portfolio
- **admin**: Full platform access, user management, dispute resolution
- **moderator**: Content moderation, basic admin functions

### Row Level Security (RLS)

- Users can only access their own data
- Admins have elevated access policies
- Sensitive data (bank details) encrypted and admin-only

## 💰 Payment & Escrow Flow

### 1. Order Creation

```
Client creates order → Status: pending_payment
```

### 2. Payment Initiation

```
Client initiates payment → Gets Paystack account details
Client transfers funds → Uploads payment proof
Status: payment_pending_verification
```

### 3. Payment Verification

```
Admin verifies payment → Creates escrow_credit transaction
Status: in_escrow → Freelancer notified
```

### 4. Work Delivery

```
Freelancer delivers work → Status: delivered
Client reviews → Approves or requests revision
```

### 5. Escrow Release

```
Admin releases funds → Creates admin_payout transaction
Freelancer receives payment via Paystack transfer
```

## 🚀 Deployment

### Render Deployment

1. Connect your GitHub repository
2. Set environment variables
3. Build command: `npm run build`
4. Start command: `npm start`

### Docker Deployment

```bash
# Build image
docker build -t gigconnect-backend .

# Run container
docker run -d \
  -p 3001:3001 \
  --env-file .env \
  --name gigconnect-backend \
  gigconnect-backend
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=info
SENTRY_DSN=your_sentry_dsn
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=auth.test.ts
```

### Test Structure

- **Unit tests**: Individual function testing
- **Integration tests**: API endpoint testing
- **E2E tests**: Complete workflow testing

## 📊 Monitoring & Health Checks

### Health Endpoint

```
GET /health
```

Returns:

- Database connection status
- Service uptime
- Environment information

### Logging

- Structured JSON logging
- Different levels: debug, info, warn, error
- Request ID tracking
- Performance metrics

### Error Tracking

- Sentry integration for production
- Error aggregation and alerting
- Stack trace preservation

## 🔧 Development Tools

### Database Management

- **MongoDB Express**: http://localhost:8081
- **Redis Commander**: http://localhost:8082

### API Documentation

- Swagger/OpenAPI specs (coming soon)
- Postman collection (coming soon)

### Code Quality

- ESLint for code linting
- Prettier for code formatting
- Husky for git hooks

## 🚨 Security Features

- **Input Validation**: Joi and express-validator
- **Rate Limiting**: Per-endpoint and global limits
- **CORS Protection**: Configurable origins
- **Helmet**: Security headers
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Input sanitization
- **Audit Logging**: All admin actions logged

## 📈 Performance & Scaling

### Caching Strategy

- Redis for session storage
- MongoDB query optimization
- Database connection pooling

### Scaling Considerations

- Horizontal scaling with load balancers
- Database read replicas
- CDN for static assets
- Background job queues

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Failed**

   - Check environment variables
   - Verify database is running
   - Check network connectivity

2. **Authentication Errors**

   - Verify Supabase configuration
   - Check JWT token expiration
   - Validate user status

3. **Payment Webhook Issues**
   - Verify Paystack webhook secret
   - Check webhook endpoint accessibility
   - Validate webhook payload

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev

# Check specific service
DEBUG=gigconnect:auth npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Style

- Follow TypeScript best practices
- Use meaningful variable names
- Add JSDoc comments for complex functions
- Follow the existing code structure

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Contact the development team
- Check the documentation wiki

## 🔄 Changelog

### v1.0.0 (Current)

- Initial release
- Core authentication and user management
- Gig and order management
- Payment processing with Paystack
- Real-time chat system
- Admin dashboard
- Comprehensive API endpoints

---

**Built with ❤️ for the Nigerian freelance community**

# MongoDB username and password xJhXLW9mlD8AcVcN jadeedgetech 
mongodb://jadeedgetech:xJhXLW9mlD8AcVcN@localhost:27017/?tls=false