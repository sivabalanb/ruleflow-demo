import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { healthCheck } from './utils/api';
import RuleCalculator from './components/Calculator/RuleCalculator';
import RuleEditor from './components/RuleEditor/RuleEditor';
import './styles/app.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('calculator');
  const [serverStatus, setServerStatus] = useState('checking');
  const [error, setError] = useState(null);

  useEffect(() => {
    checkServerHealth();
  }, []);

  const checkServerHealth = async () => {
    try {
      const health = await healthCheck();
      setServerStatus('online');
      setError(null);
    } catch (err) {
      setServerStatus('offline');
      setError(
        'Backend server is not available. Make sure to run: npm run dev (in backend directory)'
      );
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const statusVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 20,
      },
    },
    exit: {
      opacity: 0,
      y: -30,
      transition: { duration: 0.3 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 30 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        delay: 0.2,
      },
    },
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 150,
        damping: 15,
      },
    },
  };

  return (
    <motion.div
      className="app-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence mode="wait">
        {serverStatus === 'offline' && (
          <motion.div
            className="status-message offline"
            variants={statusVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            key="offline-status"
          >
            ⚠️ {error}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.header className="header" variants={itemVariants}>
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 15,
            delay: 0.1,
          }}
        >
          🚀 RuleFlow Demo
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Dynamic Rule Engine • Airline Loyalty Program
        </motion.p>
      </motion.header>

      <motion.main className="main-content" variants={itemVariants}>
        <motion.div className="card" variants={cardVariants}>
          <motion.div className="tabs" variants={tabVariants}>
            <motion.button
              className={`tab-button ${activeTab === 'calculator' ? 'active' : ''}`}
              onClick={() => setActiveTab('calculator')}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              🧮 Calculator
            </motion.button>
            <motion.button
              className={`tab-button ${activeTab === 'editor' ? 'active' : ''}`}
              onClick={() => setActiveTab('editor')}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              ✏️ Rule Editor
            </motion.button>
          </motion.div>

          <AnimatePresence mode="wait">
            {serverStatus === 'offline' ? (
              <motion.div
                className="tab-content"
                key="error-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="error"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                >
                  <strong>Backend Connection Failed</strong>
                  <p style={{ marginTop: '0.5rem' }}>
                    The backend server is not running. Please start it with:
                  </p>
                  <pre
                    style={{
                      background: '#333',
                      color: '#0f0',
                      padding: '1rem',
                      borderRadius: '4px',
                      overflow: 'auto',
                      marginTop: '0.5rem',
                    }}
                  >
                    cd backend && npm install && npm run dev
                  </pre>
                  <motion.button
                    className="btn btn-primary"
                    onClick={checkServerHealth}
                    style={{ marginTop: '1rem' }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    🔄 Retry Connection
                  </motion.button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key={`${activeTab}-content`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: 'spring', stiffness: 100, damping: 15 }}
              >
                {activeTab === 'calculator' && <RuleCalculator />}
                {activeTab === 'editor' && <RuleEditor />}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.main>

      <motion.footer
        className="footer"
        variants={itemVariants}
        transition={{ delay: 0.8 }}
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          📚{' '}
          <motion.a
            href="https://github.com/sivabalanb/ruleflow-demo"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ color: '#ffffff' }}
            transition={{ duration: 0.3 }}
          >
            View on GitHub
          </motion.a>{' '}
          | 📖{' '}
          <motion.a
            href="https://github.com/sivabalanb/ruleflow-demo/blob/master/README.md"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ color: '#ffffff' }}
            transition={{ duration: 0.3 }}
          >
            Documentation
          </motion.a>
        </motion.p>
        <motion.p
          style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          Built with React + Vite | Node.js + Express | Custom Rule Engine
        </motion.p>
      </motion.footer>
    </motion.div>
  );
}
