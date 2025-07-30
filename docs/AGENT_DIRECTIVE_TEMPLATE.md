# Enhanced Agent Directive Template with Server Stability Requirements

*For use with Claude Code and AI development assistants*

## 📋 STANDARD AGENT DIRECTIVE

Copy and customize this directive template for your AI marketplace development sessions:

---

### 🎯 PROJECT CONTEXT
You are working on the **AI App Marketplace Platform** - a Next.js 14+ application with BYOK architecture. Review the project context in `/CLAUDE.md` for complete background.

### 🚨 MANDATORY SERVER STABILITY PROTOCOL

**CRITICAL:** Before performing ANY development tasks, you MUST:

1. **Server Health Verification**
   ```
   - Check current server status
   - Verify critical endpoints are responding
   - Review recent server logs for errors
   - Confirm TypeScript compilation is clean
   ```

2. **Pre-Change Checklist Compliance**
   ```
   - Reference /docs/DEVELOPMENT_CHECKLIST.md
   - Run automated health checks: npm run pre-change-check
   - Verify no known problematic patterns in planned changes
   - Prepare rollback strategy if issues occur
   ```

3. **Error Resolution Integration**
   ```
   - If ANY server instability detected, follow /SERVER_TROUBLESHOOTING.md
   - Use /docs/QUICK_REFERENCE.md for emergency procedures
   - Document all stability issues in /docs/ERROR_RESOLUTION_LOG.md
   - Implement prevention measures BEFORE implementing fixes
   ```

### 🔧 ERROR RESOLUTION PROTOCOL

When encountering ANY errors or instability:

1. **STOP** current development task immediately
2. **ASSESS** server stability using health check commands
3. **RESOLVE** using documented troubleshooting procedures
4. **VERIFY** complete stability before resuming development
5. **DOCUMENT** the issue and resolution for future prevention

### 🛠️ AUTOMATED TOOLS USAGE

ALWAYS use these automated scripts instead of manual commands:

```bash
# Pre-development verification
npm run pre-change-check

# Emergency server recovery
npm run emergency-restart

# Post-change verification
npm run post-change-verify

# Health monitoring
npm run health-check
npm run test-endpoints
npm run monitor-logs
```

### 📚 REQUIRED DOCUMENTATION REVIEW

Before starting any task, review:
- `/CLAUDE.md` - Project context and current status
- `/SERVER_TROUBLESHOOTING.md` - Complete troubleshooting guide
- `/docs/DEVELOPMENT_CHECKLIST.md` - Pre-change verification requirements
- `/docs/QUICK_REFERENCE.md` - Emergency procedures
- `/docs/ERROR_RESOLUTION_LOG.md` - Historical issues and solutions

### 🎯 TASK-SPECIFIC REQUIREMENTS

**For Code Changes:**
- [ ] Complete development checklist before modifications
- [ ] Test TypeScript compilation after changes
- [ ] Verify no Auth0/Zod problematic patterns introduced
- [ ] Confirm server responsiveness after implementation

**For Debugging Tasks:**
- [ ] Check server stability before investigating issues
- [ ] Use troubleshooting guide procedures systematically
- [ ] Document findings in error resolution log
- [ ] Verify fixes don't introduce new stability issues

**For Feature Development:**
- [ ] Ensure server health before adding functionality
- [ ] Test integration points after implementation
- [ ] Verify performance benchmarks maintained
- [ ] Confirm no regression in existing features

### 🚀 SUCCESS CRITERIA

Consider the task successful only when:
- ✅ Server remains stable throughout development
- ✅ All health checks pass consistently
- ✅ No new errors introduced to system
- ✅ Performance benchmarks maintained or improved
- ✅ Documentation updated if new patterns discovered

### ⚠️ ESCALATION TRIGGERS

Immediately escalate if:
- Server becomes unresponsive during development
- TypeScript compilation errors cannot be resolved quickly
- Memory usage exceeds 4GB consistently
- API response times exceed 1 second regularly
- Auth0 or Zod integration issues arise

---

## 🎯 CUSTOMIZATION INSTRUCTIONS

### For Specific Development Tasks:

**Add task-specific requirements:**
```
TASK: [Specific development goal]
CONTEXT: [Additional context for this session]
CONSTRAINTS: [Any specific limitations or requirements]
SUCCESS METRICS: [How to measure task completion]
```

### For Error Investigation:

**Add investigation parameters:**
```
ISSUE: [Specific problem to investigate]
SYMPTOMS: [Observed behavior and error messages]
IMPACT: [How the issue affects system functionality]
PRIORITY: [Urgency level for resolution]
```

### For Feature Implementation:

**Add feature specifications:**
```
FEATURE: [New functionality to implement]
REQUIREMENTS: [Functional and technical requirements]
INTEGRATION: [How it connects with existing system]
TESTING: [Specific testing procedures needed]
```

## 📊 SESSION TRACKING

Use this template to track session progress:

```
SESSION START TIME: ___________
AGENT: _____________ TASK: _____________
PRE-CHECK STATUS: [ ] PASSED [ ] FAILED
DEVELOPMENT PHASE: [ ] PLANNING [ ] IMPLEMENTATION [ ] TESTING
ISSUES ENCOUNTERED: ___________________________
RESOLUTION TIME: _______ TOTAL SESSION TIME: _______
SERVER STABILITY: [ ] MAINTAINED [ ] COMPROMISED [ ] IMPROVED
POST-CHECK STATUS: [ ] PASSED [ ] FAILED
DOCUMENTATION UPDATED: [ ] YES [ ] NO [ ] N/A
```

## 🔒 ENFORCEMENT REQUIREMENTS

**This directive is MANDATORY for:**
- All server-related development tasks
- Any code changes affecting stability
- Debugging and error resolution sessions
- Feature development and integration work
- Performance optimization tasks

**Violation indicators:**
- Proceeding with development during server instability
- Skipping pre-change verification procedures
- Not documenting stability issues encountered
- Introducing new errors without resolution

---

## 💡 AGENT OPTIMIZATION TIPS

1. **Batch Health Checks**: Run all verification commands together
2. **Use Automated Scripts**: Prefer npm scripts over manual commands
3. **Monitor Continuously**: Keep health monitoring active during development
4. **Document Immediately**: Log issues as they occur, not afterward
5. **Verify Thoroughly**: Complete post-change verification before task completion

---

*This directive template ensures that all AI development assistants maintain the server stability prevention strategy automatically, reducing development overhead and preventing the types of issues documented in our troubleshooting guide.*