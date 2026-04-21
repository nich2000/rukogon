const KEY_MAP = {
  ArrowUp: 'up',
  KeyW: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
};

export function createInputController() {
  const state = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  const onChange = (pressed) => (event) => {
    const key = KEY_MAP[event.code];
    if (!key) {
      return;
    }

    state[key] = pressed;
    event.preventDefault();
  };

  const handleKeyDown = onChange(true);
  const handleKeyUp = onChange(false);

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  return {
    getState: () => ({ ...state }),
    destroy: () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    },
  };
}
