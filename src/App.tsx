import { useState } from 'react';
import { GameScreen } from './components/GameScreen';
import { Tutorial } from './components/Tutorial';

export default function App() {
  const [showTutorial, setShowTutorial] = useState(true);

  return (
    <>
      {showTutorial && <Tutorial onComplete={() => setShowTutorial(false)} />}
      <GameScreen />
    </>
  );
}
