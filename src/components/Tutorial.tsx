import { useState } from 'react';

interface TutorialProps {
  onComplete: () => void;
}

const STEPS = [
  {
    title: 'Добро пожаловать!',
    text: 'Вы — владелец магазина игрушек. Расставляйте товары так, чтобы одинаковые цвета соединялись и приносили больше монет.',
  },
  {
    title: 'Витрина',
    text: 'В каждый ход берите одну из 4 карточек с витрины. Можно нажать на карточку или перетащить её на доску.',
  },
  {
    title: 'Тайлы',
    text: 'Каждая карточка — это квадрат, разделённый на цветные блоки. Блоки бывают разного размера: весь тайл, половина, или четвертинка. Цвет блока = тип игрушки.',
  },
  {
    title: 'Цвета игрушек',
    text: 'Голубой — плюшевые, фиолетовый — куклы, красный — машинки, зелёный — спорт, оранжевый — касса.',
  },
  {
    title: 'Размещение',
    text: 'Карточку можно положить только рядом с уже лежащей (сбоку). Подсвеченные места — допустимые позиции. При наведении вы увидите предварительный счёт.',
  },
  {
    title: 'Подсчёт очков',
    text: 'Когда новый блок касается блока того же цвета — вы получаете монеты за все игрушки в соединённой области. Касса соединяет, но сама монет не приносит.',
  },
  {
    title: 'Награды',
    text: 'Соберите 5 разных игрушек одного типа — получите награду +5 монет. В конце игры сравните, у кого больше одинаковых игрушек одного типа.',
  },
  {
    title: 'Цель',
    text: 'Заполните доску 4×4 карточками. Побеждает тот, у кого больше всего монет!',
  },
];

export function Tutorial({ onComplete }: TutorialProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: 16,
          padding: 32,
          maxWidth: 420,
          width: '100%',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>
          {step + 1} / {STEPS.length}
        </div>
        <h2 style={{ margin: '0 0 12px', fontSize: 20, color: '#333' }}>
          {current.title}
        </h2>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: '#555', lineHeight: 1.6 }}>
          {current.text}
        </p>

        {/* Color legend on the colors step */}
        {step === 3 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
            {[
              { color: '#5BC0EB', label: 'Плюшевые' },
              { color: '#C882D6', label: 'Куклы' },
              { color: '#E85D5D', label: 'Машинки' },
              { color: '#7BC67E', label: 'Спорт' },
              { color: '#F5A623', label: 'Касса' },
            ].map(({ color, label }) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  borderRadius: 12,
                  backgroundColor: color,
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {label}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              style={{
                padding: '8px 20px',
                fontSize: 14,
                backgroundColor: '#eee',
                color: '#333',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              Назад
            </button>
          )}
          <button
            onClick={isLast ? onComplete : () => setStep(step + 1)}
            style={{
              padding: '8px 20px',
              fontSize: 14,
              backgroundColor: isLast ? '#4CAF50' : '#2196F3',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {isLast ? 'Начать игру!' : 'Далее'}
          </button>
        </div>

        <button
          onClick={onComplete}
          style={{
            marginTop: 16,
            background: 'none',
            border: 'none',
            color: '#999',
            fontSize: 12,
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Пропустить обучение
        </button>
      </div>
    </div>
  );
}
