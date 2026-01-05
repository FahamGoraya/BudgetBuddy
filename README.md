# BudgetBuddy 💰

> **Intelligent Personal Finance Management Platform** powered by AI-driven financial planning and real-time expense tracking

An enterprise-grade financial management application that combines cutting-edge AI capabilities with sophisticated data visualization and real-time analytics to deliver personalized financial insights and automated budget optimization.

## 🎯 What Sets BudgetBuddy Apart

BudgetBuddy isn't just another expense tracker. It's a comprehensive financial intelligence platform featuring:

- **AI-Powered Financial Planning**: Leverages Claude AI to generate personalized, context-aware financial plans based on user goals and circumstances
- **Intelligent Receipt Scanning**: Integrates Veryfi's OCR technology for automated expense extraction and categorization
- **Dynamic Budget Reset Logic**: Automatically manages monthly budget cycles with historical expense preservation
- **Real-Time Analytics Dashboard**: Provides instant financial insights with animated data visualization
- **Conversational Finance Assistant**: Chat-based interface for financial guidance and planning refinement
- **Enterprise-Grade Architecture**: Designed with scalability, security, and performance in mind

## 🏗️ Technology Stack

### Frontend
- **Next.js 16** (React 19) - Server-side rendering with App Router
- **TypeScript** - Full type safety across the application
- **Tailwind CSS** - Utility-first responsive design
- **Framer Motion** - Sophisticated animations and transitions
- **Lucide Icons** - Modern icon library

### Backend & Infrastructure
- **Next.js API Routes** - Serverless API endpoints
- **PostgreSQL** - Relational database with advanced queries
- **Drizzle ORM** - Type-safe database operations
- **Redis** - In-memory caching for performance optimization
- **JWT Authentication** - Secure token-based authentication

### AI & External Services
- **Anthropic Claude API** - AI-powered financial planning and chat
- **Veryfi SDK** - Receipt OCR and data extraction
- **Chart.js** - Advanced data visualization

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- Redis Server
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/budgetbuddy.git
cd budgetbuddy
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env.local` file in the `budgetbuddy/` directory:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/budgetbuddy

# Redis
REDIS_URL=redis://localhost:6379

# Authentication & Security
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
NEXTAUTH_SECRET=your-nextauth-secret-key

# AI Services
ANTHROPIC_API_KEY=sk-ant-your-api-key-here

# Receipt Scanning (Veryfi)
VERYFI_CLIENT_ID=your-veryfi-client-id
VERYFI_CLIENT_SECRET=your-veryfi-client-secret
VERYFI_USERNAME=your-veryfi-username
VERYFI_API_KEY=your-veryfi-api-key

# Optional: Deployment
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

1. **Create PostgreSQL database**
```bash
createdb budgetbuddy
```

2. **Run migrations**
```bash
npm run migrate
```

The application uses Drizzle ORM with automatic schema generation:
```bash
npm run db:push
```

### Running the Application

**Development mode** (with hot reload):
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

**Production build & run**:
```bash
npm run build
npm run start
```

**Type checking**:
```bash
npm run type-check
```

## 📊 Core Features

### 1. **AI-Powered Financial Planning**
- Natural language processing for goal understanding
- Personalized budget allocation (Essential/Savings/Discretionary)
- Iterative plan refinement with conversational feedback
- Dynamic plan updates and replacements

### 2. **Intelligent Expense Management**
- Real-time expense tracking with categorization
- Receipt scanning with automatic data extraction
- Historical expense archival by month
- Recurring expense detection and management

### 3. **Dynamic Budget System**
- Monthly budget reset with automatic rollover
- Category-based spending limits
- Real-time budget vs. actual comparison
- Alert system for over-budget categories
- Configurable budget periods

### 4. **Advanced Analytics**
- Monthly expense trends and comparisons
- Category-wise spending breakdown
- Budget utilization metrics
- Financial goal tracking and progress monitoring
- Predictive spending analysis

### 5. **User Experience**
- Responsive, mobile-first design
- Smooth animations and transitions
- Intuitive navigation and onboarding
- Dark mode UI with modern aesthetics
- Real-time data synchronization

## 🔐 Security Features

- **JWT-based authentication** with secure token storage
- **Password hashing** with industry-standard algorithms
- **HTTPS-ready** deployment architecture
- **Environment variable isolation** for sensitive credentials
- **Rate limiting** on API endpoints
- **CORS configuration** for API security
- **SQL injection prevention** via Drizzle ORM

## 📈 Performance Optimizations

- **Redis caching layer** for frequently accessed data
- **Database query optimization** with indexed queries
- **Lazy loading** of components and data
- **Image optimization** with Next.js Image component
- **API response compression**
- **Client-side state management** with Context API
- **Optimized database migrations** and schema design

## 🏛️ Architecture Highlights

### API Design
- RESTful endpoints with clear separation of concerns
- Consistent error handling and response formatting
- Request validation and sanitization
- Pagination support for large datasets
- Comprehensive error logging

### Database Schema
- Normalized relational design for data integrity
- Efficient indexing on frequently queried columns
- Foreign key constraints for referential integrity
- Timestamp fields for audit trails
- Support for soft deletes where applicable

### Frontend Architecture
- Component-based modular design
- Context API for global state management
- Custom hooks for reusable logic
- Separation of concerns (pages, components, services)
- Type-safe API integration

## 🔄 Data Flow

```
User Input → Next.js API Route → Validation → 
Database/Cache Layer → Processing → API Response → 
React Component Update → UI Rendering
```

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run type-check   # Run TypeScript type checking
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run migrate      # Run database migrations
npm run db:push      # Push schema to database
```

## 📁 Project Structure

```
budgetbuddy/
├── app/
│   ├── api/              # API endpoints
│   │   ├── auth/         # Authentication routes
│   │   ├── budgets/      # Budget management
│   │   ├── expenses/     # Expense tracking
│   │   ├── analytics/    # Analytics endpoints
│   │   ├── chat/         # AI chat interface
│   │   └── receipts/     # Receipt scanning
│   ├── components/       # Reusable React components
│   ├── context/          # Context API providers
│   ├── db/               # Database schema & config
│   ├── lib/              # Utility functions
│   ├── types/            # TypeScript type definitions
│   └── [pages]/          # Page components
├── drizzle/              # Migration files
├── public/               # Static assets
├── .env.local           # Environment variables (create this)
├── package.json
├── tsconfig.json
└── next.config.ts
```

## 🧪 Testing & Development

```bash
# TypeScript type checking
npm run type-check

# Run tests (if configured)
npm test

# Generate Drizzle migrations
npm run db:generate
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel
```

### Docker Deployment
```bash
docker build -t budgetbuddy .
docker run -p 3000:3000 --env-file .env.local budgetbuddy
```

### Environment Setup for Deployment
- Set all `.env.local` variables in your hosting platform
- Ensure PostgreSQL and Redis are accessible
- Configure CORS for your domain
- Enable HTTPS for security

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/verify` - Verify JWT token

### Financial Planning
- `GET /api/financial-plan` - Fetch user's plan
- `POST /api/financial-plan` - Create/update plan
- `DELETE /api/financial-plan` - Delete plan

### Budgets
- `GET /api/budgets` - List all budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/[id]` - Update budget
- `DELETE /api/budgets/[id]` - Delete budget

### Expenses
- `GET /api/expenses` - List expenses (with monthly filtering)
- `POST /api/expenses` - Create expense
- `DELETE /api/expenses` - Delete expense

### Analytics
- `GET /api/analytics/overview` - Monthly overview
- `GET /api/analytics/summary` - Financial summary
- `GET /api/analytics/categories` - Category breakdown
- `GET /api/analytics/monthly` - Monthly trends

### AI Services
- `POST /api/chat` - Chat with financial assistant
- `POST /api/receipts/scan` - Scan receipt

## 📝 Configuration

### Database Configuration
Update `app/db/schema.ts` to modify database structure.

### API Configuration
Adjust rate limiting and caching in individual API routes.

### UI Configuration
Customize themes and colors in `app/globals.css` and Tailwind config.

## 🤝 Contributing

Contributions are welcome! Please follow standard GitHub flow:
1. Create a feature branch
2. Make your changes
3. Submit a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 👨‍💻 About

Built with modern web technologies and best practices for financial software, BudgetBuddy demonstrates:
- Full-stack TypeScript development
- Real-time data management
- AI integration patterns
- Enterprise-grade architecture
- Secure authentication flows
- Advanced UI/UX implementation

Perfect for showcasing software engineering expertise to top-tier tech companies.

---

**Ready to take control of your finances? Start with BudgetBuddy today!**
