import { Router } from 'express';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { validateRule } from '../engine/ruleValidator.js';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rulesPath = join(__dirname, '../../rules/loyalty-rules.json');

let ruleEngine = null;

/**
 * Initialize the rules route with engine
 */
export function initRulesRoute(engine) {
  ruleEngine = engine;
}

/**
 * GET /api/rules
 * Retrieve all current rules
 */
router.get('/api/rules', (req, res) => {
  try {
    const rulesData = JSON.parse(readFileSync(rulesPath, 'utf-8'));
    res.json({
      success: true,
      data: rulesData
    });
  } catch (error) {
    console.error('Error reading rules:', error);
    res.status(500).json({
      error: 'Failed to read rules',
      message: error.message
    });
  }
});

/**
 * POST /api/rules
 * Update rules (simulated save - shows what would happen in production)
 */
router.post('/api/rules', (req, res) => {
  try {
    const { rules } = req.body;

    if (!Array.isArray(rules)) {
      return res.status(400).json({
        error: 'Rules must be an array'
      });
    }

    // Validate all rules
    const validationErrors = [];
    rules.forEach((rule, index) => {
      const error = validateRule(rule);
      if (error) {
        validationErrors.push({
          rule_index: index,
          rule_id: rule.id || 'unknown',
          error
        });
      }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Rule validation failed',
        details: validationErrors
      });
    }

    // Save rules to file
    const rulesData = {
      version: '1.0.0',
      description: 'Airline Loyalty Program Discount Rules',
      lastUpdated: new Date().toISOString(),
      rules
    };

    writeFileSync(rulesPath, JSON.stringify(rulesData, null, 2));

    // Reload rules in engine
    if (ruleEngine) {
      ruleEngine.loadRules(rules);
    }

    res.json({
      success: true,
      message: 'Rules updated successfully',
      rulesCount: rules.length,
      data: rulesData
    });
  } catch (error) {
    console.error('Error updating rules:', error);
    res.status(500).json({
      error: 'Failed to update rules',
      message: error.message
    });
  }
});

/**
 * POST /api/rules/validate
 * Validate rules without saving
 */
router.post('/api/rules/validate', (req, res) => {
  try {
    const { rules } = req.body;

    if (!Array.isArray(rules)) {
      return res.status(400).json({
        error: 'Rules must be an array'
      });
    }

    const validationErrors = [];
    rules.forEach((rule, index) => {
      const error = validateRule(rule);
      if (error) {
        validationErrors.push({
          rule_index: index,
          rule_id: rule.id || 'unknown',
          error
        });
      }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Rule validation failed',
        details: validationErrors
      });
    }

    res.json({
      success: true,
      message: 'All rules are valid',
      rulesCount: rules.length
    });
  } catch (error) {
    console.error('Error validating rules:', error);
    res.status(500).json({
      error: 'Validation failed',
      message: error.message
    });
  }
});

/**
 * GET /api/rules/schema
 * Get rule schema documentation
 */
router.get('/api/rules/schema', (req, res) => {
  res.json({
    description: 'Airline Loyalty Program Rule Schema',
    rule_structure: {
      id: 'string (required) - Unique identifier for the rule',
      priority: 'number (required) - Lower number = higher priority',
      description: 'string (optional) - Human-readable description',
      condition: 'object (required) - Condition to evaluate',
      action: 'object (required) - Action when condition matches'
    },
    condition_types: {
      simple: {
        description: 'Single field condition',
        example: {
          field: 'tier',
          operator: '==',
          value: 'gold'
        },
        operators: ['==', '!=', '>', '<', '>=', '<=', 'IN', 'NOT_IN', 'CONTAINS', 'STARTS_WITH', 'ENDS_WITH', 'IS_WEEKEND', 'DATE_RANGE']
      },
      compound: {
        description: 'Multiple conditions with AND/OR logic',
        example: {
          operator: 'AND',
          conditions: [
            { field: 'tier', operator: '==', value: 'gold' },
            { field: 'total_spend', operator: '>', value: 5000 }
          ]
        }
      }
    },
    action_structure: {
      discountPercent: 'number (required) - Discount percentage (0-100)',
      message: 'string (optional) - Message to display',
      stackable: 'boolean (optional) - Whether this rule can combine with others (default: false)'
    }
  });
});

export default router;
