# Phase 3.2: Monitoring Dashboard - Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the VEXEL Monitoring Dashboard to production.

## Prerequisites

- Node.js 18+ installed
- Git access to the repository
- Web server or hosting platform
- SSL certificate (for HTTPS)
- Phase 3.1 API Gateway deployed and accessible

## Deployment Options

### Option 1: Static Hosting (Recommended)

Deploy the dashboard as a static site to services like:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages
- Azure Static Web Apps

### Option 2: Self-Hosted

Deploy on your own server with:
- Nginx
- Apache
- Node.js server

### Option 3: Docker Container

Deploy as a containerized application.

## Pre-Deployment Checklist

- [ ] API Gateway is deployed and accessible
- [ ] SSL certificate obtained for HTTPS
- [ ] Environment variables configured
- [ ] Build tested locally
- [ ] Performance validated
- [ ] Security review completed

## Deployment Steps

### Step 1: Prepare Environment Configuration

Create a production `.env` file:

```bash
# Production API Gateway URL
VITE_API_URL=https://api.yourdomain.com
```

**Important**: Ensure the API URL uses HTTPS in production.

### Step 2: Build for Production

```bash
cd dashboard
npm install
npm run build
```

This creates optimized files in the `dist/` directory:
- `dist/index.html` - Main HTML file
- `dist/assets/` - JavaScript, CSS, and other assets

### Step 3: Test Production Build

```bash
npm run preview
```

Visit `http://localhost:4173` and verify:
- [ ] Dashboard loads correctly
- [ ] API connection works
- [ ] WebSocket connection establishes
- [ ] Authentication works
- [ ] All features function properly

### Option 1A: Deploy to Vercel

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Login**:
```bash
vercel login
```

3. **Deploy**:
```bash
cd dashboard
vercel --prod
```

4. **Configure Environment Variables** in Vercel dashboard:
   - `VITE_API_URL` = Your API Gateway URL

5. **Set Build Configuration**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Option 1B: Deploy to Netlify

1. **Install Netlify CLI**:
```bash
npm install -g netlify-cli
```

2. **Login**:
```bash
netlify login
```

3. **Deploy**:
```bash
cd dashboard
netlify deploy --prod --dir=dist
```

4. **Configure** in `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  VITE_API_URL = "https://api.yourdomain.com"
```

### Option 1C: Deploy to AWS S3 + CloudFront

1. **Build the application**:
```bash
npm run build
```

2. **Create S3 bucket**:
```bash
aws s3 mb s3://vexel-dashboard
```

3. **Configure bucket for static hosting**:
```bash
aws s3 website s3://vexel-dashboard \
  --index-document index.html \
  --error-document index.html
```

4. **Upload files**:
```bash
aws s3 sync dist/ s3://vexel-dashboard --delete
```

5. **Create CloudFront distribution**:
   - Origin: S3 bucket
   - Viewer Protocol Policy: Redirect HTTP to HTTPS
   - Default Root Object: index.html

6. **Configure custom domain** (optional):
   - Add CNAME record in DNS
   - Configure SSL certificate in ACM

### Option 2: Self-Hosted with Nginx

1. **Build the application**:
```bash
npm run build
```

2. **Copy files to web server**:
```bash
scp -r dist/* user@server:/var/www/vexel-dashboard/
```

3. **Create Nginx configuration** (`/etc/nginx/sites-available/vexel-dashboard`):
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name dashboard.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name dashboard.yourdomain.com;

    ssl_certificate /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root /var/www/vexel-dashboard;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
    gzip_min_length 1000;
}
```

4. **Enable the site**:
```bash
sudo ln -s /etc/nginx/sites-available/vexel-dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Option 3: Docker Deployment

1. **Create Dockerfile** in dashboard directory:
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

2. **Create nginx.conf**:
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
}
```

3. **Build Docker image**:
```bash
docker build -t vexel-dashboard .
```

4. **Run container**:
```bash
docker run -d \
  --name vexel-dashboard \
  -p 80:80 \
  -e VITE_API_URL=https://api.yourdomain.com \
  vexel-dashboard
```

5. **Use Docker Compose** (optional):

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  dashboard:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=https://api.yourdomain.com
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

## Post-Deployment Configuration

### 1. Configure CORS on API Gateway

Update API Gateway CORS settings to allow dashboard origin:

```javascript
// In API Gateway configuration
cors: {
  origin: 'https://dashboard.yourdomain.com',
  credentials: true
}
```

### 2. Set Up Monitoring

Implement monitoring for:
- **Uptime**: Use services like UptimeRobot or Pingdom
- **Performance**: Google Analytics, New Relic, or DataDog
- **Error Tracking**: Sentry or Rollbar
- **Logs**: CloudWatch, Papertrail, or Loggly

### 3. Configure CDN (Optional)

For better global performance:
- CloudFlare
- AWS CloudFront
- Fastly
- Akamai

### 4. Set Up CI/CD

Automate deployments with GitHub Actions:

Create `.github/workflows/deploy-dashboard.yml`:
```yaml
name: Deploy Dashboard

on:
  push:
    branches: [main]
    paths:
      - 'dashboard/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd dashboard
          npm ci
          
      - name: Build
        run: |
          cd dashboard
          npm run build
        env:
          VITE_API_URL: ${{ secrets.API_URL }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./dashboard
```

## Security Considerations

### 1. HTTPS Only
- Always use HTTPS in production
- Redirect HTTP to HTTPS
- Use HSTS headers

### 2. Environment Variables
- Never commit API keys or secrets
- Use environment variables for configuration
- Rotate credentials regularly

### 3. API Gateway Security
- Enable rate limiting
- Use strong JWT secrets
- Implement proper CORS
- Enable request validation

### 4. Content Security Policy
Add CSP headers:
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://api.yourdomain.com wss://api.yourdomain.com;
```

### 5. Security Headers
Ensure these headers are set:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Performance Optimization

### 1. Enable Compression
- Gzip/Brotli compression on server
- Pre-compressed assets

### 2. Cache Strategy
- Long cache for assets (1 year)
- No cache for index.html
- Service worker for offline support

### 3. CDN Configuration
- Edge caching for static assets
- Geographic distribution
- HTTP/2 or HTTP/3

### 4. Code Optimization
Already implemented:
- Tree shaking
- Code splitting
- Minification
- Source maps (development only)

## Monitoring and Maintenance

### Health Checks
Monitor these endpoints:
- Dashboard: `https://dashboard.yourdomain.com`
- API Gateway: `https://api.yourdomain.com/health`

### Metrics to Track
- Page load time
- WebSocket connection success rate
- API response times
- Error rates
- User sessions

### Regular Maintenance
- Update dependencies monthly
- Review security advisories
- Monitor performance metrics
- Backup configuration
- Test disaster recovery

## Troubleshooting

### Dashboard not loading
1. Check browser console for errors
2. Verify API_URL is correct
3. Check CORS configuration
4. Verify SSL certificate

### WebSocket connection fails
1. Check API Gateway is accessible
2. Verify WebSocket endpoint (ws:// or wss://)
3. Check firewall rules
4. Verify proxy configuration

### Authentication issues
1. Check JWT_SECRET matches between systems
2. Verify token expiration
3. Check localStorage for token
4. Review API Gateway logs

## Rollback Procedure

If issues occur after deployment:

1. **Immediate rollback**:
```bash
# For Vercel
vercel rollback

# For Netlify
netlify rollback

# For Docker
docker pull vexel-dashboard:previous
docker stop vexel-dashboard
docker rm vexel-dashboard
docker run ... vexel-dashboard:previous
```

2. **Investigate issues** in logs

3. **Fix and redeploy** when ready

## Support

For deployment issues:
1. Check this guide
2. Review [PHASE_3.2_QUICKSTART.md](./PHASE_3.2_QUICKSTART.md)
3. Consult the main [README](./README.md)
4. Contact support team

---

**Phase**: 3.2 - Monitoring Dashboard  
**Status**: ✅ Deployment Ready  
**Last Updated**: January 2026
