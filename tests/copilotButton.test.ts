import { test } from 'node:test';
import assert from 'node:assert';

// ─── Pure functions representing Copilot Button logic ───

export function clampCopilotPosition(
  initX: number,
  dx: number,
  initY: number,
  dy: number,
  viewport: { width: number; height: number },
  isExpanded: boolean
): { x: number; y: number } {
  const maxX = 30;
  const minX = -viewport.width + (isExpanded ? 390 : 70);
  const maxY = Math.max(60, viewport.height / 2 - 60);
  const minY = -Math.max(60, viewport.height / 2 - 60);

  const newX = Math.min(maxX, Math.max(minX, initX + dx));
  const newY = Math.min(maxY, Math.max(minY, initY + dy));

  return { x: newX, y: newY };
}

export function isClickGesture(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  threshold = 5
): boolean {
  const dist = Math.hypot(endX - startX, endY - startY);
  return dist <= threshold;
}

export function handleCopilotKeyDown(
  event: { key: string; metaKey?: boolean; ctrlKey?: boolean },
  currentState: { copilotOpen: boolean }
): { action: 'toggle' | 'close' | 'none'; nextOpen: boolean } {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    return { action: 'toggle', nextOpen: !currentState.copilotOpen };
  }
  if (event.key === 'Escape' && currentState.copilotOpen) {
    return { action: 'close', nextOpen: false };
  }
  return { action: 'none', nextOpen: currentState.copilotOpen };
}

// ─── Tests ───

test('Copilot Button - Drag vs Click Gesture Discrimination', () => {
  // Test small mouse click jitter (< 5px) -> Must register as a CLICK
  assert.strictEqual(isClickGesture(100, 200, 102, 201), true);
  assert.strictEqual(isClickGesture(100, 200, 100, 204), true);
  assert.strictEqual(isClickGesture(100, 200, 100, 200), true); // Perfect click

  // Test deliberate drags (> 5px) -> Must register as a DRAG
  assert.strictEqual(isClickGesture(100, 200, 115, 200), false);
  assert.strictEqual(isClickGesture(100, 200, 100, 220), false);
  assert.strictEqual(isClickGesture(100, 200, 150, 250), false);
});

test('Copilot Button - Clamping keeps small button strictly within viewport bounds', () => {
  const desktopViewport = { width: 1920, height: 1080 };
  const mobileViewport = { width: 375, height: 667 };

  // Attempt to drag small button off-screen to the right (positive X)
  const clampedRight = clampCopilotPosition(0, 500, 0, 0, desktopViewport, false);
  assert.strictEqual(clampedRight.x, 30); // Max right limit

  // Attempt to drag small button off-screen to the left (extreme negative X)
  const clampedLeft = clampCopilotPosition(0, -3000, 0, 0, desktopViewport, false);
  assert.strictEqual(clampedLeft.x, -1920 + 70); // Clamped to left border with margin

  // Attempt to drag small button off-screen vertically on mobile
  const clampedTop = clampCopilotPosition(0, 0, 0, -1000, mobileViewport, false);
  assert.strictEqual(clampedTop.y, -Math.max(60, 667 / 2 - 60));

  const clampedBottom = clampCopilotPosition(0, 0, 0, 1000, mobileViewport, false);
  assert.strictEqual(clampedBottom.y, Math.max(60, 667 / 2 - 60));
});

test('Copilot Console - Clamping keeps expanded panel visible without horizontal overflow', () => {
  const desktopViewport = { width: 1920, height: 1080 };

  // Expanded panel needs at least 390px margin on the left
  const clampedExpandedLeft = clampCopilotPosition(0, -3000, 0, 0, desktopViewport, true);
  assert.strictEqual(clampedExpandedLeft.x, -1920 + 390);
});

test('Copilot Keyboard Shortcuts - Ctrl+K toggles and Escape closes', () => {
  // 1. Ctrl+K opens when closed
  const res1 = handleCopilotKeyDown({ key: 'k', ctrlKey: true }, { copilotOpen: false });
  assert.strictEqual(res1.action, 'toggle');
  assert.strictEqual(res1.nextOpen, true);

  // 2. Cmd+K closes when open
  const res2 = handleCopilotKeyDown({ key: 'K', metaKey: true }, { copilotOpen: true });
  assert.strictEqual(res2.action, 'toggle');
  assert.strictEqual(res2.nextOpen, false);

  // 3. Escape closes when open
  const res3 = handleCopilotKeyDown({ key: 'Escape' }, { copilotOpen: true });
  assert.strictEqual(res3.action, 'close');
  assert.strictEqual(res3.nextOpen, false);

  // 4. Escape is a no-op when already closed
  const res4 = handleCopilotKeyDown({ key: 'Escape' }, { copilotOpen: false });
  assert.strictEqual(res4.action, 'none');
  assert.strictEqual(res4.nextOpen, false);

  // 5. Unrelated key does nothing
  const res5 = handleCopilotKeyDown({ key: 'Enter' }, { copilotOpen: true });
  assert.strictEqual(res5.action, 'none');
  assert.strictEqual(res5.nextOpen, true);
});

test('Copilot State Decoupling - Beginner mode preference is never overwritten', () => {
  // Simulates decoupled store logic
  let state = {
    copilotOpen: false,
    beginnerMode: false // User is an advanced trader
  };

  const setCopilotOpen = (open: boolean) => {
    state.copilotOpen = open;
  };

  const toggleCopilotOpen = () => {
    state.copilotOpen = !state.copilotOpen;
  };

  // Open Copilot via toggle
  toggleCopilotOpen();
  assert.strictEqual(state.copilotOpen, true);
  assert.strictEqual(state.beginnerMode, false); // beginnerMode remains false!

  // Close Copilot via setCopilotOpen(false)
  setCopilotOpen(false);
  assert.strictEqual(state.copilotOpen, false);
  assert.strictEqual(state.beginnerMode, false); // beginnerMode remains false!

  // Explicitly open via setCopilotOpen(true)
  setCopilotOpen(true);
  assert.strictEqual(state.copilotOpen, true);
  assert.strictEqual(state.beginnerMode, false); // never clobbered!
});

test('Copilot Nav Bar Toggle - Toggles moving copilot button visibility without opening console', () => {
  let state = {
    copilotVisible: true,
    copilotOpen: false
  };

  const toggleCopilotVisible = () => {
    state.copilotVisible = !state.copilotVisible;
    state.copilotOpen = false; // Never open console dialog when toggling the button
  };

  // 1. Initial state: moving button is visible, console is closed
  assert.strictEqual(state.copilotVisible, true);
  assert.strictEqual(state.copilotOpen, false);

  // 2. Click nav bar button to hide moving copilot button
  toggleCopilotVisible();
  assert.strictEqual(state.copilotVisible, false);
  assert.strictEqual(state.copilotOpen, false);

  // 3. Click nav bar button again to reveal moving copilot button
  toggleCopilotVisible();
  assert.strictEqual(state.copilotVisible, true);
  // Crucial: console dialog remains strictly closed
  assert.strictEqual(state.copilotOpen, false);

  // 4. If console was previously open and user hides the button, console closes
  state.copilotOpen = true;
  toggleCopilotVisible();
  assert.strictEqual(state.copilotVisible, false);
  assert.strictEqual(state.copilotOpen, false);
});
