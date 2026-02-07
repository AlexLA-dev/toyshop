/**
 * Action-based tutorial: each step highlights a game area with a pulsing
 * animation and a tooltip hint. Steps advance ONLY when the user performs
 * the required action (pick a tile, place it, etc.) — not by clicking "OK".
 */

export const TutorialAction = {
  /** Just click the overlay / tooltip to proceed */
  Click: 'click',
  /** Advance when user picks a tile from market */
  PickTile: 'pick_tile',
  /** Advance when user places a tile on the board */
  PlaceTile: 'place_tile',
  /** Advance when user clicks "Next" button */
  EndTurn: 'end_turn',
} as const;
export type TutorialAction = (typeof TutorialAction)[keyof typeof TutorialAction];

export interface TutorialStep {
  id: string;
  /** Which area to highlight: 'market' | 'board' | 'scorebar' | 'none' */
  target: 'market' | 'board' | 'scorebar' | 'none';
  /** What triggers advancement */
  action: TutorialAction;
  /** Main hint text */
  text: string;
  /** Secondary hint text */
  sub?: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    target: 'none',
    action: TutorialAction.Click,
    text: '🍬 Магазин Сладостей!',
    sub: 'Собирай сладости одного цвета вместе — зарабатывай монеты!',
  },
  {
    id: 'pick_tile',
    target: 'market',
    action: TutorialAction.PickTile,
    text: '👇 Выбери карточку снизу',
    sub: 'Нажми на одну из карточек',
  },
  {
    id: 'place_tile',
    target: 'board',
    action: TutorialAction.PlaceTile,
    text: '👆 Поставь на доску',
    sub: 'Нажми на подсвеченное место — число показывает сколько монет получишь',
  },
  {
    id: 'score_hint',
    target: 'scorebar',
    action: TutorialAction.EndTurn,
    text: '🪙 Очки наверху!',
    sub: 'Соединяй одинаковые цвета для больших очков. Нажми «Далее» чтобы продолжить.',
  },
  {
    id: 'go',
    target: 'none',
    action: TutorialAction.Click,
    text: '🚀 Заполни доску 4×4!',
    sub: '5 разных сладостей одного цвета = награда +5. Удачи!',
  },
];

/* ---- Pulsing CSS injected once ---- */
const PULSE_CSS = `
@keyframes tutorial-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.5); }
  50% { box-shadow: 0 0 0 8px rgba(76, 175, 80, 0); }
}
@keyframes tutorial-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
.tutorial-highlight {
  animation: tutorial-pulse 1.2s ease-in-out infinite;
  border-radius: 12px;
  position: relative;
  z-index: 800;
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

  // Position based on target
  const positionStyle: React.CSSProperties = (() => {
    switch (step.target) {
      case 'market':
        return { bottom: 120, left: 0, right: 0 };
      case 'scorebar':
        return { top: 70, left: 0, right: 0 };
      case 'board':
        return { top: '35%', left: 0, right: 0 };
      default:
        return { top: '38%', left: 0, right: 0 };
    }
  })();

  return (
    <>
      {/* Semi-transparent backdrop for click-to-continue steps */}
      {isClickStep && (
        <div
          onClick={onClickAdvance}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 900,
            cursor: 'pointer',
          }}
        />
      )}

      {/* Tooltip */}
      <div
        style={{
          position: 'fixed',
          ...positionStyle,
          display: 'flex',
          justifyContent: 'center',
          zIndex: 950,
          pointerEvents: isClickStep ? 'none' : 'none',
        }}
      >
        <div
          onClick={isClickStep ? onClickAdvance : undefined}
          style={{
            pointerEvents: isClickStep ? 'auto' : 'none',
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: '14px 22px',
            maxWidth: 300,
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            cursor: isClickStep ? 'pointer' : 'default',
            animation: 'tutorial-bounce 2s ease-in-out infinite',
          }}
        >
          <div style={{ fontSize: 20, marginBottom: 4 }}>{step.text}</div>
          {step.sub && (
            <div style={{ fontSize: 12, color: '#777', lineHeight: 1.4 }}>{step.sub}</div>
          )}
          {isClickStep && (
            <div style={{ fontSize: 11, color: '#bbb', marginTop: 8 }}>
              Нажми чтобы продолжить
            </div>
          )}
        </div>
      </div>
    </>
  );
}
