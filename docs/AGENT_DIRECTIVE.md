# AI Marketplace Platform - Agent Directive (Decision Tree Framework)

*Last Updated: 2025-07-30*

## 🎯 ORCHESTRATOR DECISION TREE

**User starts with: "Check AGENT_DIRECTIVE.md"**

```
TASK CLASSIFICATION
├── 💬 Quick question/clarification? → Answer directly, no workflow needed
├── 🐛 Something broken/not working? → BUG TESTING MODE
├── 🔍 Need information/research? → RESEARCH MODE  
├── 🛠️ Building/modifying features? → DEVELOPMENT MODE
├── ✅ Need to validate functionality? → QA/TESTING MODE
├── ⚡ Need to optimize performance? → PERFORMANCE MODE
├── 🚀 Need to deploy/share? → VERCEL DEPLOYMENT MODE
└── 📋 Project planning/coordination? → ORCHESTRATION MODE
```

---

## 🐛 BUG TESTING MODE

### Entry Criteria
- Something is broken, error reports, functionality issues
- User reports missing features or broken workflows

### Workflow Process
1. **Bug Classification**: UI, API, Integration, Data, Performance, Hydration
2. **Initial Debug Attempt**:
   - Select General Purpose Agent for code-based fixes
   - Agent must narrate their investigation and approach (see Code Narration Protocol)
   - Agent implements fix with detailed code comments
3. **If Fix Doesn't Work**:
   - Escalate to Research Agent for deeper investigation
   - Research Agent analyzes root cause, similar issues, alternative approaches
   - Return to General Purpose Agent with research findings
   - Implement alternative solution
4. **Preservation Validation**: Run complete preservation checklist
5. **Post-Completion Updates**: Update documentation (see Post-Completion Checks)

### Success Criteria
- ✅ Original bug fixed
- ✅ All preservation checklist items verified  
- ✅ No new errors introduced
- ✅ User journey still works end-to-end
- ✅ Root cause documented for future prevention

---

## 🔍 RESEARCH MODE

### Entry Criteria
- Need market data, technical specifications, competitive analysis
- Investigating unknown error patterns or solutions

### Workflow Process
1. **Define Research Scope**: What specific questions need answers?
2. **Select Research Agent**: For complex multi-step research with context retention
3. **Research Loop**:
   - Agent gathers information from multiple sources
   - Agent validates sources and cross-references findings
   - Agent synthesizes findings into actionable insights
   - **Validation**: I verify findings are accurate and actionable
4. **Integration Planning**: How do findings change our approach?
5. **Post-Completion Updates**: Update relevant documentation

### Success Criteria
- ✅ Original questions answered with validated sources
- ✅ Findings are actionable and relevant to project
- ✅ Research integrated into project knowledge base

---

## 🛠️ DEVELOPMENT MODE

### Entry Criteria
- Building new features, modifying existing code
- Adding functionality or improving existing systems

### Workflow Process
1. **Preservation Planning**: What existing functionality must be preserved?
2. **Select General Purpose Agent**: For code changes and implementation
3. **Development Loop**:
   - Agent plans implementation approach with narration
   - Agent implements changes incrementally with detailed comments
   - Agent tests each change against preservation checklist
   - **Validation**: I verify all preservation requirements met
4. **Final Testing**: Complete user journey validation
5. **Post-Completion Updates**: Update documentation and guides

### Success Criteria
- ✅ New feature implemented and functional
- ✅ All existing functionality preserved
- ✅ Code is well-documented with reasoning
- ✅ Tests pass and user journeys work

---

## 🗣️ CODE NARRATION PROTOCOL

**All agents MUST narrate their coding process in chat AND code comments:**

### Before Coding (Chat Narration)
```
"I'm implementing [specific change] because [reasoning].

My approach:
1. [Step 1] - Chose this because [reason]
2. [Step 2] - Alternative was [X] but rejected because [reason]  
3. [Step 3] - This assumes [assumptions]

Potential risks:
- Could break [X] if [scenario]
- Depends on [Y] continuing to work
- Performance impact: [assessment]

Alternative approaches considered:
- [Option A]: [why not chosen]
- [Option B]: [why not chosen]
```

### During Implementation (Code Comments)
```typescript
// IMPLEMENTATION REASONING:
// Using [pattern/library] because [reason]
// Alternative [X] rejected because [reason]
// This affects [related systems] by [how]
// If this breaks, check [specific diagnostic steps]

// DEPENDENCIES:
// - Requires [X] to be available
// - Assumes [Y] behavior continues
// - Performance: [impact assessment]
```

### After Completion (Chat Summary)
```
"Implementation complete.

What I built:
- [Component/function] that handles [functionality]
- Key dependencies: [list]
- Critical assumptions: [list]

Testing performed:
- [What I verified works]
- [Edge cases tested]
- [Preservation items checked]

Future maintenance notes:
- [What might need updates if X changes]
- [Performance monitoring points]
- [Scaling considerations]
```

---

## 🔍 COMPREHENSIVE PRESERVATION CHECKLIST

**After ANY code changes, verify these items still work:**

### Server Accessibility (MANDATORY FIRST CHECK)
- [ ] **Development server running: `curl -s http://localhost:3000 > /dev/null && echo "✅ Server responding"`**
- [ ] **Browser can access homepage without "Safari cannot connect" error**
- [ ] **CSS/styling loads properly (not plain text "reader view" appearance)**

### Navigation & Layout
- [ ] Settings tab appears in top navigation bar
- [ ] All navigation links work (Home, Dashboard, Marketplace, AI Guide, Setup)
- [ ] Mobile navigation menu functions correctly
- [ ] Page layouts don't break on different screen sizes
- [ ] No hydration errors in browser console

### Core User Flows  
- [ ] Setup page loads and API key testing works for all providers
- [ ] Dashboard displays provider connection status correctly
- [ ] AI Guide page loads with provider comparisons and pricing
- [ ] Marketplace browsing works (apps load and are clickable)
- [ ] At least one app demo works completely (PDF Notes Generator)

### API & Data Integration
- [ ] API key management functions (save, test, delete, edit)
- [ ] Provider switching works without errors or data loss
- [ ] No console errors on any page load
- [ ] Local storage data persists correctly across sessions
- [ ] Real API calls to providers work (not just mock responses)

### Authentication & State Management
- [ ] User session maintained across page navigation
- [ ] Development auth bypass continues to work
- [ ] No unexpected redirects or authentication loops
- [ ] User preferences and settings persist

### Performance & Reliability
- [ ] All pages load within reasonable time (<3 seconds)
- [ ] No JavaScript runtime errors blocking functionality
- [ ] CSS styles load correctly without layout shifts
- [ ] Browser console shows no critical errors or warnings

---

## 📚 POST-COMPLETION DOCUMENTATION CHECKS

**After ANY agent completes work, check if these need updates:**

### Project Status Documentation
- [ ] **CLAUDE.md**: Current priorities, timeline changes, new capabilities
- [ ] **PROJECT_STATUS.md**: Major milestones achieved or new blockers
- [ ] **DEVELOPMENT_ROADMAP.md**: Timeline adjustments or dependency changes
- [ ] **BENCHMARKS.md**: Performance metrics if anything performance-related changed

### Knowledge Base Updates
- [ ] **Preservation Checklist**: New critical items discovered during debugging
- [ ] **ERROR_RESOLUTION_LOG.md**: New error patterns, root causes, proven solutions
- [ ] **AGENT_DIRECTIVE.md**: New workflow patterns or decision tree branches
- [ ] **Server troubleshooting guides**: New stability issues or recovery procedures

### Technical Documentation
- [ ] **API documentation**: New endpoints, changed behavior, or response formats
- [ ] **Component documentation**: New UI patterns, breaking changes, or usage examples
- [ ] **Setup guides**: New dependencies, configuration steps, or installation requirements
- [ ] **Testing protocols**: New test scenarios, validation steps, or quality gates

### Learning & Improvement Capture
- [ ] **Successful approaches**: Document what worked well for future replication
- [ ] **Failed approaches**: Record what didn't work to avoid future attempts
- [ ] **Alternative solutions considered**: Options evaluated for future reference
- [ ] **Root cause analysis**: Prevention measures for similar issues

---

## 🚨 FUNCTIONALITY PRESERVATION (CRITICAL)

**NEVER remove or break existing functionality unless explicitly requested by the user.**

### Mandatory Checks Before Any Implementation:
- [ ] Setup/API key management remains functional
- [ ] All marketplace apps continue working (PDF Notes Generator, Code Review Bot)
- [ ] Navigation links remain accessible 
- [ ] User authentication flow preserved
- [ ] Dashboard functionality intact
- [ ] All existing user workflows maintained

### Core Application Components to Preserve:
1. **Setup Flow**: `/src/app/setup/` - API key configuration
2. **Dashboard**: `/src/app/dashboard/` - Provider management
3. **Marketplace**: `/src/app/marketplace/` - App browsing and demos
4. **AI Guide**: `/src/app/ai-guide/` - Provider comparison tool
5. **Navigation**: `/src/components/layouts/navigation.tsx`
6. **API Routes**: `/src/app/api/` - All provider integrations

### After Implementation Testing Requirements:
- [ ] **MANDATORY: Verify server accessibility with curl before testing**
- [ ] Test all existing features
- [ ] Verify Setup page loads and functions
- [ ] Check API key testing works for all providers
- [ ] Confirm marketplace browsing and app access
- [ ] Test complete user journey from setup → install → use apps
- [ ] Verify all navigation links work
- [ ] Test AI provider switching functionality
- [ ] **FINAL CHECK: Confirm http://localhost:3000 loads in browser**

### If Existing Functionality is Broken:
1. **STOP immediately**
2. Document the regression in error log
3. Restore functionality before proceeding
4. Test thoroughly to prevent future issues
5. Update todo list with regression fix

---

## 🎯 AGENT DELEGATION RULES

### Use General Purpose Agent When:
- Making code changes or file edits
- Searching for patterns across multiple files
- Multi-step development tasks
- Working with existing codebase structure

### Use Research Agent When:
- Complex multi-step research requiring context retention
- Gathering AI provider pricing and feature data
- Market analysis and competitive research
- Documentation requiring extensive fact-checking

### Use Browser Agent When:
- Testing UI functionality and user flows
- Verifying dropdown options and form submissions
- Testing demo applications
- Visual regression testing
- End-to-end user journey validation

---

## ⚡ SERVER STABILITY REQUIREMENTS

### Development Server Management:
- **ALWAYS maintain server running during development**
- If server stops, restart immediately with `npm run dev`
- Never make breaking changes without testing first
- Keep localhost:3000 accessible at all times

### Critical Stability Checks:
1. **API Endpoints**: All `/api/` routes must remain functional
2. **Database Connections**: Prisma connections maintained
3. **AI Provider Integration**: No disruption to existing providers
4. **Authentication**: Development bypass must continue working

### Emergency Restart Protocol:
```bash
# If server becomes unstable or Safari cannot connect:
pkill -f "next-server"
pkill -f "node.*next"  # Kill any stuck Node processes
sleep 3  # Wait for processes to fully terminate
npm run dev > /tmp/next.log 2>&1 &  # Start in background
sleep 15  # CRITICAL: Wait for Next.js compilation (10-15 seconds)
# Verify: curl -s http://localhost:3000 > /dev/null && echo "✅ Server responding" || echo "❌ Server not responding"
```

### CRITICAL TIMING REQUIREMENT:
- **Next.js needs 10-15 seconds to compile before being accessible**
- **Never test connectivity immediately after starting server**
- **Wait for "✓ Compiled /" message in logs before testing**

### Common Server Issues & Solutions:
1. **"Safari cannot connect to server"**
   - Cause: Development server crashed or port conflict
   - Solution: Follow Emergency Restart Protocol above
   - Verification: Always test with curl before reporting success

2. **CSS/Styling Missing (Reader View Appearance)**
   - Cause: CSS assets not compiling/loading
   - Solution: Restart development server completely
   - Prevention: Check for JavaScript errors in components before deployment

3. **Port Conflicts**
   - If port 3000 is occupied, server will auto-select 3001
   - Always check actual port in terminal output
   - Update URLs accordingly

---

## 📝 TODO TRACKING REQUIREMENTS

### Todo List Management:
- **Location**: `/CLAUDE.md` - Current Todo List section
- **Update Pattern**: Real-time as tasks complete
- **Status Options**: 
  - `[ ]` - Pending
  - `[x]` - Completed
  - `[!]` - Blocked/Issues

### Todo Categories:
1. **Core Features** - Essential functionality
2. **Bug Fixes** - Critical issues to resolve
3. **Enhancements** - Nice-to-have improvements
4. **Research** - Investigation tasks
5. **Testing** - Validation requirements

### Todo Update Protocol:
1. Mark completed items with `[x]`
2. Add new items discovered during implementation
3. Include estimated time for complex tasks
4. Link to related files or documentation

---

## 🛠️ AUTOMATED SCRIPTS REFERENCE

### Available Development Scripts:
```bash
# Core Development
npm run dev                    # Start development server
npm run build                  # Build for production
npm run lint                   # Run ESLint
npm run typecheck             # TypeScript checking

# AI Provider Testing
curl http://localhost:3000/api/ai/providers  # Test API endpoint

# Ollama Management
ollama list                    # List installed models
ollama ps                      # Show running models
ollama pull llama3.2:3b       # Install specific model
ollama run llama3.2:3b        # Start interactive session

# Database Management
npx prisma generate           # Generate Prisma client
npx prisma db push           # Push schema changes
npx prisma studio            # Open database browser
```

### Quick Test Commands:
```bash
# Test Ollama connection
curl http://localhost:11434/api/generate -d '{"model":"llama3.2:3b","prompt":"Hello","stream":false}'

# Test Next.js API
curl http://localhost:3000/api/health

# Check server status
ps aux | grep next
```

---

## 🚫 ERROR RESOLUTION PROTOCOL

### Common Error Categories:

#### 1. API Integration Errors
- **Symptoms**: Provider connection failures, API key validation issues
- **Resolution**: Check provider configuration, verify API keys, test endpoints
- **Prevention**: Always test after provider changes

#### 2. Build/Compilation Errors
- **Symptoms**: TypeScript errors, missing dependencies, import issues
- **Resolution**: Check imports, run `npm install`, fix TypeScript issues
- **Prevention**: Run typecheck before major changes

#### 3. UI/Navigation Errors
- **Symptoms**: Broken links, missing components, layout issues
- **Resolution**: Check component imports, verify routing, test navigation
- **Prevention**: Test all navigation after component changes

#### 4. Database/State Errors
- **Symptoms**: Data persistence issues, state management problems
- **Resolution**: Check Prisma configuration, verify state updates
- **Prevention**: Test data flows thoroughly

### Error Resolution Steps:
1. **Identify**: Categorize the error type
2. **Isolate**: Reproduce the issue consistently
3. **Document**: Log error details and context
4. **Fix**: Apply targeted resolution
5. **Test**: Verify fix doesn't break other functionality
6. **Prevent**: Update safeguards to prevent recurrence

---

## 📚 DOCUMENTATION LINKS

### Core Project Documentation:
- **Main Context**: `/CLAUDE.md` - Primary development context
- **Setup Guide**: `/OLLAMA_SETUP_GUIDE.md` - Local AI configuration
- **Performance**: `/BENCHMARKS.md` - Performance metrics
- **QA Report**: `/AI_INTEGRATION_QA_REPORT.md` - Testing results

### Key Code References:
- **AI Providers**: `/src/app/api/ai/providers/route.ts`
- **Main Layout**: `/src/components/layouts/main-layout.tsx`
- **Navigation**: `/src/components/layouts/navigation.tsx`
- **Dashboard**: `/src/app/dashboard/ai-providers/page.tsx`
- **AI Guide**: `/src/app/ai-guide/page.tsx`

### External Documentation:
- **Next.js 14**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com/docs
- **Prisma**: https://www.prisma.io/docs
- **Ollama**: https://ollama.com/docs

---

## 🔄 WORKFLOW BEST PRACTICES

### Code Changes:
1. **Read First**: Always read existing code before modifying
2. **Small Steps**: Make incremental changes and test frequently
3. **Preserve Patterns**: Follow existing code patterns and conventions
4. **Test Thoroughly**: Verify changes don't break existing functionality

### Communication:
1. **Clear Status**: Always provide clear status updates
2. **Error Reporting**: Document any issues encountered
3. **Success Confirmation**: Confirm when tasks are completed
4. **Next Steps**: Suggest logical next actions

### Quality Assurance:
1. **TypeScript**: Ensure all changes are type-safe
2. **Linting**: Code passes ESLint checks
3. **Testing**: Manual testing of changed functionality
4. **Documentation**: Update docs when adding new features

---

## ⚠️ CRITICAL REMINDERS

### Never Break These:
- Existing API routes and their responses
- User authentication and session management
- Navigation and routing structure
- AI provider integration endpoints
- Database schema and connections

### Always Test These:
- Complete user signup/login flow
- API key configuration and testing
- AI provider switching and usage
- Marketplace app browsing and demos
- Setup page functionality

### Emergency Contacts:
- **Primary Documentation**: `/CLAUDE.md`
- **Technical Issues**: Check `/docs/` folder
- **Server Problems**: Restart protocol above
- **Data Issues**: Prisma documentation link

---

## 🚀 VERCEL DEPLOYMENT MODE

### Entry Criteria
- Need to deploy for testing/feedback instead of local hosting
- Want to share work-in-progress with others
- Testing in production-like environment for error checking
- Validating functionality across different devices/browsers

### Workflow Process
1. **Deployment Planning**: Determine if this is for testing, feedback, or production
2. **Select General Purpose Agent**: For deployment configuration and execution
3. **Deployment Loop**:
   - Agent configures Vercel deployment settings
   - Agent handles build optimization and environment setup
   - Agent deploys and provides shareable URL
   - **Validation**: Test deployed version against preservation checklist
4. **Post-Deployment Testing**: Verify all functionality works in deployed environment
5. **URL Sharing**: Provide deployment URL for feedback collection

### Success Criteria
- ✅ Site deploys successfully without build errors
- ✅ All functionality works in production environment
- ✅ Shareable URL accessible to feedback providers
- ✅ No regressions compared to local version

---

**This document must be consulted before starting any development task. It serves as the central directive for all agents working on the AI Marketplace Platform.**