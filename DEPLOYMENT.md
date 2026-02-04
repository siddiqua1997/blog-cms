# Deployment Guide - Toxic Tuning Blog CMS

This guide walks you through deploying the blog CMS to production using Netlify, Neon/Supabase PostgreSQL, and Cloudinary.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup (Neon or Supabase)](#database-setup)
3. [Cloudinary Setup](#cloudinary-setup)
4. [Netlify Deployment](#netlify-deployment)
5. [Environment Variables](#environment-variables)
6. [Prisma Migrations](#prisma-migrations)
7. [Post-Deployment](#post-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- A GitHub account with this repository pushed
- Node.js 20+ installed locally
- npm or yarn package manager
- Accounts created on:
  - [Netlify](https://www.netlify.com/) (free tier available)
  - [Neon](https://neon.tech/) or [Supabase](https://supabase.com/) (free tier available)
  - [Cloudinary](https://cloudinary.com/) (free tier available)

---

## Database Setup

### Option A: Neon (Recommended for Netlify)

Neon is a serverless PostgreSQL database optimized for serverless deployments.

1. **Create Account**: Go to [neon.tech](https://neon.tech/) and sign up

2. **Create Project**:
   - Click "New Project"
   - Choose a name (e.g., `toxic-tuning-blog`)
   - Select region closest to your users

3. **Get Connection String**:
   - In your project dashboard, find the connection string
   - It looks like: `postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require`
   - Copy this for the `DATABASE_URL` environment variable

4. **Enable Pooling** (Important for serverless):
   - Go to "Connection Pooling" settings
   - Enable pooling - this is crucial for Netlify functions
   - Use the pooled connection string

### Option B: Supabase

1. **Create Account**: Go to [supabase.com](https://supabase.com/) and sign up

2. **Create Project**:
   - Click "New Project"
   - Choose a name and strong database password
   - Select region closest to your users

3. **Get Connection Strings**:
   - Go to Settings > Database
   - Copy the connection string (URI format)
   - Replace `[YOUR-PASSWORD]` with your database password
   - Use two variants:
     - **Pooled** (PgBouncer) for `DATABASE_URL` (serverless runtime)
     - **Direct** (non-pooled) for `DIRECT_URL` (migrations)
   - Supabase pooled example: add `?pgbouncer=true`
   - Supabase direct example: no `pgbouncer` flag

---

## Cloudinary Setup

Cloudinary handles image uploads and optimization.

1. **Create Account**: Go to [cloudinary.com](https://cloudinary.com/) and sign up

2. **Get Credentials**:
   - Go to Dashboard
   - Find your credentials:
     - Cloud Name (e.g., `dxxxxx`)
     - API Key (numeric string)
     - API Secret (keep this secret!)

3. **Configure Upload Settings** (Optional but recommended):
   - Go to Settings > Upload
   - Create an upload preset for `blog` folder
   - Enable automatic format optimization

---

## Netlify Deployment

### Step 1: Connect Repository

1. Log in to [Netlify](https://app.netlify.com/)
2. Click "Add new site" > "Import an existing project"
3. Connect to GitHub and select your repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Node version**: `20`

### Step 2: Configure Environment Variables

Before deploying, set these environment variables in Netlify:

1. Go to Site Settings > Environment Variables
2. Add the following variables:

```
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
DIRECT_URL=postgresql://user:pass@host/db?sslmode=require
NEXT_PUBLIC_APP_URL=https://your-site.netlify.app
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ADMIN_EMAIL=your-admin-email@example.com
```

### Step 3: Deploy

1. Click "Deploy site"
2. Wait for the build to complete
3. Your site will be available at `https://your-site.netlify.app`

### Custom Domain (Optional)

1. Go to Domain Settings
2. Add your custom domain
3. Configure DNS as instructed
4. Enable HTTPS (automatic with Netlify)
5. Update `NEXT_PUBLIC_APP_URL` to your custom domain

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string with SSL |
| `NEXT_PUBLIC_APP_URL` | Yes | Your production URL (no trailing slash) |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `ADMIN_EMAIL` | Yes | Super admin email address |

### Security Notes

- Never commit `.env` files to git
- All `CLOUDINARY_*` variables are server-side only
- Only `NEXT_PUBLIC_*` variables are exposed to the browser
- Rotate API secrets if they're ever exposed

---

## Prisma Migrations

### First-Time Setup

Run migrations to create database tables:

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Deploy migrations to production database
DATABASE_URL="your-production-url" npx prisma migrate deploy
# Or using npm script
npm run db:migrate:deploy
```

### Subsequent Migrations

When you make schema changes:

```bash
# 1. Update prisma/schema.prisma locally

# 2. Create migration
npx prisma migrate dev --name describe_your_change

# 3. Commit the migration files

# 4. Deploy to production (happens automatically on Netlify build)
# Or manually:
DATABASE_URL="your-production-url" npx prisma migrate deploy
```

### Migration on Netlify Build

Add to your `netlify.toml` or build command:

```toml
[build]
  command = "npx prisma generate && npx prisma migrate deploy && npm run build"
```

Or update `package.json`:

```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

---

## Post-Deployment

### 1. Create Admin Account

Visit `/admin/setup` to create your admin account:

1. Go to `https://your-site.netlify.app/admin/setup`
2. Enter admin details:
   - Email: Must match your `ADMIN_EMAIL` environment variable
   - Password: Choose a strong password
   - Name: Your display name
3. Click "Create Admin Account"

### 2. Verify Functionality

- [ ] Login at `/admin/login`
- [ ] Create a test post
- [ ] Upload an image (verify Cloudinary works)
- [ ] Publish the post
- [ ] View the post on the public blog
- [ ] Submit a test comment
- [ ] Approve the comment in admin
- [ ] Submit a contact form message
- [ ] View messages in admin

### 3. Configure Custom Domain

1. Add custom domain in Netlify
2. Update `NEXT_PUBLIC_APP_URL`
3. Trigger a new deployment

---

## Troubleshooting

### Database Connection Issues

**Error**: `Can't reach database server`

1. Check `DATABASE_URL` is correct
2. Verify SSL mode is enabled (`?sslmode=require`)
3. Ensure `DIRECT_URL` is set to the non-pooled connection string
4. Check if IP allowlist is blocking Netlify

**Error**: `Connection pool exhausted`

1. Use pooled connection string from Neon/Supabase
2. Keep `DIRECT_URL` as a direct (non-pooled) string for migrations

### Build Failures

**Error**: `Prisma generate failed`

```bash
# Ensure prisma is in dependencies (not devDependencies for Netlify)
npm install prisma @prisma/client
```

**Error**: `Cannot find module`

1. Clear Netlify cache: Site Settings > Build & Deploy > Clear cache and deploy site
2. Check `node_modules` is not in `.gitignore`

### Image Upload Issues

**Error**: `Image upload service not configured`

1. Verify all Cloudinary environment variables are set
2. Check for typos in variable names
3. Verify API credentials in Cloudinary dashboard

### Rate Limiting

If you're getting 429 errors during testing:

1. Rate limits are per-IP and reset after the window
2. For testing, adjust limits in `lib/rateLimit.ts`
3. In production, keep limits strict

---

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│                 │     │                  │     │                 │
│    Netlify      │────▶│   Neon/Supabase  │     │   Cloudinary    │
│  (Next.js App)  │     │   (PostgreSQL)   │     │   (Images)      │
│                 │     │                  │     │                 │
└────────┬────────┘     └──────────────────┘     └────────▲────────┘
         │                                                 │
         │              ┌──────────────────┐              │
         └──────────────│   API Routes     │──────────────┘
                        │  (Serverless)    │
                        └──────────────────┘
```

### Key Components

- **Netlify**: Hosts the Next.js application and serverless functions
- **Neon/Supabase**: Provides serverless PostgreSQL with connection pooling
- **Cloudinary**: Handles image upload, storage, and CDN delivery
- **Prisma**: Type-safe database ORM with migrations

---

## Maintenance

### Regular Tasks

1. **Monitor database usage**: Check connection counts and storage
2. **Review Cloudinary usage**: Monitor bandwidth and storage
3. **Check Netlify logs**: Monitor for errors and performance
4. **Update dependencies**: Run `npm update` periodically

### Backup Strategy

1. **Database**: Enable automatic backups in Neon/Supabase
2. **Images**: Cloudinary maintains copies; consider backup script
3. **Code**: Ensure all code is pushed to GitHub

---

## Support

For issues:

1. Check this guide's troubleshooting section
2. Review Netlify build logs
3. Check database connection in Prisma Studio
4. Verify environment variables are set correctly
