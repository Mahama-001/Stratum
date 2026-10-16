import { test } from 'node:test';
import assert from 'node:assert';

function calculate4PanelCutout(
  targetRect: { left: number; top: number; right: number; bottom: number; width: number; height: number },
  viewport: { width: number; height: number } = { width: 1920, height: 1080 },
  padding: number = 10
) {
  const tTop = Math.max(0, targetRect.top - padding);
  const tBottom = Math.min(viewport.height, targetRect.bottom + padding);
  const tLeft = Math.max(0, targetRect.left - padding);
  const tRight = Math.min(viewport.width, targetRect.right + padding);
  const tWidth = Math.max(0, tRight - tLeft);
  const tHeight = Math.max(0, tBottom - tTop);

  return {
    topPanel: { top: 0, left: 0, right: 0, height: tTop },
    bottomPanel: { top: tBottom, left: 0, right: 0, bottom: 0 },
    leftPanel: { top: tTop, left: 0, width: tLeft, height: tHeight },
    rightPanel: { top: tTop, left: tRight, right: 0, height: tHeight },
    cutoutHole: { top: tTop, left: tLeft, width: tWidth, height: tHeight }
  };
}

test('Tutorial Focus - 4-Panel Cutout leaves central focused target completely unobstructed', () => {
  const target = {
    left: 200,
    top: 300,
    right: 600,
    bottom: 500,
    width: 400,
    height: 200
  };

  const panels = calculate4PanelCutout(target, { width: 1920, height: 1080 }, 10);

  // Top panel covers y: 0 to (300 - 10) = 290
  assert.strictEqual(panels.topPanel.height, 290);

  // Bottom panel covers y: (500 + 10) = 510 to bottom (1080)
  assert.strictEqual(panels.bottomPanel.top, 510);

  // Left panel covers x: 0 to (200 - 10) = 190, y: 290 to 510 (height: 220)
  assert.strictEqual(panels.leftPanel.top, 290);
  assert.strictEqual(panels.leftPanel.width, 190);
  assert.strictEqual(panels.leftPanel.height, 220);

  // Right panel covers x: (600 + 10) = 610 to 1920, y: 290 to 510 (height: 220)
  assert.strictEqual(panels.rightPanel.top, 290);
  assert.strictEqual(panels.rightPanel.left, 610);
  assert.strictEqual(panels.rightPanel.height, 220);

  // The cutout hole in the center (uncovered):
  assert.strictEqual(panels.cutoutHole.top, 290);
  assert.strictEqual(panels.cutoutHole.left, 190);
  assert.strictEqual(panels.cutoutHole.width, 420); // (600 + 10) - (200 - 10)
  assert.strictEqual(panels.cutoutHole.height, 220); // (500 + 10) - (300 - 10)
});

test('Tutorial Navigation - Advances through tabs reliably on Next Step', () => {
  const mockSteps = [
    { id: 'step-1', requiredTab: 'LANDING' },
    { id: 'step-2', requiredTab: 'LANDING' },
    { id: 'step-3', requiredTab: 'LANDING' },
    { id: 'step-4', requiredTab: 'TERMINAL' },
    { id: 'step-5', requiredTab: 'PLAYBOOK' },
    { id: 'step-6', requiredTab: 'RISK_ENGINE' },
    { id: 'step-7', requiredTab: 'CHECKLIST' }
  ];

  let currentStep = 0;
  let currentTab = 'LANDING';
  let isCompleted = false;

  const handleNext = () => {
    const nextIdx = currentStep + 1;
    if (nextIdx >= mockSteps.length) {
      isCompleted = true;
      return;
    }
    const nextStep = mockSteps[nextIdx];
    if (nextStep.requiredTab && nextStep.requiredTab !== currentTab) {
      currentTab = nextStep.requiredTab;
    }
    currentStep = nextIdx;
  };

  // Step 0 -> Step 1 (Landing)
  handleNext();
  assert.strictEqual(currentStep, 1);
  assert.strictEqual(currentTab, 'LANDING');

  // Step 1 -> Step 2 (Landing)
  handleNext();
  assert.strictEqual(currentStep, 2);
  assert.strictEqual(currentTab, 'LANDING');

  // Step 2 -> Step 3 (Transitions to TERMINAL)
  handleNext();
  assert.strictEqual(currentStep, 3);
  assert.strictEqual(currentTab, 'TERMINAL');

  // Step 3 -> Step 4 (Transitions to PLAYBOOK)
  handleNext();
  assert.strictEqual(currentStep, 4);
  assert.strictEqual(currentTab, 'PLAYBOOK');

  // Step 4 -> Step 5 (Transitions to RISK_ENGINE)
  handleNext();
  assert.strictEqual(currentStep, 5);
  assert.strictEqual(currentTab, 'RISK_ENGINE');

  // Step 5 -> Step 6 (Transitions to CHECKLIST)
  handleNext();
  assert.strictEqual(currentStep, 6);
  assert.strictEqual(currentTab, 'CHECKLIST');

  // Final Step -> Completion
  handleNext();
  assert.strictEqual(isCompleted, true);
});

test('Tutorial Step 4+ Resilience - Auto-start defensive guard never resets in-progress tutorial', () => {
  // Simulates client store state
  let state = {
    tutorialOpen: true,
    tutorialStep: 3, // User is at Step 4 (0-indexed step 3)
    completed: null as string | null
  };

  let wasReset = false;
  const startTutorial = () => {
    state.tutorialOpen = true;
    state.tutorialStep = 0;
    wasReset = true;
  };

  // Simulates the mount/re-evaluation logic with defensive guard
  const runAutoStartCheck = () => {
    if (state.completed !== 'true') {
      // DEFENSIVE GUARD: only auto-start if NOT open and at step 0
      if (!state.tutorialOpen && state.tutorialStep === 0) {
        startTutorial();
      }
    }
  };

  // When reaching Step 4 (or any step >= 1), auto-start must NOT reset
  runAutoStartCheck();
  assert.strictEqual(wasReset, false);
  assert.strictEqual(state.tutorialStep, 3);
  assert.strictEqual(state.tutorialOpen, true);

  // Even if tutorial was somehow reopened without completion, if step > 0 it must not be clobbered
  state.tutorialOpen = false;
  state.tutorialStep = 4;
  runAutoStartCheck();
  assert.strictEqual(wasReset, false);
  assert.strictEqual(state.tutorialStep, 4);

  // Only on initial cold start (open: false, step: 0, completed: null) should it trigger
  state.tutorialOpen = false;
  state.tutorialStep = 0;
  runAutoStartCheck();
  assert.strictEqual(wasReset, true);
  assert.strictEqual(state.tutorialStep, 0);
  assert.strictEqual(state.tutorialOpen, true);
});

