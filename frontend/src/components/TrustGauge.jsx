import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function TrustGauge({ score, defenseMode }) {
  const [displayScore, setDisplayScore] = useState(score);

  useEffect(() => {
    const start = displayScore;
    const diff = score - start;
    const duration = 600;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(start + diff * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [score]);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const progress = (displayScore / 100) * circumference;
  const dashOffset = circumference - progress;

  const getColor = () => {
    if (displayScore > 70) return 'var(--threat-safe)';
    if (displayScore > 40) return 'var(--threat-medium)';
    if (displayScore > 15) return 'var(--threat-high)';
    return 'var(--threat-critical)';
  };

  const getStatus = () => {
    if (displayScore > 70) return 'SECURE';
    if (displayScore > 40) return 'CAUTION';
    if (displayScore > 15) return 'DANGER';
    return 'CRITICAL';
  };

  return (
    <motion.div
      className="glass-panel"
      style={{
        padding: 'var(--space-md)',
        textAlign: 'center',
        transition: 'box-shadow 0.8s, border-color 0.8s',
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="section-label">Trust Engine</div>

      <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto' }}>
        <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--border-subtle)" strokeWidth="6" />
          <circle
            cx="70" cy="70" r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s',
              filter: `drop-shadow(0 0 6px ${getColor()})`,
            }}
          />
          {Array.from({ length: 20 }).map((_, i) => {
            const angle = (i / 20) * Math.PI * 2;
            const x1 = 70 + (radius + 6) * Math.cos(angle);
            const y1 = 70 + (radius + 6) * Math.sin(angle);
            const x2 = 70 + (radius + 10) * Math.cos(angle);
            const y2 = 70 + (radius + 10) * Math.sin(angle);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--border-subtle)" strokeWidth="1" />;
          })}
        </svg>

        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '2rem',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            color: getColor(),
            lineHeight: 1,
            textShadow: `0 0 20px ${getColor()}`,
          }}>
            {displayScore}
          </div>
          <div style={{
            fontSize: '8px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginTop: '3px',
          }}>
            {getStatus()}
          </div>
        </div>
      </div>

      {/* Trust bars */}
      <div style={{ marginTop: 'var(--space-sm)', display: 'flex', gap: '2px', justifyContent: 'center' }}>
        {Array.from({ length: 20 }).map((_, i) => {
          const threshold = (i + 1) * 5;
          const filled = displayScore >= threshold;
          return (
            <div key={i} style={{
              width: '5px', height: '14px',
              borderRadius: '2px',
              background: filled ? getColor() : 'var(--border-subtle)',
              opacity: filled ? 1 : 0.3,
              transition: 'all 0.3s',
              boxShadow: filled ? `0 0 3px ${getColor()}` : 'none',
            }} />
          );
        })}
      </div>
    </motion.div>
  );
}
