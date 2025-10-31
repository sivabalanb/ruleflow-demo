import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { RuleEngine } from './engine/ruleEngine.js';
import calculateRouter, { initCalculateRoute } from './routes/calculate.js';
import rulesRouter, { initRulesRoute } from './routes/rules.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Initialize Rule Engine
function initializeRuleEngine() {
  try {
    const rulesPath = join(__dirname, '../rules/loyalty-rules.json');
    const rulesData = JSON.parse(readFileSync(rulesPath, 'utf-8'));
    const engine = new RuleEngine(rulesData.rules);
    
    console.log(`✓ Rule engine initialized with ${rulesData.rules.length} rules`);
    
    // Initialize routes with engine
    initCalculateRoute(engine);
    initRulesRoute(engine);
    
    return engine;
  } catch (error) {
    console.error('Failed to initialize rule engine:', error);
    process.exit(1);
  }
}

const ruleEngine = initializeRuleEngine();

// Routes
app.use(calculateRouter);
app.use(rulesRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    rulesLoaded: ruleEngine.getRules().length
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'RuleFlow Demo - Airline Loyalty Program',
    version: '1.0.0',
    description: 'Drools-style rule engine backend for dynamic business logic',
    endpoints: {
      health: 'GET /api/health',
      calculate: 'POST /api/calculate',
      rules: {
        get: 'GET /api/rules',
        post: 'POST /api/rules',
        validate: 'POST /api/rules/validate',
        schema: 'GET /api/rules/schema'
      }
    },
    documentation: 'See README.md or /api/rules/schema for API documentation'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method,
    availableEndpoints: {
      health: 'GET /api/health',
      calculate: 'POST /api/calculate',
      rules: 'GET /api/rules, POST /api/rules, POST /api/rules/validate, GET /api/rules/schema'
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║  🚀 RuleFlow Demo Server Started         ║
╚══════════════════════════════════════════╝

📡 Server: http://localhost:${PORT}
📊 Health: http://localhost:${PORT}/api/health
📋 Rules: http://localhost:${PORT}/api/rules
🧮 Calculate: POST http://localhost:${PORT}/api/calculate

💡 TIP: To test the calculator endpoint:
curl -X POST http://localhost:${PORT}/api/calculate \\
  -H "Content-Type: application/json" \\
  -d '{"tier":"gold","total_spend":6000}'
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

export default app;
