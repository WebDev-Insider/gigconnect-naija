# Deployment Guide

This guide covers deploying the GigConnect Backend to various cloud platforms.

## 🚀 Render Deployment

### Prerequisites

- Render account
- GitHub repository connected
- Environment variables configured

### Steps

1. **Create New Web Service**

   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**

   ```
   Name: gigconnect-backend
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

3. **Environment Variables**
   Set the following environment variables in Render:

   ```
   NODE_ENV=production
   PORT=10000
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   MONGO_URI=your_mongodb_atlas_uri
   REDIS_URL=your_redis_url
   PAYSTACK_SECRET_KEY=your_paystack_secret_key
   PAYSTACK_PUBLIC_KEY=your_paystack_public_key
   PAYSTACK_WEBHOOK_SECRET=your_paystack_webhook_secret
   RESEND_API_KEY=your_resend_api_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Auto-Deploy Settings**

   - Enable auto-deploy from main branch
   - Set branch to `main`

5. **Health Check**
   - Health Check Path: `/health`
   - Expected Response: 200 OK

### Render Environment Setup

#### MongoDB Atlas

1. Create MongoDB Atlas cluster
2. Set up database user with read/write permissions
3. Whitelist Render IP addresses
4. Get connection string

#### Redis

1. Use Redis Cloud or Upstash
2. Get connection URL
3. Configure password and SSL

#### Supabase

1. Create Supabase project
2. Run database migrations
3. Configure RLS policies
4. Set up authentication

## 🐳 Docker Deployment

### Local Docker Build

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

### Docker Compose Production

```yaml
version: '3.8'

services:
  backend:
    image: your-registry/gigconnect-backend:latest
    ports:
      - '3001:3001'
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    restart: unless-stopped
    depends_on:
      - mongodb
      - redis

  mongodb:
    image: mongo:7.0
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

  redis:
    image: redis:7.2-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  mongodb_data:
  redis_data:
```

### Docker Registry

```bash
# Tag image
docker tag gigconnect-backend your-registry/gigconnect-backend:latest

# Push to registry
docker push your-registry/gigconnect-backend:latest
```

## ☁️ AWS Deployment

### ECS Fargate

1. **Create ECS Cluster**

   ```bash
   aws ecs create-cluster --cluster-name gigconnect-backend
   ```

2. **Create Task Definition**

   ```json
   {
     "family": "gigconnect-backend",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "256",
     "memory": "512",
     "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
     "containerDefinitions": [
       {
         "name": "gigconnect-backend",
         "image": "your-registry/gigconnect-backend:latest",
         "portMappings": [
           {
             "containerPort": 3001,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {
             "name": "NODE_ENV",
             "value": "production"
           }
         ]
       }
     ]
   }
   ```

3. **Create Service**
   ```bash
   aws ecs create-service \
     --cluster gigconnect-backend \
     --service-name gigconnect-backend-service \
     --task-definition gigconnect-backend:1 \
     --desired-count 2 \
     --launch-type FARGATE \
     --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
   ```

### AWS Lambda (Serverless)

1. **Install Serverless Framework**

   ```bash
   npm install -g serverless
   ```

2. **Create serverless.yml**

   ```yaml
   service: gigconnect-backend

   provider:
     name: aws
     runtime: nodejs18.x
     region: us-east-1
     environment:
       NODE_ENV: production
       SUPABASE_URL: ${env:SUPABASE_URL}
       MONGO_URI: ${env:MONGO_URI}

   functions:
     api:
       handler: dist/index.handler
       events:
         - http:
             path: /{proxy+}
             method: ANY
       timeout: 30
       memorySize: 512
   ```

3. **Deploy**
   ```bash
   serverless deploy
   ```

## 🔒 Security Configuration

### SSL/TLS

- Use Let's Encrypt for free certificates
- Configure automatic renewal
- Force HTTPS redirects

### Environment Variables

- Never commit `.env` files
- Use secrets management services
- Rotate keys regularly

### Network Security

- Configure firewall rules
- Use VPC for AWS deployments
- Restrict database access

### Monitoring

- Set up logging aggregation
- Configure alerting
- Monitor performance metrics

## 📊 Performance Optimization

### Database

- Use connection pooling
- Implement query optimization
- Set up read replicas

### Caching

- Redis for session storage
- CDN for static assets
- Application-level caching

### Scaling

- Horizontal scaling with load balancers
- Auto-scaling groups
- Container orchestration

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**

   - Check connection strings
   - Verify network access
   - Check credentials

2. **Environment Variables Missing**

   - Verify all required variables
   - Check variable names
   - Restart service after changes

3. **Port Conflicts**

   - Check if port is in use
   - Verify firewall settings
   - Use different port if needed

4. **Memory Issues**
   - Increase container memory
   - Check for memory leaks
   - Optimize application code

### Debug Commands

```bash
# Check service status
docker ps
docker logs gigconnect-backend

# Check environment variables
docker exec gigconnect-backend env

# Check database connectivity
docker exec gigconnect-backend npm run db:health

# View logs
docker logs -f gigconnect-backend
```

### Health Checks

```bash
# Application health
curl http://localhost:3001/health

# Database health
curl http://localhost:3001/api/v1/health

# Individual service health
curl http://localhost:3001/health/detailed
```

## 📈 Monitoring & Logging

### Application Metrics

- Request/response times
- Error rates
- Throughput

### Infrastructure Metrics

- CPU usage
- Memory usage
- Disk I/O
- Network I/O

### Log Aggregation

- Centralized logging
- Log rotation
- Search and filtering

### Alerting

- Error rate thresholds
- Performance degradation
- Service availability

## 🔄 CI/CD Integration

### GitHub Actions

- Automated testing
- Build and deploy
- Environment promotion

### Deployment Strategies

- Blue-green deployment
- Rolling updates
- Canary releases

### Rollback Procedures

- Quick rollback triggers
- Database migration rollback
- Configuration rollback

---

For additional support, refer to the main README or create an issue in the repository.
