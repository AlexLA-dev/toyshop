import { useState, useCallback } from 'react';
import { GameScreen } from './components/GameScreen';
import { TutorialOverlay, TUTORIAL_STEPS } from './components/Tutorial';

export default function App() {
  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialDone, setTutorialDone] = useState(false);

  const handleNext = useCallback(() => {
    if (tutorialStep >= TUTORIAL_STEPS.length - 1) {
      setTutorialDone(true);
    } else {
      setTutorialStep(s => s + 1);
    }
  }, [tutorialStep]);

  const handleSkip = useCallback(() => {
    setTutorialDone(true);
  }, []);

  return (
    <>
      <GameScreen />
      {!tutorialDone && (
        <TutorialOverlay step={tutorialStep} onNext={handleNext} onSkip={handleSkip} />
      )}
    </>
  );
}
