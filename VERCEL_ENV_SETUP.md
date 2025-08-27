# Required Environment Variables for Vercel Deployment

## Add these in your Vercel Dashboard -> Project Settings -> Environment Variables:

# Database (for production, you'll need a cloud database)
DATABASE_URL="your-production-database-url"

# JWT Secret (CRITICAL - generate a secure random string)
JWT_SECRET="your-super-secure-jwt-secret-key-for-production-at-least-32-chars-long"

# Next.js Auth URL (replace with your Vercel domain)
NEXTAUTH_URL="https://your-vercel-app-name.vercel.app"

# Example of a secure JWT_SECRET (generate your own):
# JWT_SECRET="sk-1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"

## Steps to add in Vercel:
1. Go to vercel.com -> Your Project -> Settings -> Environment Variables
2. Add each variable above
3. Set Environment: Production, Preview, and Development
4. Redeploy your application
