# Production Security & Cost Protection

## Current Protections Against Spam/Abuse

### Rate Limiting
- **5 requests per minute per IP address** (reduced from 10 for better protection)
- **Note**: In serverless deployments, rate limiting is per-instance
- **Recommendation**: For high-traffic production, use Redis-based rate limiting

### Input Validation
- **Character limits**: 10-2000 characters (reduced from 5000)
- **Spam detection**: Rejects inputs with excessive repeated characters
- **Content validation**: Requires meaningful text (>30% alphabetic characters)
- **Request size**: Limited to 10KB total

### Bot Detection
- **User-Agent filtering**: Blocks common bot patterns
- **Automated tool detection**: Blocks curl, wget, Postman, etc.
- **Script detection**: Blocks Python, Node.js, Java HTTP clients

### Error Protection
- **Sanitized responses**: No sensitive information leaked
- **Generic error messages**: Prevents information disclosure
- **Failed request tracking**: Analytics for monitoring abuse

## Additional Recommendations for Production

### 1. Enhanced Rate Limiting
```javascript
// Use Redis for persistent rate limiting across serverless instances
const RedisStore = require('rate-limit-redis');
const redisClient = require('redis').createClient(process.env.REDIS_URL);

const advancedLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'icebreaker_rl:'
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 3, // Further reduced for production
  message: { error: "Rate limit exceeded", code: "RATE_LIMITED" }
});
```

### 2. API Key/Authentication
Consider adding simple API keys for legitimate usage:
```javascript
// Require API key for programmatic access
app.use('/api', (req, res, next) => {
  const apiKey = req.header('X-API-Key');
  if (!apiKey && !req.get('User-Agent')?.includes('Mozilla')) {
    return res.status(401).json({ error: "API key required" });
  }
  next();
});
```

### 3. CAPTCHA Integration
For web interface, add CAPTCHA after multiple requests:
```javascript
// After 3 requests from same IP, require CAPTCHA
if (requestCount > 3) {
  const captchaValid = await verifyCaptcha(req.body.captchaToken);
  if (!captchaValid) {
    return res.status(400).json({ error: "CAPTCHA verification failed" });
  }
}
```

### 4. Cost Monitoring
```javascript
// Track OpenAI usage and costs
const costTracker = {
  dailyRequests: 0,
  dailyTokens: 0,
  maxDailyRequests: 1000, // Set your limits
  maxDailyTokens: 100000
};

// Block if limits exceeded
if (costTracker.dailyRequests >= costTracker.maxDailyRequests) {
  return res.status(429).json({ 
    error: "Daily usage limit reached",
    code: "DAILY_LIMIT_EXCEEDED"
  });
}
```

### 5. IP Blocking
```javascript
// Maintain a blocklist of abusive IPs
const blockedIPs = new Set(['1.2.3.4', '5.6.7.8']);

app.use((req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  if (blockedIPs.has(clientIP)) {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
});
```

## Environment Variables for Production

```bash
# Add these to your Vercel environment variables:
RATE_LIMIT_MAX=3              # Requests per minute
DAILY_REQUEST_LIMIT=1000      # Daily request cap
BLOCK_BOTS=true              # Enable bot detection
REQUIRE_CAPTCHA_AFTER=5      # CAPTCHA after N requests
```

## Monitoring & Alerts

Set up monitoring for:
- High request volumes from single IPs
- OpenAI API costs exceeding thresholds
- Error rates above normal
- Bot detection triggers

## Current Status
✅ Basic rate limiting (5/minute)
✅ Input validation & spam detection
✅ Bot detection via User-Agent
✅ Request size limits
✅ Error sanitization

⚠️ **Serverless Limitations**: Rate limiting doesn't persist across instances
⚠️ **No persistent storage**: Consider Redis for production scale