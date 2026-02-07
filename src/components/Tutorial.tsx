import type { TutorialStep } from '../types';

const TUTORIAL_CONTENT: Record<TutorialStep, { title: string; text: string } | null> = {
  place_cash: {
    title: 'Поставь кассу',
    text: 'Выбери любую клетку для своей кассы. Касса соединяет зоны любого цвета!',
  },
  select_card: {
    title: 'Выбери карту',
    text: 'Нажми на одну из 4 карт на рынке, чтобы взять её.',
  },
  place_card: {
    title: 'Размести карту',
    text: 'Поставь карту рядом с кассой или другой картой (по стороне).',
  },
  combo_explain: {
    title: 'Комбо!',
    text: 'Когда цвета на краях совпадают — образуется зона. Чем больше игрушек в зоне, тем больше монет!',
  },
  goal: {
    title: 'Цель игры',
    text: 'Заполни весь магазин 4×4 и собери как можно больше монет. Удачи!',
  },
  done: null,
};

interface TutorialProps {
  step: TutorialStep;
  onAdvance: () => void;
}

export function Tutorial({ step, onAdvance }: TutorialProps) {
  const content = TUTORIAL_CONTENT[step];
  if (!content) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px 20px',
        background: 'linear-gradient(to top, rgba(255,255,255,0.98), rgba(255,255,255,0.92))',
        borderTop: '2px solid #FF6B00',
        zIndex: 50,
        animation: 'slideUp 0.2s ease',
      }}
    >
      <div style={{ maxWidth: 360, margin: '0 auto' }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: '#FF6B00',
            marginBottom: 4,
          }}
        >
          {content.title}
        </div>
        <div style={{ fontSize: 13, color: '#5D4E37', marginBottom: 10, lineHeight: 1.4 }}>
          {content.text}
        </div>
        {(step === 'combo_explain' || step === 'goal') && (
          <button
            onClick={onAdvance}
            style={{
              padding: '6px 20px',
              border: 'none',
              borderRadius: 6,
              background: '#FF6B00',
              color: '#FFF',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Понятно
          </button>
        )}
      </div>
    </div>
  );
}
