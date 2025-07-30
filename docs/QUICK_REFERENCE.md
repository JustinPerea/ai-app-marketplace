# Server Troubleshooting Quick Reference Card

*Keep this card handy during development*

## 🚨 EMERGENCY SERVER RECOVERY (2 Minutes)

### Step 1: Kill Hung Processes
```bash
pkill -f "next dev" || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
```

### Step 2: Clean Restart
```bash
npm run dev
```

### Step 3: Verify Health
```bash
curl -I http://localhost:3000
# Expected: HTTP/1.1 200 OK
```

## 🔧 AUTOMATED SCRIPTS (Use These!)

```bash
# Complete pre-change verification
npm run pre-change-check

# Emergency restart with cleanup
npm run emergency-restart

# Check server health
npm run health-check

# Verify critical endpoints
npm run test-endpoints

# Monitor for errors in real-time
npm run monitor-logs
```

## 🔍 DIAGNOSTIC COMMANDS

### Server Status
```bash
npm run server-status          # Check if server running
curl -I http://localhost:3000  # Test connectivity
```

### TypeScript Issues
```bash
npm run type-check             # Check compilation
grep -i "error" server.log     # Find errors in logs
```

### Memory Problems
```bash
ps aux | grep node             # Check memory usage
NODE_OPTIONS="--max-old-space-size=4096" npm run dev  # Restart with more memory
```

## ⚠️ WARNING SIGNS TO WATCH

### Server Logs
- ❌ `TypeScript compilation errors`
- ❌ `Cannot find module` errors
- ❌ `Auth0 import errors`
- ❌ `Zod validation errors using .errors`
- ❌ `Memory usage > 4GB`

### Browser Console
- ❌ `Hydration mismatches`
- ❌ `React component errors`
- ❌ `API fetch failures`
- ❌ `Auth0 configuration warnings`

## 🏥 HEALTH CHECK ENDPOINTS

```bash
# Basic connectivity
curl -I http://localhost:3000

# Main pages
curl -I http://localhost:3000/marketplace
curl -I http://localhost:3000/setup

# API endpoints
curl -s http://localhost:3000/api/ai/providers | head -10
curl -I http://localhost:3000/api/ai/health
```

## 🚧 KNOWN PROBLEMATIC PATTERNS

### ❌ AVOID THESE:
```typescript
// Bad: Using deprecated Auth0 import
import { getSession } from '@auth0/nextjs-auth0';

// Bad: Using deprecated Zod error format
catch (error) { console.log(error.errors); }

// Bad: Creating infinite React loops
useEffect(() => { setState(state + 1); });
```

### ✅ USE THESE INSTEAD:
```typescript
// Good: Use project Auth0 wrapper
import { getSession } from '@/lib/auth/auth0-config';

// Good: Use current Zod error format
catch (error) { console.log(error.issues); }

// Good: Proper dependency arrays
useEffect(() => { setState(state + 1); }, [dependency]);
```

## 📊 SUCCESS METRICS

### Target Performance
- **Server start**: <2 seconds
- **Page load**: <60ms (after compilation)
- **API response**: <500ms
- **TypeScript compilation**: <200ms

### Health Indicators
- ✅ All health checks pass
- ✅ No TypeScript errors
- ✅ Memory usage <2GB
- ✅ Response times within targets

## 🎯 PREVENTION CHECKLIST (Quick)

Before ANY code change:
- [ ] `npm run pre-change-check`
- [ ] Review [Development Checklist](./DEVELOPMENT_CHECKLIST.md)
- [ ] Have recovery commands ready

After ANY code change:
- [ ] `npm run post-change-verify`
- [ ] Test modified functionality
- [ ] Check server logs for warnings

## 📞 ESCALATION PATH

1. **Level 1**: Use this quick reference card
2. **Level 2**: Follow [Development Checklist](./DEVELOPMENT_CHECKLIST.md)
3. **Level 3**: Review [Server Troubleshooting Guide](../SERVER_TROUBLESHOOTING.md)
4. **Level 4**: Check [Error Resolution Log](./ERROR_RESOLUTION_LOG.md)

## 🚀 QUICK FIXES FOR COMMON ISSUES

### Auth0 Issues
```bash
# Reset auth configuration
rm -f .env.local
# Use development bypass (already configured)
```

### TypeScript Issues
```bash
# Clear TypeScript cache
rm -rf .next
npm run dev
```

### Port Conflicts
```bash
# Kill processes on port 3000
lsof -ti:3000 | xargs kill -9
```

### Memory Issues
```bash
# Restart with more memory
NODE_OPTIONS="--max-old-space-size=4096" npm run dev
```

## 📝 LOG WHAT YOU DO

When using emergency procedures, note:
- **Time**: When issue occurred
- **Symptoms**: What went wrong
- **Commands Used**: Which recovery steps worked
- **Duration**: How long to resolve

---

## 💡 PRO TIPS

1. **Keep this card open** in a browser tab
2. **Run health checks regularly** during development
3. **Monitor logs in separate terminal** with `npm run monitor-logs`
4. **Use automated scripts** instead of manual commands
5. **Document new issues** in Error Resolution Log

---

*This card covers 90% of common server issues. For complex problems, refer to the full troubleshooting documentation.*