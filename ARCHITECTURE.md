# RuleFlow Demo - Architecture Guide

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend Layer                        │
│  React + Vite (Single Page Application)                │
├─────────────────────────────────────────────────────────┤
│ • Rule Calculator (Form + Results)                      │
│ • Rule Editor (JSON Editor + Validator)                 │
│ • API Client (Axios)                                    │
│ • State Management (React Hooks)                        │
└──────────────┬──────────────────────────────────────────┘
               │ HTTP REST API
               │ (CORS enabled)
┌──────────────▼──────────────────────────────────────────┐
│                   API Layer                             │
│  Node.js + Express                                      │
├─────────────────────────────────────────────────────────┤
│ Routes:                                                 │
│ • POST   /api/calculate    - Apply rules               │
│ • GET    /api/rules        - Get current rules         │
│ • POST   /api/rules        - Update rules              │
│ • POST   /api/rules/validate - Validate rules         │
│ • GET    /api/rules/schema - Schema documentation     │
│ • GET    /api/health       - Health check              │
└──────────────┬──────────────────────────────────────────┘
               │ Internal Function Calls
┌──────────────▼──────────────────────────────────────────┐
│              Rule Engine Core                           │
├─────────────────────────────────────────────────────────┤
│ 1. RuleEngine (ruleEngine.js)                          │
│    - Loads and manages rules                           │
│    - Coordinates rule evaluation                       │
│    - Aggregates results                                │
│                                                         │
│ 2. ConditionEvaluator (conditionEvaluator.js)         │
│    - Evaluates simple conditions                       │
│    - Handles AND/OR compound logic                     │
│    - Supports 12+ operators                            │
│    - Recursive condition parsing                       │
│                                                         │
│ 3. RuleValidator (ruleValidator.js)                    │
│    - Validates rule schema                             │
│    - Checks condition integrity                        │
│    - Validates operator usage                          │
│    - Type safety checks                                │
│                                                         │
│ 4. Utilities (dateUtils.js)                            │
│    - Weekend detection                                 │
│    - Date range checking                               │
│    - Day name extraction                               │
└──────────────┬──────────────────────────────────────────┘
               │ File I/O
┌──────────────▼──────────────────────────────────────────┐
│              Rules Configuration                        │
│  loyalty-rules.json (JSON file)                        │
├─────────────────────────────────────────────────────────┤
│ • Contains all business rules                          │
│ • Edited via Rule Editor UI                            │
│ • Persisted to filesystem                              │
│ • Loaded on each request (or with caching)             │
└─────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components

```
App.jsx (Main Container)
├── Header
│   ├── Title
│   └── Status Indicator
├── Tabs
│   ├── Calculator Tab
│   │   ├── RuleCalculator
│   │   │   ├── Form (tier, spend, date)
│   │   │   ├── Quick Test Buttons
│   │   │   └── ResultDisplay
│   │   │       ├── Final Price
│   │   │       ├── Details Grid
│   │   │       ├── Applied Rules List
│   │   │       └── Info Box
│   │
│   └── Editor Tab
│       ├── RuleEditor
│       │   ├── Control Buttons
│       │   │   ├── Format JSON
│       │   │   ├── Validate
│       │   │   ├── Save
│       │   │   └── Reload
│       │   ├── JSON Textarea
│       │   ├── Validation Messages
│       │   └── Tips Box
└── Footer
```

### Backend Route Structure

```
/api
├── /health              [GET]
│   └── Server status
│
├── /calculate           [POST]
│   ├── Input: { tier, total_spend, booking_date }
│   └── Output: { success, input, result }
│
└── /rules
    ├── /                [GET]
    │   └── Returns all current rules
    │
    ├── /                [POST]
    │   ├── Input: { rules }
    │   └── Returns saved rules with timestamp
    │
    ├── /validate        [POST]
    │   ├── Input: { rules }
    │   └── Returns validation status
    │
    └── /schema          [GET]
        └── Returns schema documentation
```

## Data Flow

### Rule Evaluation Flow

```
User Input (Calculator)
    ↓
Form Submission
    ↓
API Call: POST /api/calculate
    ↓
Backend Receives Request
    ↓
Parse Input Data
    ├── tier: "gold"
    ├── total_spend: 6000
    ├── booking_date: "2025-11-01"
    └── day_of_week: "Saturday" (computed)
    ↓
Load Rules from JSON File
    ↓
RuleEngine.applyRules(data)
    ├── Sort rules by priority
    ├── For each rule:
    │   ├── evaluateCondition(rule.condition, data)
    │   │   ├── Check if compound (AND/OR)
    │   │   └── Check if simple condition
    │   ├── If matches:
    │   │   ├── Check stackability
    │   │   ├── Add to applied_rules
    │   │   └── Accumulate discount_percent
    │   └── Calculate final amounts
    ↓
Return Results
    ├── original_amount: 6000
    ├── discount_percent: 17
    ├── discount_amount: 1020
    ├── final_amount: 4980
    ├── applied_rules: [...]
    └── message: "2 rules applied..."
    ↓
Frontend Displays ResultDisplay
```

### Rule Editing Flow

```
User Clicks Rule Editor Tab
    ↓
API Call: GET /api/rules
    ↓
Backend Reads loyalty-rules.json
    ↓
Return rules as formatted JSON
    ↓
Display in textarea
    ↓
User Makes Changes
    ↓
User Clicks "Validate"
    ├── Parse JSON
    ├── Call validateRules()
    │   └── RuleValidator.validateRule() for each
    ├── Show success/error
    └── Stay in editor
    ↓
User Clicks "Save"
    ├── Parse JSON
    ├── Validate (same as above)
    ├── API Call: POST /api/rules
    ├── Backend writes to loyalty-rules.json
    ├── Backend reloads RuleEngine
    ├── Return confirmation
    └── Show success message
    ↓
New rules take effect immediately!
```

## Rule Engine Details

### RuleEngine Class

```javascript
class RuleEngine {
  constructor(rules = [])
    - Initialize with rules array
    - Validate all rules
  
  applyRules(data)
    - Sort rules by priority
    - Evaluate each rule's condition
    - Track stackable vs non-stackable
    - Accumulate discounts
    - Return aggregated result
  
  loadRules(rules)
    - Replace current rules
    - Validate new rules
    - Clear any cached state
  
  getRules()
    - Return current rules array
}
```

### Condition Evaluator Logic

```javascript
evaluateCondition(condition, data)
  ├── If compound (AND/OR):
  │   ├── AND: return ALL sub-conditions true
  │   └── OR: return ANY sub-condition true
  │
  └── If simple:
      └── evaluateSimpleCondition(condition, data)
          ├── Get field value from data
          ├── Apply operator
          └── Return boolean result

Supported Operators:
  ├── Comparison: ==, !=, >, <, >=, <=
  ├── Array: IN, NOT_IN
  ├── String: CONTAINS, STARTS_WITH, ENDS_WITH
  └── Special: IS_WEEKEND, DATE_RANGE
```

### Rule Priority System

```javascript
// Rules are sorted by priority (lower = higher priority)
rules.sort((a, b) => (a.priority || 999) - (b.priority || 999))

// Evaluation:
// 1. Priority 1 rule matches → apply
// 2. Priority 2 (non-stackable) → skip if priority 1 matched
// 3. Priority 3 (stackable) → apply regardless
// ...and so on

// Stackability:
// stackable: false (default)
  - Only one per rule type can apply
  - Excludes lower-priority versions
  
// stackable: true
  - Multiple can apply
  - Combines with other stackable rules
```

## Data Models

### Rule Schema

```typescript
Rule {
  id: string                    // Unique identifier
  priority: number              // Lower = higher priority
  description: string           // Human-readable
  condition: Condition          // Evaluation criteria
  action: {
    discountPercent: number     // 0-100%
    message: string             // Display message
    stackable: boolean?         // Default: false
  }
}

Condition {
  // Simple condition:
  field: string                 // Data field name
  operator: string              // ==, !=, >, <, etc.
  value: any                     // Comparison value
  
  // Compound condition:
  operator: "AND" | "OR"
  conditions: Condition[]       // Nested conditions
}
```

### API Payloads

```javascript
// Request: POST /api/calculate
{
  tier: "gold",
  total_spend: 6000,
  booking_date: "2025-11-01"   // Optional
}

// Response: POST /api/calculate
{
  success: true,
  input: {
    tier: "gold",
    total_spend: 6000,
    booking_date: "2025-11-01",
    day_of_week: "Saturday"
  },
  result: {
    original_amount: 6000,
    discount_percent: 17,
    discount_amount: 1020,
    final_amount: 4980,
    applied_rules: [
      {
        rule_id: "gold-high-spender",
        description: "...",
        discount_percent: 12,
        message: "..."
      },
      {
        rule_id: "weekend-bonus",
        description: "...",
        discount_percent: 5,
        message: "..."
      }
    ],
    message: "2 rules applied for 17% total discount"
  }
}
```

## Performance Considerations

### Current Design
- Rules loaded from JSON file on each request
- No in-memory caching
- Simple iteration through rules

### For Production Scale
```
1. Caching:
   - Cache rules in memory
   - Invalidate on file changes
   - TTL-based refresh

2. Optimization:
   - Index rules by condition type
   - Short-circuit evaluation
   - Compiled rule patterns

3. Monitoring:
   - Track rule evaluation times
   - Log slow rules
   - Alert on validation failures

4. Testing:
   - Unit tests for each rule
   - Integration tests for combinations
   - Performance benchmarks
```

## Security Considerations

### Input Validation
- ✓ Tier validation (whitelist)
- ✓ Spend amount validation (positive numbers)
- ✓ Date format validation
- ✓ JSON schema validation

### API Security
- ✓ CORS configured
- ✓ Input sanitization
- ✓ Error messages (non-sensitive)
- ✗ No authentication (demo only)
- ✗ No rate limiting (demo only)

### For Production
```
Add:
- Authentication (JWT)
- Authorization (role-based)
- Rate limiting
- Request signing
- Audit logging
- Data encryption
- Input parameterization
```

## Extension Points

### Adding New Condition Operators

```javascript
// In conditionEvaluator.js
case 'MY_OPERATOR':
  return applyMyLogic(dataValue, value);

// In ruleValidator.js
validOperators.push('MY_OPERATOR');
```

### Adding New Rule Types

```javascript
// In backend/rules/loyalty-rules.json
{
  "id": "new-rule",
  "priority": 10,
  "action": {
    // Could add new action types:
    // - "pointsBonus": 100
    // - "freeUpgrade": true
    // - "customAction": { ... }
  }
}

// Update ResultDisplay to handle new action types
```

### Adding New Data Fields

```javascript
// In RuleCalculator.jsx (frontend)
// Add input field for new data

// In calculate.js (backend)
// Include new field in evaluationData

// In loyalty-rules.json
// Use new field in conditions
```

## Deployment Architecture

### Development
```
Frontend: http://localhost:3000 (Vite dev server)
Backend: http://localhost:3001 (Node dev server)
Rules: backend/rules/loyalty-rules.json
```

### Production
```
Frontend: GitHub Pages / Vercel / Netlify
         (Static files from npm run build)

Backend: Render / Heroku / AWS
        (Node.js application)

Rules: Persistent storage
      - Option 1: Rules file in git
      - Option 2: Database (PostgreSQL/MongoDB)
      - Option 3: Configuration service
```

## Monitoring & Debugging

### Available Endpoints
```
GET /api/health
  └── Check server status

GET /api/rules
  └── View current rules

GET /api/rules/schema
  └── View schema documentation
```

### Logging
- Backend logs rule evaluation
- Frontend logs API calls
- Errors logged to console

### For Production
```
Add:
- Structured logging (Winston/Bunyan)
- Log aggregation (ELK/Datadog)
- Error tracking (Sentry)
- Performance monitoring (New Relic)
- Metrics collection (Prometheus)
```

---

**Architecture designed for clarity and extensibility!** 🏗️
