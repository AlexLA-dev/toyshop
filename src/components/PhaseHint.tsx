import type { GamePhase } from '../types';

const PHASE_HINTS: Record<GamePhase, string> = {
  place_cash: 'Нажми на клетку, чтобы поставить кассу',
  select_card: 'Выбери карту с рынка',
  place_card: 'Поставь карту на подсвеченную клетку',
  scoring: '',
  game_over: '',
};

interface PhaseHintProps {
  phase: GamePhase;
}

export function PhaseHint({ phase }: PhaseHintProps) {
  const hint = PHASE_HINTS[phase];
  if (!hint) return null;

  return (
    <div
      style={{
        textAlign: 'center',
        fontSize: 13,
        color: '#8B7355',
        fontWeight: 500,
        padding: '6px 0',
        minHeight: 24,
      }}
    >
      {hint}
    </div>
  );
}
