import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function SecurityPosture({ trustScore, defenseMode, totalBlocked, totalAnalyzed, pipelineStatus, getSessionDuration }) {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(getSessionDuration());
    }, 1000);
    return () => clearInterval(interval);
  }, [getSessionDuration]);

  const formatDuration = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const modeConfig = {
    normal: { label: 'NORMAL', color: 'var(--threat-safe)', bg: 'rgba(48,209,88,0.1)', border: 'rgba(48,209,88,0.25)', icon: '🟢' },
    elevated: { label: 'ELEVATED', color: 'var(--threat-medium)', bg: 'rgba(255,159,10,0.1)', border: 'rgba(255,159,10,0.25)', icon: '🟠' },
    lockdown: { label: 'LOCKDOWN', color: 'var(--threat-critical)', bg: 'rgba(255,45,85,0.12)', border: 'rgba(255,45,85,0.3)', icon: '🔴' },
  };

  const mode = modeConfig[defenseMode] || modeConfig.normal;
  const blockRate = totalAnalyzed > 0 ? Math.round((totalBlocked / totalAnalyzed) * 100) : 0;

  const trustTrend = trustScore > 70 ? '↑' : trustScore > 30 ? '→' : '↓';
  const trustTrendColor = trustScore > 70 ? 'var(--threat-safe)' : trustScore > 30 ? 'var(--threat-medium)' : 'var(--threat-critical)';

  const activePolicies = Object.values(pipelineStatus).filter(s => s !== 'nominal').length;

  return (
    <motion.div
      className="glass-panel"
      style={{ padding: 'var(--space-md)' }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="section-label" style={{ marginBottom: 'var(--space-sm)' }}>Security Posture</div>

      {/* Defense Mode Badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        padding: '8px 12px',
        borderRadius: 'var(--radius-md)',
        background: mode.bg,
        border: `1px solid ${mode.border}`,
        marginBottom: 'var(--space-md)',
        transition: 'all 0.8s',
      }}>
        <span style={{ fontSize: '16px' }}>{mode.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 'var(--text-sm)',
            color: mode.color,
            letterSpacing: '0.1em',
          }}>
            {mode.label} MODE
          </div>
          <div style={{
            fontSize: '9px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-tertiary)',
          }}>
            {defenseMode === 'normal' ? 'All systems nominal' :
             defenseMode === 'elevated' ? 'Enhanced monitoring active' :
             'Full quarantine — all tools locked'}
          </div>
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-sm)',
          fontWeight: 700,
          color: trustTrendColor,
        }}>
          {trustTrend}
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '6px',
      }}>
        {[
          { label: 'BLOCKED', value: totalBlocked, color: totalBlocked > 0 ? 'var(--threat-critical)' : 'var(--text-tertiary)' },
          { label: 'BLOCK %', value: `${blockRate}%`, color: blockRate > 50 ? 'var(--threat-critical)' : blockRate > 0 ? 'var(--threat-medium)' : 'var(--text-tertiary)' },
          { label: 'SESSION', value: formatDuration(duration), color: 'var(--text-secondary)' },
        ].map(stat => (
          <div key={stat.label} style={{
            textAlign: 'center',
            padding: '6px 4px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              fontWeight: 700,
              color: stat.color,
            }}>
              {stat.value}
            </div>
            <div style={{
              fontSize: '8px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Active Policies */}
      <div style={{
        marginTop: 'var(--space-sm)',
        fontSize: '9px',
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-tertiary)',
        display: 'flex',
        justifyContent: 'space-between',
        padding: '4px 0',
      }}>
        <span>Active policies: <span style={{ color: activePolicies > 0 ? 'var(--threat-medium)' : 'var(--text-secondary)' }}>{activePolicies > 0 ? activePolicies : 'baseline'}</span></span>
        <span>Analyzed: <span style={{ color: 'var(--text-secondary)' }}>{totalAnalyzed}</span></span>
      </div>
    </motion.div>
  );
}
