import { useState, useEffect } from 'react';

/**
 * Interactive onboarding: overlays appear step-by-step on top of the real game,
 * highlighting specific areas and guiding the player through their first moves.
 * No wall-of-text popups — each step is a small tooltip near the relevant element.
 */

export const TUTORIAL_STEPS = [
  { id: 'welcome', target: 'board', position: 'center' as const, text: '\ud83c\udf6c \u0414\u043e\u0431\u0440\u043e \u043f\u043e\u0436\u0430\u043b\u043e\u0432\u0430\u0442\u044c \u0432 \u041c\u0430\u0433\u0430\u0437\u0438\u043d \u0421\u043b\u0430\u0434\u043e\u0441\u0442\u0435\u0439!', sub: '\u0421\u043e\u0431\u0438\u0440\u0430\u0439 \u0441\u043b\u0430\u0434\u043e\u0441\u0442\u0438 \u043e\u0434\u043d\u043e\u0433\u043e \u0446\u0432\u0435\u0442\u0430 \u0432\u043c\u0435\u0441\u0442\u0435 \u2014 \u0437\u0430\u0440\u0430\u0431\u0430\u0442\u044b\u0432\u0430\u0439 \u043c\u043e\u043d\u0435\u0442\u044b!' },
  { id: 'register', target: 'board', position: 'center' as const, text: '\ud83c\udfea \u042d\u0442\u043e \u0442\u0432\u043e\u044f \u043a\u0430\u0441\u0441\u0430', sub: '\u041e\u043d\u0430 \u0441\u043e\u0435\u0434\u0438\u043d\u044f\u0435\u0442 \u043b\u044e\u0431\u044b\u0435 \u0446\u0432\u0435\u0442\u0430, \u043d\u043e \u0441\u0430\u043c\u0430 \u043d\u0435 \u043f\u0440\u0438\u043d\u043e\u0441\u0438\u0442 \u043e\u0447\u043a\u043e\u0432' },
  { id: 'market', target: 'market', position: 'top' as const, text: '\u2b07\ufe0f \u0412\u044b\u0431\u0435\u0440\u0438 \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0443', sub: '\u041d\u0430\u0436\u043c\u0438 \u0438\u043b\u0438 \u043f\u0435\u0440\u0435\u0442\u0430\u0449\u0438 \u043e\u0434\u043d\u0443 \u0438\u0437 4 \u043a\u0430\u0440\u0442\u043e\u0447\u0435\u043a' },
  { id: 'place', target: 'board', position: 'center' as const, text: '\u2b06\ufe0f \u041f\u043e\u0441\u0442\u0430\u0432\u044c \u043d\u0430 \u0434\u043e\u0441\u043a\u0443', sub: '\u041f\u043e\u0434\u0441\u0432\u0435\u0447\u0435\u043d\u043d\u044b\u0435 \u043c\u0435\u0441\u0442\u0430 = \u043a\u0443\u0434\u0430 \u043c\u043e\u0436\u043d\u043e. \u0427\u0438\u0441\u043b\u043e = \u0441\u043a\u043e\u043b\u044c\u043a\u043e \u043c\u043e\u043d\u0435\u0442 \u043f\u043e\u043b\u0443\u0447\u0438\u0448\u044c' },
  { id: 'score', target: 'scorebar', position: 'bottom' as const, text: '\ud83e\ude99 \u041e\u0447\u043a\u0438 \u043d\u0430\u043a\u0430\u043f\u043b\u0438\u0432\u0430\u044e\u0442\u0441\u044f \u0437\u0434\u0435\u0441\u044c', sub: '\u0421\u043e\u0435\u0434\u0438\u043d\u044f\u0439 \u043e\u0434\u0438\u043d\u0430\u043a\u043e\u0432\u044b\u0435 \u0446\u0432\u0435\u0442\u0430 \u0434\u043b\u044f \u0431\u043e\u043b\u044c\u0448\u0438\u0445 \u043e\u0447\u043a\u043e\u0432' },
  { id: 'colors', target: 'market', position: 'top' as const, text: '\ud83c\udfa8 4 \u0446\u0432\u0435\u0442\u0430 = 4 \u0442\u0438\u043f\u0430', sub: '\ud83c\udf6d \u041a\u0430\u0440\u0430\u043c\u0435\u043b\u044c \u00b7 \ud83e\uddc1 \u0412\u044b\u043f\u0435\u0447\u043a\u0430 \u00b7 \ud83c\udf6b \u0428\u043e\u043a\u043e\u043b\u0430\u0434 \u00b7 \ud83c\udf66 \u041c\u043e\u0440\u043e\u0436\u0435\u043d\u043e\u0435' },
  { id: 'award', target: 'board', position: 'center' as const, text: '\ud83c\udfc6 \u0421\u043e\u0431\u0435\u0440\u0438 5 \u0440\u0430\u0437\u043d\u044b\u0445 = \u043d\u0430\u0433\u0440\u0430\u0434\u0430', sub: '5 \u0440\u0430\u0437\u043d\u044b\u0445 \u0441\u043b\u0430\u0434\u043e\u0441\u0442\u0435\u0439 \u043e\u0434\u043d\u043e\u0433\u043e \u0446\u0432\u0435\u0442\u0430 = +5 \u043c\u043e\u043d\u0435\u0442' },
  { id: 'go', target: 'board', position: 'center' as const, text: '\ud83d\ude80 \u0417\u0430\u043f\u043e\u043b\u043d\u0438 \u0434\u043e\u0441\u043a\u0443 4\u00d74!', sub: '\u0423\u0434\u0430\u0447\u0438!' },
];

interface TutorialOverlayProps {
  step: number;
  onNext: () => void;
  onSkip: () => void;
}

export function TutorialOverlay({ step, onNext, onSkip }: TutorialOverlayProps) {
  const current = TUTORIAL_STEPS[step];
  const isLast = step === TUTORIAL_STEPS.length - 1;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <>
      {/* Dim overlay — click to advance */}
      <div
        onClick={onNext}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.35)',
          zIndex: 900,
          cursor: 'pointer',
        }}
      />

      {/* Tooltip */}
      <div
        style={{
          position: 'fixed',
          top: current.target === 'scorebar' ? 0 : current.target === 'market' ? 'auto' : '40%',
          bottom: current.target === 'market' ? 100 : 'auto',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          zIndex: 950,
          pointerEvents: 'none',
        }}
      >
        <div
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          style={{
            pointerEvents: 'auto',
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: '16px 24px',
            maxWidth: 320,
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            transform: visible ? 'translateY(0)' : 'translateY(8px)',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: 22, marginBottom: 4 }}>{current.text}</div>
          {current.sub && (
            <div style={{ fontSize: 13, color: '#777', lineHeight: 1.4 }}>{current.sub}</div>
          )}

          <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
            {/* Progress dots */}
            <div style={{ display: 'flex', gap: 4 }}>
              {TUTORIAL_STEPS.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: i === step ? 16 : 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: i === step ? '#4CAF50' : '#ddd',
                    transition: 'all 0.2s',
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ marginTop: 8, display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={(e) => { e.stopPropagation(); onSkip(); }}
              style={{
                background: 'none',
                border: 'none',
                color: '#bbb',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Пропустить
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              style={{
                background: isLast ? '#4CAF50' : '#eee',
                color: isLast ? '#fff' : '#333',
                border: 'none',
                borderRadius: 8,
                padding: '6px 16px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {isLast ? 'Играть!' : 'Ок'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
