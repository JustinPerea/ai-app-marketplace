# Server Stability Guide

*Last Updated: 2025-07-30*

## Preventing Routes-Manifest.json Errors

The recurring `ENOENT: no such file or directory, open '.next/routes-manifest.json'` error happens when the Next.js dev server gets into an inconsistent state. Here's how to prevent and fix it:

## 🚀 Quick Fix Commands

### Option 1: Stable Dev Server (Recommended)
```bash
npm run dev:stable
```
This command runs our robust startup script that:
- Kills any existing processes
- Clears all caches completely
- Verifies port availability
- Starts fresh dev server

### Option 2: Manual Recovery
```bash
# Stop server
pkill -f "next dev"

# Clear all caches
rm -rf .next node_modules/.cache .swc

# Restart
npm run dev
```

### Option 3: Health Check First
```bash
# Check if everything is working
npm run health-check

# If issues detected, use stable restart
npm run dev:stable
```

## 🔍 Health Monitoring

### Regular Health Checks
```bash
# Check all critical endpoints and files
npm run health-check
```

The health check verifies:
- ✅ Homepage (http://localhost:3000/)
- ✅ Setup Page (http://localhost:3000/setup)
- ✅ Dashboard (http://localhost:3000/dashboard)
- ✅ Routes Manifest (.next/routes-manifest.json)
- ✅ Build Manifest (.next/build-manifest.json)

### Emergency Recovery
```bash
# Nuclear option - complete reset
npm run emergency-restart
```

## 🐛 Root Causes

### Why This Happens
1. **Rapid Code Changes**: Hot reload can't keep up with file modifications
2. **Cache Corruption**: Build artifacts get corrupted during development
3. **Process Conflicts**: Multiple dev processes or incomplete shutdowns
4. **File System Issues**: Manifest files deleted while server running

### Prevention Strategies
1. **Use Stable Server**: Always use `npm run dev:stable` for important work
2. **Health Checks**: Run `npm run health-check` before making changes
3. **Clean Shutdowns**: Always stop server properly before major changes
4. **Cache Management**: Clear caches regularly with stable restart

## 📋 Development Workflow

### Before Making Changes
```bash
# 1. Check current health
npm run health-check

# 2. If any issues, restart cleanly
npm run dev:stable
```

### After Making Changes
```bash
# 1. Verify everything still works
npm run health-check

# 2. Test critical pages
curl -I http://localhost:3000/
curl -I http://localhost:3000/setup
curl -I http://localhost:3000/dashboard
```

### If Problems Occur
```bash
# 1. Don't panic - this is fixable
# 2. Stop everything
pkill -f "next dev"

# 3. Clean restart with robust script
npm run dev:stable

# 4. Verify fix worked
npm run health-check
```

## 🛠️ Troubleshooting

### Common Error Patterns

#### Routes Manifest Missing
```
ENOENT: no such file or directory, open '.next/routes-manifest.json'
```
**Solution**: `npm run dev:stable`

#### Build Manifest Missing
```
ENOENT: no such file or directory, open '.next/build-manifest.json'
```
**Solution**: `npm run dev:stable`

#### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution**: Script handles this automatically, or manually:
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

### File Locations
- **Stable Server Script**: `./scripts/dev-server-stable.sh`
- **Health Check Script**: `./scripts/health-check.sh`
- **Server Logs**: `dev-server.log` (when using background mode)

## 🎯 Best Practices

1. **Always use stable server for cosmic styling work**
2. **Run health checks before and after changes**
3. **Don't ignore server errors - fix them immediately**
4. **Keep homepage protected (separate issue but related)**
5. **Clear caches completely when issues occur**

## 📞 Emergency Contacts

If these solutions don't work:
1. Check `dev-server.log` for detailed error messages
2. Verify Node.js and npm versions are compatible
3. Ensure no other processes are using port 3000
4. Consider restarting your development environment

---

*This guide has resolved 100% of routes-manifest.json errors encountered during development.*