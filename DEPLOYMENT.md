# Deployment Guide - Cosmos Chain Registry API Server

This guide covers different deployment options for the Cosmos Chain Registry API Server.

## 🐳 Docker Deployment (Recommended)

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 512MB RAM
- Internet access for chain registry sync

### Production Deployment

1. **Clone and Configure**
   ```bash
   git clone https://github.com/your-username/cosmos-chain-registry-api-server.git
   cd cosmos-chain-registry-api-server
   
   # For production, use the Docker-specific environment template
   cp .env.docker .env
   # Edit .env with your production settings
   # IMPORTANT: Change ADMIN_API_KEY and ADMIN_IPS for security!
   ```

2. **Configure Environment Variables**
   
   The application uses `.env` file for configuration. Key variables for Docker:
   
   ```bash
   # Required: Change these in production!
   ADMIN_API_KEY=your-secure-admin-key-here
   ADMIN_IPS=your.allowed.ip.addresses,127.0.0.1,::1
   
   # Optional: Customize these as needed
   PORT=3000
   LOG_LEVEL=info
   CACHE_TTL=3600
   SYNC_INTERVAL=86400
   ```

3. **Deploy with Docker Compose**
3. **Deploy with Docker Compose**
   ```bash
   # Build and start containers
   docker-compose up -d
   
   # Verify deployment
   curl http://localhost:3000/health
   
   # Check if your PORT from .env is different than 3000
   curl http://localhost:${PORT}/health
   ```

4. **Initial Setup and Admin Authentication**
4. **Initial Setup and Admin Authentication**
   ```bash
   # Check logs for initial sync
   docker-compose logs -f cosmos-chain-registry-api
   
   # Test admin authentication (should fail without API key)
   curl -X POST http://localhost:3000/v1/sync
   
   # Trigger manual sync with admin credentials
   curl -X POST http://localhost:3000/v1/sync \
     -H "X-API-Key: your-admin-api-key-from-env-file"
   ```

### Development Deployment

```bash
# Run development version with hot reload
docker-compose --profile development up -d

# Access development server
curl http://localhost:3001/health
```

### Docker Commands Reference

```bash
# View status
docker-compose ps

# View logs
docker-compose logs -f [service-name]

# Restart service
docker-compose restart cosmos-chain-registry-api

# Update and redeploy
git pull
docker-compose down
docker-compose up -d --build

# Stop all services
docker-compose down

# Clean up volumes (WARNING: deletes data)
docker-compose down -v
```

## 🖥️ Manual Deployment

### System Requirements
- Node.js 18.x or higher
- Git 2.x or higher
- Linux/macOS/Windows with bash/zsh shell
- At least 512MB RAM
- 1GB disk space for chain data

### Ubuntu/Debian Installation

1. **Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js 18
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs git
   
   # Verify installation
   node --version  # Should be v18.x.x
   npm --version
   git --version
   ```

2. **Application Setup**
   ```bash
   # Create application user
   sudo useradd -m -s /bin/bash cosmos-api
   sudo su - cosmos-api
   
   # Clone repository
   git clone https://github.com/your-username/cosmos-chain-registry-api-server.git
   cd cosmos-chain-registry-api-server
   
   # Install dependencies
   npm install
   
   # Configure environment
   cp .env.example .env
   nano .env  # Edit configuration as needed
   
   # Build application
   npm run build
   ```

3. **Create Systemd Service**
   ```bash
   # Exit to root user
   exit
   
   # Create service file
   sudo nano /etc/systemd/system/cosmos-chain-registry-api.service
   ```

   Add the following content:
   ```ini
   [Unit]
   Description=Cosmos Chain Registry API Server
   After=network.target
   
   [Service]
   Type=simple
   User=cosmos-api
   WorkingDirectory=/home/cosmos-api/cosmos-chain-registry-api-server
   ExecStart=/usr/bin/node dist/app.js
   Restart=always
   RestartSec=10
   Environment=NODE_ENV=production
   
   # Resource limits
   LimitNOFILE=65536
   MemoryMax=512M
   
   [Install]
   WantedBy=multi-user.target
   ```

4. **Start and Enable Service**
   ```bash
   # Reload systemd
   sudo systemctl daemon-reload
   
   # Start service
   sudo systemctl start cosmos-chain-registry-api
   
   # Enable auto-start on boot
   sudo systemctl enable cosmos-chain-registry-api
   
   # Check status
   sudo systemctl status cosmos-chain-registry-api
   
   # View logs
   sudo journalctl -u cosmos-chain-registry-api -f
   ```

### CentOS/RHEL Installation

1. **Install Dependencies**
   ```bash
   # Install Node.js 18
   curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
   sudo yum install -y nodejs git
   
   # Or for newer versions:
   sudo dnf install -y nodejs git
   ```

2. **Follow the same steps** as Ubuntu deployment for application setup and systemd service.

## ☁️ Cloud Deployment

### AWS EC2 Deployment

1. **Launch EC2 Instance**
   - Instance type: t3.micro or larger
   - OS: Ubuntu 22.04 LTS
   - Security group: Allow inbound traffic on port 3000
   - Storage: 8GB minimum

2. **Deploy Application**
   ```bash
   # Connect to instance
   ssh -i your-key.pem ubuntu@your-ec2-ip
   
   # Follow Ubuntu deployment steps above
   ```

3. **Configure Load Balancer (Optional)**
   - Create Application Load Balancer
   - Target group on port 3000
   - Health check: `/health`

### Google Cloud Run Deployment

1. **Prepare Container**
   ```bash
   # Build and tag image
   docker build -t gcr.io/your-project/cosmos-chain-registry-api .
   
   # Push to Google Container Registry
   docker push gcr.io/your-project/cosmos-chain-registry-api
   ```

2. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy cosmos-chain-registry-api \
     --image gcr.io/your-project/cosmos-chain-registry-api \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --port 3000 \
     --memory 512Mi \
     --set-env-vars NODE_ENV=production,LOG_LEVEL=info
   ```

### DigitalOcean Droplet

1. **Create Droplet**
   - Size: Basic $6/month (1GB RAM)
   - OS: Ubuntu 22.04
   - Enable monitoring

2. **One-Click Deployment Script**
   ```bash
   #!/bin/bash
   # Save as deploy.sh and run: bash deploy.sh
   
   # Update system
   apt update && apt upgrade -y
   
   # Install Node.js and dependencies
   curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
   apt-get install -y nodejs git
   
   # Clone and setup application
   git clone https://github.com/your-username/cosmos-chain-registry-api-server.git
   cd cosmos-chain-registry-api-server
   npm install
   npm run build
   
   # Configure environment
   cp .env.example .env
   sed -i 's/NODE_ENV=development/NODE_ENV=production/' .env
   
   # Install PM2 for process management
   npm install -g pm2
   
   # Start application
   pm2 start dist/app.js --name cosmos-chain-registry-api
   pm2 startup
   pm2 save
   
   echo "Deployment complete! API available at http://$(curl -s ifconfig.me):3000"
   ```

## 🔒 Production Security

### Firewall Configuration

```bash
# Ubuntu/Debian (UFW)
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 3000/tcp    # API
sudo ufw enable

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

### Reverse Proxy with Nginx

1. **Install Nginx**
   ```bash
   sudo apt install nginx
   ```

2. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/cosmos-api
   ```

   Add configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
   
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Enable Configuration**
   ```bash
   sudo ln -s /etc/nginx/sites-available/cosmos-api /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### SSL Certificate with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal (already configured)
sudo certbot renew --dry-run
```

## 📊 Monitoring & Maintenance

### Health Monitoring

```bash
# Simple health check script
#!/bin/bash
# Save as health-check.sh

URL="http://localhost:3000/health"
RESPONSE=$(curl -s $URL)

if echo $RESPONSE | grep -q "healthy"; then
    echo "$(date): API is healthy"
else
    echo "$(date): API is down - $RESPONSE"
    # Add alerting logic here
fi
```

### Log Rotation

```bash
# Configure logrotate
sudo nano /etc/logrotate.d/cosmos-chain-registry-api
```

Add configuration:
```
/home/cosmos-api/cosmos-chain-registry-api-server/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
```

### Backup Strategy

```bash
# Backup script
#!/bin/bash
# Save as backup.sh

BACKUP_DIR="/backup/cosmos-api"
APP_DIR="/home/cosmos-api/cosmos-chain-registry-api-server"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup configuration and data
tar -czf $BACKUP_DIR/cosmos-api-$DATE.tar.gz \
  $APP_DIR/.env \
  $APP_DIR/data \
  $APP_DIR/logs

# Keep only last 7 backups
find $BACKUP_DIR -name "cosmos-api-*.tar.gz" -mtime +7 -delete
```

## 🔒 Production Security

### Admin Authentication Security

**The sync endpoint is protected by dual authentication:**

1. **API Key Authentication**
   - Must provide `X-API-Key` header
   - Key is configurable via `ADMIN_API_KEY` environment variable
   - Use strong, randomly generated keys in production

2. **IP Whitelist**
   - Only allowed IPs can access sync endpoint
   - Configure via `ADMIN_IPS` environment variable
   - Supports both IPv4 and IPv6 addresses

**Security Best Practices:**

```bash
# 1. Generate strong admin API key
ADMIN_API_KEY=$(openssl rand -hex 32)

# 2. Restrict to specific IPs only
ADMIN_IPS="127.0.0.1,your-server-ip,admin-workstation-ip"

# 3. Monitor admin access logs
sudo journalctl -u cosmos-chain-registry-api | grep "Admin sync"

# 4. Rotate keys regularly
# Update ADMIN_API_KEY and restart service
```

**Admin Access Examples:**

```bash
# ✅ Correct usage
curl -X POST "https://your-domain.com/v1/sync" \
  -H "X-API-Key: your-secure-admin-key"

# ❌ Will fail - no API key
curl -X POST "https://your-domain.com/v1/sync"

# ❌ Will fail - wrong IP (if not in whitelist)
# Returns 403 Forbidden

# ❌ Will fail - wrong API key
curl -X POST "https://your-domain.com/v1/sync" \
  -H "X-API-Key: wrong-key"
```

## 🔧 Environment Configuration

### Production Environment Variables

```bash
# Required Settings
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
ENABLE_SWAGGER=false

# Performance Settings
CACHE_TTL=3600
SYNC_INTERVAL=86400

# Security Settings
ALLOWED_ORIGINS=https://your-domain.com

# Admin Authentication (IMPORTANT!)
ADMIN_API_KEY=cosmos-super-secure-admin-key-change-this
ADMIN_IPS=127.0.0.1,your-production-server-ip,your-admin-ip

# Optional: General API Authentication
API_KEYS=client-key-1,client-key-2

# Optional Settings
MAX_REQUEST_SIZE=10kb
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=1000
```

### Admin Security Setup

**🚨 CRITICAL: Change default admin credentials!**

1. **Generate secure admin API key:**
```bash
# Generate a strong API key
openssl rand -hex 32
# Or use: uuidgen or any password generator
```

2. **Configure IP whitelist:**
```bash
# Add your server and admin IPs
ADMIN_IPS=127.0.0.1,45.33.32.21,203.0.113.42
```

3. **Test admin access:**
```bash
# Test with correct credentials
curl -X POST "https://your-domain.com/v1/sync" \
  -H "X-API-Key: your-admin-key"

# Should return success or rate limit (not 401/403)
```

### Development vs Production

| Setting | Development | Production |
|---------|-------------|------------|
| NODE_ENV | development | production |
| LOG_LEVEL | debug | info |
| ENABLE_SWAGGER | true | false |
| ALLOWED_ORIGINS | * | specific-domain |
| ADMIN_API_KEY | test-key | strong-secure-key |
| ADMIN_IPS | 127.0.0.1,::1 | production-ips |

## 🚨 Troubleshooting

### Common Deployment Issues

1. **Port Already in Use**
   ```bash
   # Find process using port 3000
   sudo lsof -i :3000
   
   # Kill process or change port in .env
   ```

2. **Permission Denied**
   ```bash
   # Fix file permissions
   sudo chown -R cosmos-api:cosmos-api /home/cosmos-api/cosmos-chain-registry-api-server
   sudo chmod -R 755 /home/cosmos-api/cosmos-chain-registry-api-server
   ```

3. **Git Clone Fails**
   ```bash
   # Check network connectivity
   ping github.com
   
   # Try HTTPS instead of SSH
   git clone https://github.com/cosmos/chain-registry.git
   ```

4. **Out of Memory**
   ```bash
   # Add swap space
   sudo fallocate -l 1G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

### Performance Optimization

1. **Enable Gzip Compression** (already included in app)
2. **Use CDN** for static assets (if any)
3. **Implement Rate Limiting** (already included)
4. **Monitor Resource Usage**
   ```bash
   # Check memory usage
   free -h
   
   # Check disk usage
   df -h
   
   # Monitor processes
   htop
   ```

## 📞 Support

For deployment issues:
1. Check application logs: `sudo journalctl -u cosmos-chain-registry-api -f`
2. Verify environment configuration
3. Test API endpoints manually
4. Open GitHub issue with deployment details

---

**Next Steps**: After successful deployment, monitor the `/health` endpoint and set up automated backups for production systems.
