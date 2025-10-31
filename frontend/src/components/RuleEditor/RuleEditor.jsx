import { useState, useEffect } from 'react';
import { getRules, updateRules, validateRules } from '../../utils/api';

export default function RuleEditor() {
  const [rulesText, setRulesText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRules();
      setRulesText(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(`Failed to load rules: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditorChange = (e) => {
    setRulesText(e.target.value);
    setValidationError(null);
    setError(null);
  };

  const parseRules = () => {
    try {
      const parsed = JSON.parse(rulesText);
      return parsed.rules || parsed;
    } catch (err) {
      throw new Error(`JSON Parse Error: ${err.message}`);
    }
  };

  const handleValidate = async () => {
    setValidationError(null);
    setError(null);

    try {
      const rules = parseRules();

      if (!Array.isArray(rules)) {
        throw new Error('Rules must be an array');
      }

      await validateRules(rules);
      setSuccess('✅ All rules are valid!');
    } catch (err) {
      setValidationError(err.message || 'Validation failed');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    setValidationError(null);

    try {
      const rules = parseRules();

      if (!Array.isArray(rules)) {
        throw new Error('Rules must be an array');
      }

      await updateRules(rules);
      setSuccess(
        '✅ Rules saved successfully! The changes will take effect immediately on the backend.'
      );
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err.message || 'Failed to save rules');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure? This will reload the rules from the server.')) {
      loadRules();
      setSuccess(null);
      setError(null);
      setValidationError(null);
    }
  };

  const handleFormatJSON = () => {
    try {
      const parsed = JSON.parse(rulesText);
      setRulesText(JSON.stringify(parsed, null, 2));
      setSuccess('✅ JSON formatted');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(`Format error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="tab-content">
        <div className="loading">
          <div className="spinner"></div>
          <p style={{ marginTop: '1rem' }}>Loading rules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content">
      {error && <div className="error">❌ {error}</div>}
      {success && <div className="success">{success}</div>}
      {validationError && <div className="error">❌ {validationError}</div>}

      <div className="editor-actions">
        <button className="btn btn-secondary" onClick={handleFormatJSON} disabled={saving}>
          📐 Format JSON
        </button>
        <button className="btn btn-secondary" onClick={handleValidate} disabled={saving}>
          ✓ Validate Rules
        </button>
        <button className="btn btn-success" onClick={handleSave} disabled={saving}>
          {saving ? '💾 Saving...' : '💾 Save Rules'}
        </button>
        <button className="btn btn-danger" onClick={handleReset} disabled={saving}>
          ↻ Reload
        </button>
      </div>

      <div className="editor-container">
        <textarea
          value={rulesText}
          onChange={handleEditorChange}
          placeholder="Edit rules JSON here..."
          disabled={saving}
          spellCheck="false"
        />
      </div>

      <div className="validation-info">
        <strong>💡 Tips:</strong>
        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
          <li>Click "Format JSON" to auto-format your rules</li>
          <li>Click "Validate Rules" to check for errors before saving</li>
          <li>Use "Save Rules" to persist changes to the backend</li>
          <li>Rules are applied in priority order (lower number = higher priority)</li>
          <li>Stackable rules can combine, non-stackable rules exclude lower priorities</li>
          <li>
            Supported operators: ==, !=, &gt;, &lt;, &gt;=, &lt;=, IN, NOT_IN, CONTAINS,
            STARTS_WITH, ENDS_WITH, IS_WEEKEND, DATE_RANGE
          </li>
        </ul>
      </div>
    </div>
  );
}
