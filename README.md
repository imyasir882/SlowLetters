# SlowLetters 💌

> Romance in Every Word - A slow letter-writing app for two hearts, one story.

SlowLetters recreates the romance and anticipation of traditional letter correspondence in a modern, secure web application. Share heartfelt messages with your special someone, with beautiful vintage aesthetics and thoughtful time delays that make every letter precious.

## ✨ Features

- **👥 One-to-One Pairing**: Connect with just one special person using invite codes
- **⏰ Turn-Based Letters**: Take turns writing with customizable delays (1-30 days)
- **🎙️ Voice-to-Text**: Speak your letters using Web Speech API
- **⭐ Favorites**: Star and collect your most treasured letters  
- **📄 PDF Export**: Download any letter as a beautifully styled PDF
- **🎨 Vintage UI**: Luxurious paper textures and elegant typography
- **📱 Responsive Design**: Beautiful on desktop, tablet, and mobile
- **🔒 Secure**: SQL database with JWT authentication

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A SQL database (SQLite for development, PostgreSQL for production)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/slowletters.git
   cd slowletters
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-super-secret-jwt-key-change-in-production"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Initialize the database**
   ```bash
   npm run db:migrate
   npm run db:generate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 How to Use

### Getting Started

1. **Create an account** with your display name, username, and password
2. **Share your invite code** with your special someone (found on your dashboard)
3. **Enter their invite code** to connect and set your letter exchange delay
4. **Start writing!** Take turns sending heartfelt letters

### Writing Letters

- Click "Write New Letter" when it's your turn
- Type your message or use the **microphone button** for voice-to-text
- Letters are limited to a reasonable length to keep them personal
- Press **Ctrl+Enter** to send quickly

### Managing Letters

- **Star letters** by hovering over them and clicking the star icon
- **Download PDFs** using the download button (beautiful vintage styling)
- **View favorites** using the favorites toggle
- **Wait patiently** for your partner's response (anticipation makes the heart grow fonder!)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (dev) / PostgreSQL (production)
- **Authentication**: JWT with bcrypt
- **PDF Generation**: PDFKit
- **Voice Input**: Web Speech API
- **Deployment**: Vercel

## 📁 Project Structure

```
slowletters/
├── app/                    # Next.js 13+ App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── letters/       # Letter CRUD and features
│   │   └── pair/          # Pairing management
│   ├── globals.css        # Global styles and Tailwind
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── AuthForm.tsx       # Login/signup form
│   ├── AuthWrapper.tsx    # Authentication state management
│   ├── Composer.tsx       # Letter writing interface
│   ├── Dashboard.tsx      # Main dashboard
│   ├── LetterCard.tsx     # Individual letter display
│   ├── LetterExchange.tsx # Letters list and management
│   ├── PairingFlow.tsx    # Connection flow
│   ├── Stopwatch.tsx      # Countdown timer
│   └── Toast.tsx          # Notifications
├── lib/                   # Utilities and configurations
│   ├── auth.ts           # JWT and password utilities
│   └── prisma.ts         # Database client
├── prisma/               # Database schema and migrations
│   └── schema.prisma     # Prisma schema
├── types/                # TypeScript type definitions
│   └── index.ts          # Shared types
└── public/               # Static assets
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm test` - Run tests

### Database Management

```bash
# Create a new migration
npm run db:migrate

# Reset database (⚠️ destroys all data)
npm run db:reset

# Explore data with Prisma Studio
npm run db:studio
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your GitHub repo** to Vercel
2. **Set environment variables**:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: A secure random string
   - `NEXTAUTH_URL`: Your deployed URL
3. **Deploy!** Vercel handles the build automatically

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set up your production database**
   ```bash
   npm run db:deploy
   ```

3. **Start the server**
   ```bash
   npm start
   ```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth with expiration
- **Password Hashing**: bcrypt with 12 rounds
- **SQL Injection Protection**: Prisma ORM provides built-in protection
- **CORS Protection**: Next.js built-in security
- **Input Validation**: Server-side validation on all endpoints

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📚 API Documentation

### Authentication

- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login to existing account

### Pairing

- `POST /api/pair/join` - Join pair with invite code
- `POST /api/pair/confirm` - Confirm pairing with settings

### Letters

- `GET /api/letters` - Get all letters for user's pair
- `POST /api/letters` - Send a new letter
- `PATCH /api/letters/:id/favorite` - Toggle favorite status
- `GET /api/letters/:id/pdf` - Download letter as PDF

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💝 Inspiration

SlowLetters was inspired by the lost art of letter writing - those days when people would wait weeks for a response, treasuring every word. In our instant-message world, we wanted to bring back that magic of anticipation, thoughtfulness, and the deep connection that comes from truly crafted correspondence.

---

*"In a world of instant everything, choose to savor the wait. Your love deserves more than a text."*

Made with ❤️ for lovers, dreamers, and old souls.
Hehe
