# Redis Cache Setup Guide - 70% Cost Reduction System

*Last Updated: 2025-01-26*

## Overview

This guide walks you through setting up Redis caching for the AI Marketplace Platform to achieve **70% cost reduction** through intelligent caching of AI API calls.

## Why Redis Caching?

- **70% Cost Reduction**: Cache AI responses to eliminate redundant API calls
- **Faster Response Times**: Sub-second responses for cached requests
- **Scalable Architecture**: Distributed caching across multiple instances
- **High Availability**: Graceful fallback to memory cache if Redis is unavailable

## Quick Setup (Recommended: Upstash Redis)

### 1. Create Upstash Redis Instance

1. **Sign up for Upstash**: Visit [upstash.com](https://upstash.com) and create account
2. **Create Redis Database**: 
   - Choose **Global** region for best performance
   - Select **Free** tier (sufficient for development)
   - Note down your **REST URL** and **REST Token**

### 2. Configure Environment Variables

Add to your `.env.local` file:

```bash
# Redis Cache Configuration (70% Cost Reduction)
UPSTASH_REDIS_REST_URL="https://your-endpoint.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token-here"

# Cache Settings
CACHE_ENABLED="true"
CACHE_TTL_SECONDS="3600"
CACHE_SEMANTIC_SIMILARITY="true"
CACHE_COMPRESSION="true"
```

### 3. Test Redis Connection

```bash
# Start your development server
npm run dev

# Test cache metrics endpoint
curl http://localhost:3000/api/cache/metrics
```

Expected response:
```json
{
  "status": "healthy",
  "costReduction": {
    "targetPercentage": 70,
    "actualPercentage": 0,
    "status": "unknown"
  },
  "redis": {
    "connected": true,
    "stats": { "redisAvailable": true }
  }
}
```

## Alternative Setup Options

### Option 1: Local Redis (Development)

```bash
# Install Redis locally
brew install redis  # macOS
# or
sudo apt-get install redis-server  # Ubuntu

# Start Redis server
redis-server

# Update .env.local
UPSTASH_REDIS_REST_URL="http://localhost:6379"
UPSTASH_REDIS_REST_TOKEN=""
```

### Option 2: Docker Redis

```bash
# Run Redis in Docker
docker run -d -p 6379:6379 --name redis-cache redis:alpine

# Update .env.local for local Redis
UPSTASH_REDIS_REST_URL="http://localhost:6379"
UPSTASH_REDIS_REST_TOKEN=""
```

## Caching Strategy

### Cache Types Implemented

1. **PDF Processing Cache** (48-hour TTL)
   - Caches expensive PDF → Notes generation
   - Highest cost savings potential
   - Content-based hashing for exact matches

2. **AI Response Cache** (2-hour TTL)
   - General AI conversation caching
   - Semantic similarity matching
   - Provider-agnostic caching

3. **Template-Based Cache** (6-hour TTL)
   - Code reviews, summaries, structured content
   - Pattern-based caching for repetitive tasks

### Cost Reduction Calculation

```typescript
// Example: 1000 requests/month per user
const monthlyRequests = 1000;
const avgCostPerRequest = 0.002; // Mixed provider usage
const cacheHitRate = 0.70; // 70% target

// Before caching: $2.00/month
const costBefore = monthlyRequests * avgCostPerRequest;

// After caching: $0.60/month (70% reduction)
const costAfter = monthlyRequests * (1 - cacheHitRate) * avgCostPerRequest;

console.log(`Cost reduction: ${((costBefore - costAfter) / costBefore * 100).toFixed(1)}%`);
```

## Monitoring & Optimization

### 1. Cache Metrics Dashboard

Visit: `http://localhost:3000/api/cache/metrics`

Key metrics to monitor:
- **Hit Rate**: Target >70% for cost reduction
- **Cost Savings**: Real-time savings calculation
- **Response Times**: Cache vs API response times
- **Redis Health**: Connection and performance status

### 2. Cache Optimization Commands

```bash
# View cache metrics
curl http://localhost:3000/api/cache/metrics

# Clear PDF cache
curl -X DELETE "http://localhost:3000/api/cache/metrics?type=pdf"

# Clear all caches
curl -X DELETE "http://localhost:3000/api/cache/metrics?type=all"

# Warm cache with test data
curl -X POST http://localhost:3000/api/cache/metrics \
  -H "Content-Type: application/json" \
  -d '{"action":"warm"}'
```

### 3. Performance Tuning

#### TTL Optimization
```bash
# Adjust cache TTL based on your use case
CACHE_TTL_SECONDS="7200"  # 2 hours for general AI
PDF_CACHE_TTL="172800"    # 48 hours for PDF processing
```

#### Memory Optimization
```bash
# Enable compression for large responses
CACHE_COMPRESSION="true"

# Limit fallback cache size
FALLBACK_CACHE_MAX_ENTRIES="1000"
```

## Cost Analysis Examples

### Scenario 1: PDF Notes Generator (High Usage)

```
Usage: 500 PDF processings/month
Cost per request: $0.005 (Gemini Flash)
Cache hit rate: 75%

Before caching: 500 × $0.005 = $2.50/month
After caching: 125 × $0.005 = $0.625/month
Savings: $1.875/month (75% reduction)
```

### Scenario 2: General AI Chat (Medium Usage)

```
Usage: 2000 requests/month
Cost per request: $0.002 (mixed providers)
Cache hit rate: 60%

Before caching: 2000 × $0.002 = $4.00/month
After caching: 800 × $0.002 = $1.60/month
Savings: $2.40/month (60% reduction)
```

### Scenario 3: Enterprise Usage (High Volume)

```
Usage: 10,000 requests/month
Cost per request: $0.003 (premium models)
Cache hit rate: 80%

Before caching: 10,000 × $0.003 = $30.00/month
After caching: 2,000 × $0.003 = $6.00/month
Savings: $24.00/month (80% reduction)
```

## Troubleshooting

### Redis Connection Issues

1. **Check Environment Variables**:
   ```bash
   echo $UPSTASH_REDIS_REST_URL
   echo $UPSTASH_REDIS_REST_TOKEN
   ```

2. **Test Redis Connectivity**:
   ```bash
   curl -X POST $UPSTASH_REDIS_REST_URL/ping \
     -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN"
   ```

3. **Check Application Logs**:
   ```bash
   # Look for Redis initialization messages
   npm run dev 2>&1 | grep -i redis
   ```

### Low Cache Hit Rates

1. **Check TTL Settings**: May be too short for your use case
2. **Enable Semantic Similarity**: Improves matching for similar requests
3. **Monitor Request Patterns**: Look for cacheable patterns in your usage

### Memory Issues

1. **Enable Compression**: Reduces memory usage for large responses
2. **Adjust TTL**: Shorter TTL = less memory usage
3. **Monitor Upstash Usage**: Check your Redis memory consumption

## Production Deployment

### Vercel Deployment

1. **Add Environment Variables** in Vercel dashboard:
   ```
   UPSTASH_REDIS_REST_URL
   UPSTASH_REDIS_REST_TOKEN
   CACHE_ENABLED=true
   ```

2. **Configure Upstash Redis** for production:
   - Choose appropriate region (close to your Vercel deployment)
   - Consider paid plans for higher throughput
   - Enable automatic scaling

### Performance Recommendations

1. **Regional Deployment**: Place Redis close to your application
2. **Connection Pooling**: Upstash handles this automatically
3. **Monitoring**: Set up alerts for cache hit rate and Redis health
4. **Backup Strategy**: Upstash provides automated backups

## Security Considerations

1. **API Token Security**: Store Redis tokens securely in environment variables
2. **Data Encryption**: Sensitive data is automatically encrypted in transit
3. **Access Control**: Use Upstash's IP allowlisting in production
4. **Cache Invalidation**: Implement proper cache invalidation for sensitive data

## ROI Calculator

### Infrastructure Costs vs Savings

```typescript
// Monthly Redis cost (Upstash Pro)
const redisCost = 25; // $25/month for high-volume usage

// Monthly AI API savings
const requestsPerMonth = 50000;
const avgCostPerRequest = 0.002;
const cacheHitRate = 0.70;
const monthlySavings = requestsPerMonth * avgCostPerRequest * cacheHitRate;

// ROI calculation
const netSavings = monthlySavings - redisCost;
const roi = (netSavings / redisCost) * 100;

console.log(`Monthly savings: $${monthlySavings}`);
console.log(`Net savings: $${netSavings}`);
console.log(`ROI: ${roi.toFixed(1)}%`);

// Example output:
// Monthly savings: $70
// Net savings: $45
// ROI: 180%
```

## Next Steps

1. **Implement Caching**: Follow this setup guide
2. **Monitor Performance**: Use the metrics endpoint
3. **Optimize TTL**: Adjust based on your usage patterns
4. **Scale Redis**: Upgrade Upstash plan as usage grows
5. **Add More Cache Types**: Extend caching to other expensive operations

---

## Support

- **Documentation**: Check the `/docs` folder for additional guides
- **Cache Metrics**: Monitor at `/api/cache/metrics`
- **Upstash Support**: Visit [upstash.com/docs](https://upstash.com/docs)
- **Redis Best Practices**: [Redis documentation](https://redis.io/documentation)

*This caching system is designed to achieve 70% cost reduction while maintaining high performance and reliability.*