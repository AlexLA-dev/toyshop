/**
 * Action-based tutorial: each step highlights a specific game element with
 * a pulsing animation and tooltip. Steps advance ONLY when the user performs
 * the required action — not by clicking "OK".
 */

import type { GridPos } from '../game/types';

export const TutorialAction = {
  Click: 'click',
  PickTile: 'pick_tile',
  PlaceTile: 'place_tile',
  EndTurn: 'end_turn',
} as const;
export type TutorialAction = (typeof TutorialAction)[keyof typeof TutorialAction];

export interface TutorialStep {
  id: string;
  target: 'market' | 'board' | 'scorebar' | 'none';
  action: TutorialAction;
  text: string;
  sub?: string;
  /** Highlight a specific market tile index */
  marketIndex?: number;
  /** Highlight a specific board position */
  boardPos?: GridPos;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    target: 'none',
    action: TutorialAction.Click,
    text: '🍬 Магазин Сладостей!',
    sub: 'Ставь тайлы на доску. Соединяй одинаковые цвета — зарабатывай монеты!',
  },
  {
    id: 'pick_tile',
    target: 'market',
    action: TutorialAction.PickTile,
    text: '👇 Выбери красный тайл',
    sub: 'Нажми на красную карточку с пончиком',
    marketIndex: 0,
  },
  {
    id: 'place_tile',
    target: 'board',
    action: TutorialAction.PlaceTile,
    text: '👆 Поставь рядом с кассой',
    sub: 'Нажми на подсвеченное место справа — число показывает монеты',
    boardPos: { row: 1, col: 2 },
  },
  {
    id: 'score_hint',
    target: 'scorebar',
    action: TutorialAction.EndTurn,
    text: '🪙 Ты заработал монеты!',
    sub: 'Чем больше тайлов одного цвета рядом — тем больше очков. Нажми «Далее»',
  },
  {
    id: 'go',
    target: 'none',
    action: TutorialAction.Click,
    text: '🚀 Заполни доску 4×4!',
    sub: 'Все 4 разных сладости одного цвета = награда +5. Удачи!',
  },
];

/* ---- Pulsing CSS injected once ---- */
const PULSE_CSS = `
@keyframes tutorial-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.6); }
  50% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
}
@keyframes tutorial-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
@keyframes tutorial-glow {
  0%, 100% { box-shadow: 0 0 4px 2px rgba(76, 175, 80, 0.4); }
  50% { box-shadow: 0 0 12px 6px rgba(76, 175, 80, 0.7); }
}
.tutorial-highlight {
  animation: tutorial-pulse 1.2s ease-in-out infinite;
  border-radius: 12px;
  position: relative;
  z-index: 800;
}
.tutorial-glow-item {
  animation: tutorial-glow 1s ease-in-out infinite;
  border-radius: 10px;
}
`;

let cssInjected = false;
function injectCSS() {
  if (cssInjected) return;
  cssInjected = true;
  const style = document.createElement('style');
  style.textContent = PULSE_CSS;
  document.head.appendChild(style);
}

/* ---- Hint tooltip component ---- */
interface TutorialHintProps {
  step: TutorialStep;
  onClickAdvance: () => void;
}

export function TutorialHint({ step, onClickAdvance }: TutorialHintProps) {
  injectCSS();

  const isClickStep = step.action === TutorialAction.Click;

  const positionStyle: React.CSSProperties = (() => {
    switch (step.target) {
      case 'market':
        return { bottom: 110, left: 0, right: 0 };
      case 'scorebar':
        return { top: 80, left: 0, right: 0 };
      case 'board':
        return { top: '30%', left: 0, right: 0 };
      default:
        return { top: '35%', left: 0, right: 0 };
    }
  })();

  return (
    <>
      {isClickStep && (
        <div
          onClick={onClickAdvance}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.35)',
            zIndex: 900,
            cursor: 'pointer',
          }}
        />
      )}

      <div
        style={{
          position: 'fixed',
          ...positionStyle,
          display: 'flex',
          justifyContent: 'center',
          zIndex: 950,
          pointerEvents: 'none',
        }}
      >
        <div
          onClick={isClickStep ? onClickAdvance : undefined}
          style={{
            pointerEvents: isClickStep ? 'auto' : 'none',
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: '16px 24px',
            maxWidth: 320,
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            cursor: isClickStep ? 'pointer' : 'default',
            animation: 'tutorial-bounce 2s ease-in-out infinite',
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{step.text}</div>
          {step.sub && (
            <div style={{ fontSize: 14, color: '#666', lineHeight: 1.4 }}>{step.sub}</div>
          )}
          {isClickStep && (
            <div style={{ fontSize: 12, color: '#bbb', marginTop: 10 }}>
              Нажми чтобы продолжить
            </div>
          )}
        </div>
      </div>
    </>
  );
}
