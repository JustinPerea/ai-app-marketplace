# Development Checklist - Server Stability Prevention

*Last Updated: 2025-01-27*

## 🚨 MANDATORY PRE-CHANGE PROCEDURES

Before making ANY code changes, developers MUST complete ALL items in this checklist.

### ✅ Phase 1: Environment Verification (2 minutes)

- [ ] **Server Status Check**
  ```bash
  # Verify server is running and responsive
  curl -I http://localhost:3000
  # Expected: HTTP/1.1 200 OK
  ```

- [ ] **Health Check Validation**
  ```bash
  npm run health-check
  # Should pass all critical endpoint tests
  ```

- [ ] **Critical Routes Test**
  ```bash
  npm run test-endpoints
  # Verify all marketplace and API routes load
  ```

- [ ] **TypeScript Compilation**
  ```bash
  npm run type-check
  # Must show no blocking errors
  ```

### ✅ Phase 2: Code Impact Assessment (3 minutes)

- [ ] **Review Change Scope**
  - [ ] Identify files being modified
  - [ ] Assess potential TypeScript impact
  - [ ] Check for Auth0/Zod usage patterns
  - [ ] Verify no infinite loop risk

- [ ] **Known Risk Patterns Check**
  - [ ] No Auth0 import changes without checking wrapper
  - [ ] No Zod error handling without using `error.issues`
  - [ ] No React component infinite loops
  - [ ] No large file uploads without streaming

- [ ] **Dependency Impact**
  - [ ] No new dependencies without security review
  - [ ] No breaking changes to shared utilities
  - [ ] No modifications to critical API routes without testing

### ✅ Phase 3: Backup & Recovery Preparation (1 minute)

- [ ] **Git Status Clean**
  ```bash
  git status
  # Commit or stash any pending changes
  ```

- [ ] **Recovery Commands Ready**
  ```bash
  # Copy these commands for quick access if needed:
  # pkill -f "next dev"; npm run dev
  # curl -I http://localhost:3000/marketplace
  # npm run type-check
  ```

- [ ] **Log Monitoring Setup**
  ```bash
  # Open terminal tab for monitoring
  tail -f server.log
  ```

### ✅ Phase 4: Testing Strategy (2 minutes)

- [ ] **Test Plan Defined**
  - [ ] Which components will be tested
  - [ ] Which API endpoints will be verified
  - [ ] Which user flows will be validated

- [ ] **Rollback Plan**
  - [ ] Git commit hash noted for rollback
  - [ ] Understanding of changes to revert
  - [ ] Timeline for testing and verification

## 🛠️ POST-CHANGE VERIFICATION

After implementing changes, MUST verify:

### ✅ Immediate Verification (1 minute)

- [ ] **Server Still Responsive**
  ```bash
  curl -I http://localhost:3000
  curl -I http://localhost:3000/marketplace
  ```

- [ ] **No Compilation Errors**
  - [ ] Check terminal for TypeScript errors
  - [ ] Check browser console for React errors
  - [ ] Verify page loads without warnings

### ✅ Functional Testing (3 minutes)

- [ ] **Modified Components Work**
  - [ ] Test changed functionality manually
  - [ ] Verify no regression in related features
  - [ ] Check mobile responsiveness if UI changed

- [ ] **API Endpoints Functional**
  ```bash
  # Test critical API routes
  curl -s http://localhost:3000/api/ai/providers | head -20
  ```

- [ ] **Integration Points**
  - [ ] Provider setup flow works
  - [ ] AI provider connections test successfully
  - [ ] Marketplace apps load and function

### ✅ Stability Verification (2 minutes)

- [ ] **Server Logs Clean**
  ```bash
  # Check for new errors in logs
  tail -20 server.log | grep -i error
  ```

- [ ] **Memory Usage Normal**
  ```bash
  # Check memory usage hasn't spiked
  ps aux | grep node
  ```

- [ ] **Performance Baseline**
  - [ ] Page load times <1 second
  - [ ] API responses <500ms for simple requests
  - [ ] No memory leaks detected

## 🚨 ERROR RESOLUTION PROTOCOL

If ANY issues detected:

### Step 1: STOP Development
- Do not proceed with additional changes
- Document the specific error observed
- Note the exact time and context

### Step 2: Use Quick Recovery
```bash
# Emergency server restart
pkill -f "next dev"
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
npm run dev
```

### Step 3: Diagnose & Document
- Follow [Server Troubleshooting Guide](../SERVER_TROUBLESHOOTING.md)
- Log issue in [Error Resolution Log](./ERROR_RESOLUTION_LOG.md)
- Use [Quick Reference](./QUICK_REFERENCE.md) for common fixes

### Step 4: Verify Resolution
- Complete this checklist again after fixing
- Ensure all items pass before continuing development

## 📊 CHECKLIST METRICS

Track completion times to improve efficiency:

- **Phase 1-4 Target Time**: <8 minutes total
- **Post-Change Verification**: <6 minutes total
- **Error Resolution**: <5 minutes average

### Success Criteria
- ✅ All checklist items completed
- ✅ Server stable and responsive
- ✅ No new errors introduced
- ✅ Functionality verified working

## 🔧 AUTOMATION HELPERS

Use these scripts to speed up checklist completion:

```bash
# Complete Phase 1 verification
npm run pre-change-check

# Complete post-change verification  
npm run post-change-verify

# Emergency recovery if issues detected
npm run emergency-restart
```

## 📝 CHECKLIST LOG

Keep track of checklist usage:

```
Date: _______ Time: _______ Developer: _______
Changes Made: _________________________________
Pre-Change Duration: _____ minutes
Issues Detected: ______________________________
Resolution Time: _____ minutes
Post-Change Duration: _____ minutes
```

---

## 🎯 ENFORCEMENT

This checklist is MANDATORY for:
- All code changes affecting server stability
- API route modifications
- Component updates that could affect compilation
- Dependency changes or updates
- Authentication or validation logic changes

**Violation of this checklist process may result in development delays and debugging overhead that could be prevented through proper verification procedures.**

---

*This checklist is designed to prevent the types of server instability issues documented in our troubleshooting guide. Following these procedures ensures development velocity remains high while maintaining system stability.*