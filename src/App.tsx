import { useState, useCallback, useMemo } from 'react';
import { GameScreen } from './components/GameScreen';
import { TutorialHint, TutorialAction, TUTORIAL_STEPS } from './components/Tutorial';
import { createTutorialGame } from './game/state';

export default function App() {
  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialDone, setTutorialDone] = useState(false);

  // Create a scripted tutorial game (stable across re-renders)
  const tutorialGameState = useMemo(() => createTutorialGame(), []);

  const currentStep = !tutorialDone && tutorialStep < TUTORIAL_STEPS.length
    ? TUTORIAL_STEPS[tutorialStep]
    : null;

  const advance = useCallback(() => {
    setTutorialStep(s => {
      const next = s + 1;
      if (next >= TUTORIAL_STEPS.length) {
        setTutorialDone(true);
        return s;
      }
      return next;
    });
  }, []);

  const handleTutorialAction = useCallback((action: TutorialAction) => {
    if (!currentStep) return;
    if (currentStep.action === action) {
      advance();
    }
  }, [currentStep, advance]);

  const handleClickAdvance = useCallback(() => {
    if (!currentStep) return;
    if (currentStep.action === TutorialAction.Click) {
      advance();
    }
  }, [currentStep, advance]);

  return (
    <>
      <GameScreen
        tutorialStep={currentStep}
        onTutorialAction={handleTutorialAction}
        initialState={tutorialGameState}
      />
      {currentStep && (
        <TutorialHint step={currentStep} onClickAdvance={handleClickAdvance} />
      )}
    </>
  );
}
