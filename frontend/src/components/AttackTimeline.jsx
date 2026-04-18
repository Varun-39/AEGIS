import { useMemo, useRef, useEffect } from 'react';

export default function AttackTimeline({ timelineEvents }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, [timelineEvents]);

  const severityColors = {
    critical: '#ff2d55',
    high: '#ff6b35',
    medium: '#ff9f0a',
    low: '#ffd60a',
    safe: '#30d158',
    clean: '#30d158',
  };

  if (timelineEvents.length === 0) return null;

  const startTime = timelineEvents[0]?.timestamp || Date.now();
  const endTime = Date.now();
  const totalSpan = Math.max(endTime - startTime, 5000); // min 5s span

  return (
    <div style={{
      position: 'absolute',
      bottom: 'var(--space-md)',
      left: 'var(--space-md)',
      right: 'var(--space-md)',
      zIndex: 10,
      pointerEvents: 'auto',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '4px',
      }}>
        <span style={{
          fontSize: '8px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
        }}>
          Attack Timeline
        </span>
        <div style={{
          flex: 1,
          height: '1px',
          background: 'var(--border-subtle)',
        }} />
        <span style={{
          fontSize: '8px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-tertiary)',
        }}>
          {timelineEvents.length} events
        </span>
      </div>

      <div
        ref={containerRef}
        style={{
          position: 'relative',
          height: '32px',
          background: 'rgba(6, 6, 11, 0.7)',
          backdropFilter: 'blur(10px)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
      >
        {/* Background track */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '8px',
          right: '8px',
          height: '2px',
          background: 'rgba(255,255,255,0.05)',
          transform: 'translateY(-50%)',
        }} />

        {/* Event dots */}
        {timelineEvents.map((event, i) => {
          const position = ((event.timestamp - startTime) / totalSpan) * 100;
          const clampedPosition = Math.min(Math.max(position, 2), 98);
          const color = severityColors[event.severity] || severityColors.safe;
          const isMalicious = event.severity !== 'safe' && event.type !== 'clean';
          const dotSize = isMalicious ? 8 : 5;

          return (
            <div
              key={event.id}
              title={`${event.label} (${event.severity})`}
              style={{
                position: 'absolute',
                left: `${clampedPosition}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: `${dotSize}px`,
                height: `${dotSize}px`,
                borderRadius: '50%',
                background: color,
                boxShadow: isMalicious ? `0 0 6px ${color}, 0 0 12px ${color}` : `0 0 3px ${color}`,
                zIndex: isMalicious ? 3 : 1,
                transition: 'all 0.3s',
              }}
            />
          );
        })}

        {/* Current time cursor */}
        <div style={{
          position: 'absolute',
          right: '4px',
          top: '4px',
          bottom: '4px',
          width: '2px',
          background: 'var(--mode-accent)',
          borderRadius: '1px',
          boxShadow: '0 0 6px var(--mode-accent)',
          animation: 'pulse-fast 1.5s infinite',
        }} />

        {/* Time labels */}
        <div style={{
          position: 'absolute',
          bottom: '2px',
          left: '8px',
          fontSize: '7px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-tertiary)',
          opacity: 0.6,
        }}>
          {new Date(startTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <div style={{
          position: 'absolute',
          bottom: '2px',
          right: '8px',
          fontSize: '7px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-tertiary)',
          opacity: 0.6,
        }}>
          NOW
        </div>
      </div>
    </div>
  );
}
