# GigConnect - Local Freelance & Microgig Platform

A comprehensive freelance platform tailored for the Nigerian market, featuring real-time chat, escrow payments, and a modern user interface.

## 🚀 Features

### Core Platform

- **User Management**: Client and Freelancer registration with KYC verification
- **Gig Management**: Create, edit, and manage freelance services
- **Order System**: Complete order lifecycle with escrow protection
- **Real-time Chat**: Built-in messaging system for client-freelancer communication
- **Payment Integration**: Paystack integration with escrow functionality
- **Admin Dashboard**: Comprehensive admin tools for platform management

### Technical Features

- **Modern Frontend**: React 18 + TypeScript + Tailwind CSS
- **Responsive Design**: Mobile-first approach with shadcn/ui components
- **State Management**: React Query for server state, Context for auth
- **Real-time Updates**: Socket.IO integration for live notifications
- **Type Safety**: Full TypeScript coverage with strict type checking

## 🏗️ Architecture

### Frontend (React + TypeScript)

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: TanStack Query + React Context
- **Routing**: React Router v6 with protected routes
- **Build Tool**: Vite for fast development and building

### Backend (Node.js + TypeScript)

- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js with middleware stack
- **Databases**:
  - Supabase (PostgreSQL) for relational data
  - MongoDB for chat and unstructured data
  - Redis for caching and job queues
- **Authentication**: JWT-based with Supabase Auth
- **Real-time**: Socket.IO for live communication
- **Payments**: Paystack integration with webhooks
- **Background Jobs**: BullMQ for async processing

## 📁 Project Structure

```
gigconnect-naija/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── config/         # Database and service configs
│   │   ├── routes/         # API route handlers
│   │   ├── middleware/     # Auth and validation middleware
│   │   ├── services/       # Business logic services
│   │   ├── workers/        # Background job processors
│   │   └── types/          # TypeScript type definitions
│   ├── Dockerfile          # Backend containerization
│   └── docker-compose.yml  # Local development setup
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   ├── contexts/          # React context providers
│   ├── lib/               # Utility libraries and API client
│   └── assets/            # Static assets
├── public/                 # Public static files
└── package.json            # Frontend dependencies
```

## 🛠️ Prerequisites

- **Node.js**: 18.0.0 or higher
- **npm** or **yarn** or **bun**
- **Docker** and **Docker Compose** (for local development)
- **Supabase** account and project
- **MongoDB Atlas** cluster
- **Redis** instance
- **Paystack** account for payments

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd gigconnect-naija
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp env.example .env

# Update .env with your credentials
# See backend/README.md for detailed setup

# Start with Docker (recommended)
docker-compose up -d

# Or start locally
npm run dev
```

### 3. Frontend Setup

```bash
# Return to root directory
cd ..

# Install dependencies
npm install

# Copy environment variables
cp env.example .env

# Update .env with your backend API URL
VITE_API_BASE_URL=http://localhost:3001/api/v1

# Start development server
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Mongo Express**: http://localhost:8081
- **Redis Commander**: http://localhost:8082

## 🔧 Environment Configuration

### Frontend (.env)

```bash
VITE_API_BASE_URL=http://localhost:3001/api/v1
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
```

### Backend (.env)

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Database URLs
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
MONGO_URI=your_mongodb_connection_string
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Payment Configuration
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret

# Email Configuration
RESEND_API_KEY=your_resend_api_key
```

## 📱 Available Scripts

### Frontend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend

```bash
npm run dev          # Start development server
npm run build        # Build TypeScript
npm run start        # Start production server
npm run test         # Run tests
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with sample data
```

## 🗄️ Database Schema

### Supabase (PostgreSQL)

- **users**: User accounts and profiles
- **freelancers**: Freelancer-specific data
- **clients**: Client-specific data
- **gigs**: Service offerings
- **orders**: Service orders and transactions
- **wallets**: User wallet balances
- **transactions**: Payment history
- **disputes**: Order disputes and resolutions
- **kyc_records**: Identity verification documents
- **audit_logs**: System audit trail

### MongoDB

- **chats**: Chat room metadata
- **messages**: Individual chat messages
- **activity_logs**: User activity tracking
- **file_metadata**: File upload information
- **audit_events**: Detailed audit events

## 🔐 Authentication & Security

- **JWT-based authentication** with refresh tokens
- **Role-based access control** (Client, Freelancer, Admin, Moderator)
- **KYC verification** for user identity
- **Rate limiting** and request validation
- **CORS configuration** for security
- **Input sanitization** and validation
- **Audit logging** for compliance

## 💳 Payment & Escrow

- **Paystack integration** for Nigerian payments
- **Escrow system** for secure transactions
- **Automatic payouts** to freelancers
- **Dispute resolution** system
- **Transaction history** and reporting

## 🚀 Deployment

### Frontend Deployment

- **Vercel**: Optimized for React applications
- **Netlify**: Static site hosting
- **AWS S3 + CloudFront**: Scalable static hosting

### Backend Deployment

- **Render**: Easy deployment with auto-scaling
- **Railway**: Simple container deployment
- **AWS ECS**: Enterprise-grade container orchestration
- **DigitalOcean App Platform**: Managed container deployment

## 🧪 Testing

### Frontend Testing

```bash
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Backend Testing

```bash
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

## 📊 Monitoring & Analytics

- **Health check endpoints** for system monitoring
- **Structured logging** with different log levels
- **Performance metrics** and response times
- **Error tracking** and alerting
- **User analytics** and platform insights

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the backend and frontend README files
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Join community discussions on GitHub Discussions

## 🔮 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] AI-powered gig recommendations
- [ ] Multi-language support
- [ ] Advanced dispute resolution
- [ ] Integration with more payment gateways
- [ ] Advanced search and filtering
- [ ] Social features and networking

---

Built with ❤️ for the Nigerian freelance community
