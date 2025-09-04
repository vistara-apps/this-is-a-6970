# ContentSpark Backend API

This is the backend API server for ContentSpark, built with Node.js, Express, and SQLite.

## Features

- **Authentication**: JWT-based user authentication
- **Content Generation**: AI-powered content creation using OpenAI
- **Content Repurposing**: Media processing and content transformation
- **Subscription Management**: Stripe integration for payments
- **Database**: SQLite with proper schema and relationships
- **API Documentation**: Swagger/OpenAPI documentation
- **Logging**: Structured logging with Winston
- **Error Handling**: Comprehensive error handling and validation

## Quick Start

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **View API documentation:**
   Open http://localhost:3001/api-docs

## Environment Variables

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=./database.sqlite

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# OpenAI API
OPENAI_API_KEY=your_openai_api_key_here

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# CORS Origins
CORS_ORIGIN=http://localhost:5173
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/refresh` - Refresh JWT token

### Content
- `POST /api/content/generate` - Generate content using AI
- `POST /api/content/repurpose` - Repurpose media content
- `GET /api/content/history` - Get content generation history
- `GET /api/content/:requestId` - Get specific content request
- `DELETE /api/content/:requestId` - Delete content request

### Subscriptions
- `GET /api/subscriptions/plans` - Get available plans
- `GET /api/subscriptions/current` - Get current subscription
- `GET /api/subscriptions/usage` - Get usage statistics
- `POST /api/subscriptions/cancel` - Cancel subscription

### Payments
- `POST /api/payments/create-checkout-session` - Create Stripe checkout
- `POST /api/payments/create-portal-session` - Create billing portal
- `POST /api/payments/webhook` - Handle Stripe webhooks

## Database Schema

### Users Table
- `userId` (TEXT, PRIMARY KEY)
- `email` (TEXT, UNIQUE)
- `password` (TEXT, hashed)
- `subscriptionPlan` (TEXT: 'basic' | 'pro')
- `stripeCustomerId` (TEXT)
- `stripeSubscriptionId` (TEXT)
- `generationsUsed` (INTEGER)
- `generationsLimit` (INTEGER)
- `createdAt` (DATETIME)
- `updatedAt` (DATETIME)

### Content Requests Table
- `requestId` (TEXT, PRIMARY KEY)
- `userId` (TEXT, FOREIGN KEY)
- `type` (TEXT: 'generation' | 'repurposing')
- `contentType` (TEXT)
- `inputContent` (TEXT)
- `generatedContent` (TEXT)
- `status` (TEXT: 'pending' | 'processing' | 'completed' | 'failed')
- `metadata` (TEXT, JSON)
- `createdAt` (DATETIME)
- `updatedAt` (DATETIME)

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run migrate` - Run database migrations

### Testing
The API can be tested using:
- Swagger UI at `/api-docs`
- Postman or similar API testing tools
- Frontend application

### Logging
Logs are written to:
- Console (development)
- `logs/combined.log` (all logs)
- `logs/error.log` (errors only)

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure production database
3. Set up proper JWT secrets
4. Configure Stripe webhooks
5. Set up reverse proxy (nginx)
6. Enable HTTPS
7. Set up monitoring and logging

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation with Joi
- SQL injection prevention
- Error message sanitization

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update API documentation
4. Ensure proper error handling
5. Add logging for important operations
