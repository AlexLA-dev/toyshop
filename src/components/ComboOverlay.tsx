import type { PlacementResult } from '../types';
import { COLOR_MAP } from './CardView';

const COLOR_NAME_RU: Record<string, string> = {
  red: 'Красный',
  blue: 'Синий',
  green: 'Зелёный',
  yellow: 'Жёлтый',
};

interface ComboOverlayProps {
  result: PlacementResult;
  onDismiss: () => void;
}

export function ComboOverlay({ result, onDismiss }: ComboOverlayProps) {
  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        cursor: 'pointer',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        style={{
          background: '#FFF',
          borderRadius: 16,
          padding: '24px 32px',
          minWidth: 240,
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          animation: 'popIn 0.25s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {result.isMultiCombo && (
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: '#FF6B00',
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: 2,
            }}
          >
            Комбо x{result.scores.length}!
          </div>
        )}

        <div style={{ fontSize: 36, fontWeight: 800, color: '#FF6B00', marginBottom: 12 }}>
          +{result.totalCoins}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
          {result.scores.map((s) => (
            <div
              key={s.color}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '4px 8px',
                borderRadius: 6,
                background: `${COLOR_MAP[s.color]}15`,
              }}
            >
              <span style={{ color: COLOR_MAP[s.color], fontWeight: 600, fontSize: 13 }}>
                {COLOR_NAME_RU[s.color]}
              </span>
              <span style={{ fontSize: 13, color: '#5D4E37' }}>
                зона {s.zoneSize} → <strong>+{s.coins}</strong>
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={onDismiss}
          style={{
            padding: '8px 24px',
            border: 'none',
            borderRadius: 8,
            background: '#FF6B00',
            color: '#FFF',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}
