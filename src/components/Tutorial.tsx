/**
 * Action-based tutorial: each step highlights a specific game element.
 * Steps advance when the user performs the required action.
 * Hints always appear at the bottom of the screen.
 */

import type { GridPos } from '../game/types';

export const TutorialAction = {
  Click: 'click',
  PickTile: 'pick_tile',
  PlaceTile: 'place_tile',
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
  /** Auto-advance to next turn after placement (skip "Далее" button) */
  autoEndTurn?: boolean;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    target: 'none',
    action: TutorialAction.Click,
    text: '🍬 Магазин Сладостей!',
    sub: 'Ставь тайлы на доску. Соединяй одинаковые цвета — зарабатывай 💵!',
  },
  {
    id: 'pick1',
    target: 'market',
    action: TutorialAction.PickTile,
    text: '👇 Выбери красный тайл с пончиком',
    sub: 'Нажми на него внизу',
    marketIndex: 0,
  },
  {
    id: 'place1',
    target: 'board',
    action: TutorialAction.PlaceTile,
    text: '👆 Поставь рядом с кассой',
    sub: 'Пока 0 💵 — нужно 2+ тайла одного цвета рядом!',
    boardPos: { row: 1, col: 2 },
    autoEndTurn: true,
  },
  {
    id: 'pick2',
    target: 'market',
    action: TutorialAction.PickTile,
    text: '👇 Теперь выбери красно-фиолетовый тайл',
    sub: 'Красная часть соединится с пончиком!',
    marketIndex: 1,
  },
  {
    id: 'place2',
    target: 'board',
    action: TutorialAction.PlaceTile,
    text: '👆 Ставь сюда — сверху от пончика',
    sub: '2 красных тайла рядом = 💵2000!',
    boardPos: { row: 0, col: 2 },
    autoEndTurn: true,
  },
  {
    id: 'collections',
    target: 'none',
    action: TutorialAction.Click,
    text: '🏆 Собирай коллекции!',
    sub: 'Собери все 4 разных товара одного цвета (🧇🥐🍩🥞) — получи бонус 💵5000!',
  },
  {
    id: 'go',
    target: 'none',
    action: TutorialAction.Click,
    text: '🚀 Заполни доску 4×4!',
    sub: 'Чем больше одноцветных тайлов рядом — тем больше 💵. Удачи!',
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
  50% { transform: translateY(-4px); }
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

/* ---- Hint component — always at the bottom ---- */
interface TutorialHintProps {
  step: TutorialStep;
  onClickAdvance: () => void;
}

export function TutorialHint({ step, onClickAdvance }: TutorialHintProps) {
  injectCSS();

  const isClickStep = step.action === TutorialAction.Click;

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
          bottom: 120,
          left: 0,
          right: 0,
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
            padding: '14px 22px',
            maxWidth: 320,
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            cursor: isClickStep ? 'pointer' : 'default',
            animation: 'tutorial-bounce 2s ease-in-out infinite',
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{step.text}</div>
          {step.sub && (
            <div style={{ fontSize: 14, color: '#666', lineHeight: 1.4 }}>{step.sub}</div>
          )}
          {isClickStep && (
            <div style={{ fontSize: 12, color: '#bbb', marginTop: 8 }}>
              Нажми чтобы продолжить
            </div>
          )}
        </div>
      </div>
    </>
  );
}
