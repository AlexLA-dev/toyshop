import type { ToyCard } from '../types';
import { MarketCard } from './CardView';

interface MarketProps {
  cards: ToyCard[];
  selectedCard: ToyCard | null;
  enabled: boolean;
  onSelectCard: (card: ToyCard) => void;
}

export function Market({ cards, selectedCard, enabled, onSelectCard }: MarketProps) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: '#8B7355',
          marginBottom: 6,
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}
      >
        Рынок
      </div>
      <div
        style={{
          display: 'flex',
          gap: 6,
          justifyContent: 'center',
          opacity: enabled ? 1 : 0.5,
          pointerEvents: enabled ? 'auto' : 'none',
        }}
      >
        {cards.map((card) => (
          <MarketCard
            key={card.id}
            card={card}
            selected={selectedCard?.id === card.id}
            onSelect={() => onSelectCard(card)}
          />
        ))}
      </div>
    </div>
  );
}
