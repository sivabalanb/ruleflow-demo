# Getting Started with RuleFlow Demo 🚀

## Prerequisites

- **Node.js** 18 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js) or **yarn**
- **Git** (for cloning the repository)

## Step-by-Step Installation

### 1. Clone the Repository

```bash
git clone https://github.com/sivabalanb/ruleflow-demo.git
cd ruleflow-demo
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Start the Backend Server

```bash
npm run dev
```

You should see output like:
```
╔══════════════════════════════════════════╗
║  🚀 RuleFlow Demo Server Started         ║
╚══════════════════════════════════════════╝

📡 Server: http://localhost:3001
📊 Health: http://localhost:3001/api/health
📋 Rules: http://localhost:3001/api/rules
🧮 Calculate: POST http://localhost:3001/api/calculate
```

**Keep this terminal open!**

### 4. Install Frontend Dependencies (New Terminal)

Open a new terminal window/tab:

```bash
cd frontend
npm install
```

### 5. Start the Frontend Development Server

```bash
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 123 ms

  ➜  Local:   http://localhost:3000/
  ➜  press h to show help
```

### 6. Open in Browser

Visit **http://localhost:3000** in your web browser.

## Testing the Demo

### Tab 1: Calculator 🧮

1. Select a membership tier (Silver, Gold, or Platinum)
2. Enter a spending amount (try $6,000 for bonus unlocking!)
3. Choose a booking date
4. Click "Calculate Discount"
5. See the results and applied rules

**Quick test scenarios:**
- **Silver + $1,000**: Basic 5% discount
- **Gold + $6,000**: 10% base + 5% weekend bonus = 15%
- **Platinum + $8,000**: 15% base + 2% high spend = 17%

### Tab 2: Rule Editor ✏️

1. View the current rules in JSON format
2. Try making a small change (e.g., change a discount percentage)
3. Click "Validate Rules" to check for errors
4. Click "Save Rules" to persist changes
5. Go back to Calculator and see the new discount applied!

## Example: Modifying a Rule

### Find the Gold Discount Rule

In the Rule Editor, find:
```json
{
  "id": "gold-discount",
  "priority": 4,
  "description": "Gold tier members receive 10% discount",
  "condition": {
    "field": "tier",
    "operator": "==",
    "value": "gold"
  },
  "action": {
    "discountPercent": 10,
    "message": "⭐ Gold member discount (10%) applied",
    "stackable": false
  }
}
```

### Make Changes

Change the discount from 10% to 12%:
```json
"discountPercent": 12,
"message": "⭐ Gold member discount (12%) applied"
```

### Save & Test

1. Click "Validate Rules" ✓
2. Click "Save Rules" 💾
3. Go to Calculator
4. Select Gold tier with any amount
5. See the new 12% discount!

**No backend restart needed!** 🎉

## Troubleshooting

### "Cannot GET /"
- Frontend is running at the wrong port
- Make sure frontend is at **http://localhost:3000**
- Make sure backend is at **http://localhost:3001**

### "Backend server is not available"
- Backend isn't running
- Make sure backend terminal shows the startup message
- Check that backend is running on port 3001

### "Rules validation failed"
- Check your JSON syntax
- Use the "Format JSON" button in Rule Editor
- Ensure all required fields are present

### Port Already in Use

If port 3001 or 3000 is already in use:

**Backend:**
```bash
PORT=3002 npm run dev
```

**Frontend:** Update `vite.config.js`:
```javascript
server: {
  port: 3001,
  // ...
}
```

## Next Steps

1. **Explore the Rules** - Check out all 9 rules in the editor
2. **Test Combinations** - Try different tier/spend combinations
3. **Read the Docs** - See README.md for API details
4. **Extend It** - Add new rules and condition types
5. **Deploy It** - Follow deployment instructions in README.md

## Development Commands

### Backend
```bash
npm run dev      # Start with auto-reload
npm start        # Production start
```

### Frontend
```bash
npm run dev      # Development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## File Structure Quick Reference

```
ruleflow-demo/
├── backend/
│   ├── src/server.js           # Express app
│   ├── src/engine/             # Rule engine logic
│   ├── src/routes/             # API endpoints
│   ├── rules/loyalty-rules.json # Rules (editable!)
│   └── package.json
│
├── frontend/
│   ├── src/App.jsx             # Main component
│   ├── src/components/          # UI components
│   ├── src/utils/api.js         # API client
│   └── package.json
│
└── README.md                     # Full documentation
```

## Key Features to Try

✅ **Multiple Discount Tiers** - Silver, Gold, Platinum  
✅ **Spend Thresholds** - Unlock bonuses at $5K and $10K  
✅ **Weekend Bonuses** - Extra 5% on weekends  
✅ **Rule Editing** - Change rules in real-time  
✅ **Rule Validation** - Catch errors before saving  
✅ **Stackable Rules** - Multiple rules can combine  
✅ **Complex Conditions** - AND/OR logic support  

## Getting Help

- **See errors?** Check the terminal output
- **Need docs?** Read README.md
- **Want to extend?** Check "Extending the Demo" in README.md
- **Report issues?** Open an issue on GitHub

---

**Happy exploring! 🚀** Enjoy discovering how dynamic rule engines work!
