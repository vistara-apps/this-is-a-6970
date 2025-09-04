# ContentSpark - AI-Powered Content Generation Platform

ContentSpark is a comprehensive web application that helps content creators generate initial drafts and repurpose long-form content into short-form clips efficiently using AI technology.

![ContentSpark](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=ContentSpark)

## 🚀 Features

### Core Functionality
- **AI Content Generation**: Create engaging content using OpenAI's GPT models
  - Social media posts
  - Blog article outlines  
  - Email subject lines
  - Product descriptions
  - Video scripts
  - Advertisement copy

- **Content Repurposing**: Transform long-form content into multiple formats
  - Extract short video clips from longer content
  - Generate key highlights and quotes
  - Create formatted transcripts
  - Generate social media posts from existing content

### User Management
- **Authentication**: Secure JWT-based user authentication
- **Subscription Management**: Tiered subscription plans (Basic/Pro)
- **Usage Tracking**: Monitor content generation limits and usage statistics

### Payment Integration
- **Stripe Integration**: Secure payment processing
- **Subscription Plans**: 
  - Basic: $15/month (10 generations)
  - Pro: $45/month (unlimited generations)

## 🏗️ Architecture

### Frontend (React + Vite)
- **Framework**: React 18 with Vite for fast development
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with custom styling
- **State Management**: React hooks and context
- **Icons**: Lucide React icon library

### Backend (Node.js + Express)
- **Runtime**: Node.js with Express.js framework
- **Database**: SQLite with proper schema design
- **Authentication**: JWT tokens with bcrypt password hashing
- **API Documentation**: Swagger/OpenAPI integration
- **Logging**: Winston structured logging
- **File Processing**: Multer for file uploads

### External Services
- **OpenAI API**: Content generation using GPT models
- **Stripe API**: Payment processing and subscription management
- **Media Processing**: Placeholder for video/audio processing (FFmpeg integration ready)

## 📦 Project Structure

```
contentspark/
├── src/                          # Frontend React application
│   ├── components/              # React components
│   │   ├── ContentGenerator.jsx # AI content generation
│   │   ├── ContentRepurposer.jsx # Media repurposing
│   │   ├── Dashboard.jsx        # Main dashboard
│   │   ├── Header.jsx           # App header
│   │   ├── Sidebar.jsx          # Navigation sidebar
│   │   └── SubscriptionModal.jsx # Payment modal
│   ├── services/                # API services
│   │   └── openai.js           # OpenAI integration
│   ├── utils/                   # Utility functions
│   └── App.jsx                  # Main app component
├── server/                      # Backend API server
│   ├── config/                  # Configuration files
│   │   └── database.js         # Database setup
│   ├── middleware/              # Express middleware
│   │   ├── auth.js             # Authentication middleware
│   │   └── errorHandler.js     # Error handling
│   ├── models/                  # Data models
│   │   ├── User.js             # User model
│   │   └── ContentRequest.js   # Content request model
│   ├── routes/                  # API routes
│   │   ├── auth.js             # Authentication routes
│   │   ├── content.js          # Content generation routes
│   │   ├── subscription.js     # Subscription management
│   │   └── payments.js         # Stripe payment routes
│   ├── services/                # Business logic services
│   │   ├── openai.js           # OpenAI service
│   │   └── mediaProcessor.js   # Media processing service
│   ├── utils/                   # Utility functions
│   │   └── logger.js           # Logging configuration
│   └── index.js                # Server entry point
├── public/                      # Static assets
├── docs/                        # Documentation
└── README.md                    # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key (optional for demo)
- Stripe account (optional for payments)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd contentspark
   ```

2. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables:**
   
   **Frontend (.env):**
   ```bash
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   VITE_API_URL=http://localhost:3001
   ```

   **Backend (server/.env):**
   ```bash
   PORT=3001
   NODE_ENV=development
   DATABASE_URL=./database.sqlite
   JWT_SECRET=your_jwt_secret_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   STRIPE_SECRET_KEY=your_stripe_secret_key_here
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Start the development servers:**
   ```bash
   # Start both frontend and backend
   npm run dev:full
   
   # Or start individually:
   npm run dev              # Frontend only
   npm run server:dev       # Backend only
   ```

5. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - API Documentation: http://localhost:3001/api-docs

## 🔧 Development

### Available Scripts

**Root Level:**
- `npm run dev` - Start frontend development server
- `npm run build` - Build frontend for production
- `npm run server:dev` - Start backend development server
- `npm run dev:full` - Start both frontend and backend
- `npm run install:all` - Install all dependencies

**Backend (server/):**
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run migrate` - Run database migrations

### API Documentation

The backend provides comprehensive API documentation via Swagger UI:
- **Local**: http://localhost:3001/api-docs
- **Endpoints**: Authentication, Content Generation, Subscriptions, Payments
- **Interactive**: Test API endpoints directly from the documentation

### Database Schema

**Users Table:**
- User authentication and subscription management
- Tracks usage limits and generation counts
- Stripe customer integration

**Content Requests Table:**
- Stores all content generation and repurposing requests
- Tracks processing status and metadata
- Links to user accounts

**Analytics Table:**
- User activity tracking
- Usage statistics and insights

## 🔐 Security Features

- **Authentication**: JWT tokens with secure password hashing
- **Rate Limiting**: API request throttling
- **Input Validation**: Joi schema validation
- **CORS Protection**: Configurable cross-origin policies
- **Security Headers**: Helmet.js security middleware
- **SQL Injection Prevention**: Parameterized queries
- **File Upload Security**: Type and size validation

## 🚀 Deployment

### Frontend Deployment
- Build: `npm run build`
- Deploy `dist/` folder to any static hosting service
- Configure environment variables for production

### Backend Deployment
- Set `NODE_ENV=production`
- Configure production database
- Set up reverse proxy (nginx recommended)
- Configure SSL/HTTPS
- Set up monitoring and logging

### Environment Configuration
- Use environment-specific `.env` files
- Configure Stripe webhooks for production
- Set up proper CORS origins
- Configure rate limiting for production traffic

## 📊 Monitoring & Analytics

- **Logging**: Structured logging with Winston
- **Error Tracking**: Comprehensive error handling
- **Usage Analytics**: Built-in usage tracking
- **Performance Monitoring**: Request timing and metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and patterns
- Add tests for new features
- Update documentation as needed
- Ensure proper error handling
- Add logging for important operations

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **API Reference**: Visit `/api-docs` for complete API documentation
- **Issues**: Report bugs and request features via GitHub Issues

## 🔮 Roadmap

- [ ] Real-time content generation streaming
- [ ] Advanced media processing with FFmpeg
- [ ] Multi-language content generation
- [ ] Team collaboration features
- [ ] Advanced analytics dashboard
- [ ] Mobile application
- [ ] Third-party integrations (social media platforms)
- [ ] Custom AI model training

---

**Built with ❤️ using React, Node.js, and AI technology**
