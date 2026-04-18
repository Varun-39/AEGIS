import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const SIMULATED_ACTIONS = [
  { icon: '🔍', message: 'Scanning ingress pipeline — no threats detected', type: 'info' },
  { icon: '📡', message: 'Threat signature database synchronized (1,247 patterns)', type: 'info' },
  { icon: '🧠', message: 'Intent analyzer calibration complete — semantic model loaded', type: 'info' },
  { icon: '💾', message: 'Memory guardian scan — vector store integrity verified', type: 'info' },
  { icon: '🔧', message: 'Execution sandbox health check — all tool isolations active', type: 'info' },
  { icon: '📊', message: 'Trust decay function recalibrated (λ=0.15)', type: 'info' },
];

export default function AutonomousActions({ actions }) {
  const [simulatedActions, setSimulatedActions] = useState([]);

  // Background simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.65 && actions.length === 0) {
        const sim = SIMULATED_ACTIONS[Math.floor(Math.random() * SIMULATED_ACTIONS.length)];
        setSimulatedActions(prev => [{
          id: `sim-${Date.now()}`,
          timestamp: new Date(),
          simulated: true,
          ...sim,
        }, ...prev].slice(0, 10));
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [actions.length]);

  const allActions = [
    ...actions.map(a => ({ ...a, simulated: false })),
    ...simulatedActions,
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 20);

  const typeStyles = {
    info: { borderColor: 'rgba(0, 240, 255, 0.15)', textColor: 'var(--text-secondary)' },
    warning: { borderColor: 'rgba(255, 159, 10, 0.2)', textColor: 'var(--threat-medium)' },
    critical: { borderColor: 'rgba(255, 45, 85, 0.25)', textColor: 'var(--threat-critical)' },
    recovery: { borderColor: 'rgba(48, 209, 88, 0.2)', textColor: 'var(--threat-safe)' },
  };

  return (
    <div className="glass-panel" style={{
      display: 'flex',
      flexDirection: 'column',
      padding: 0,
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '7px var(--space-md)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div className="section-label" style={{ margin: 0 }}>
          Autonomous Actions
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div className="pulse-dot" style={{ width: '5px', height: '5px' }} />
          <span style={{
            fontSize: '8px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            AEGIS Active
          </span>
        </div>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: 'var(--space-xs)',
        minHeight: 0,
      }}>
        <AnimatePresence>
          {allActions.map(action => {
            const style = typeStyles[action.type] || typeStyles.info;
            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, x: -15, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                  display: 'flex',
                  gap: '6px',
                  padding: '5px var(--space-sm)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '2px',
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  borderLeft: `2px solid ${style.borderColor}`,
                  opacity: action.simulated ? 0.45 : 1,
                  lineHeight: 1.4,
                }}
              >
                <span style={{ flexShrink: 0, fontSize: '11px' }}>{action.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ color: style.textColor }}>
                    {action.message}
                  </span>
                  <div style={{
                    fontSize: '8px',
                    color: 'var(--text-tertiary)',
                    marginTop: '1px',
                  }}>
                    {new Date(action.timestamp).toLocaleTimeString('en-US', {
                      hour12: false,
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {allActions.length === 0 && (
          <div style={{
            textAlign: 'center',
            color: 'var(--text-tertiary)',
            fontSize: 'var(--text-xs)',
            padding: 'var(--space-lg)',
          }}>
            Autonomous defense engine initializing...
          </div>
        )}
      </div>
    </div>
  );
}
