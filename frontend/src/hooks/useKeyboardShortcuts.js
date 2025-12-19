import { useEffect } from 'react';
export default function useKeyboardShortcuts({ onNumberKey, onNext, onPrev, onFlag, onSubmitPrompt }) {
  useEffect(() => {
    const handler = (e) => {
      const tag = e.target.tagName.toLowerCase();
      const isEditable = e.target.isContentEditable || tag === 'input' || tag === 'textarea' || tag === 'select';
      if (isEditable) return;
      if (e.key >= '1' && e.key <= '4') { onNumberKey && onNumberKey(Number(e.key)); }
      else if (e.key.toLowerCase() === 'n') { onNext && onNext(); }
      else if (e.key.toLowerCase() === 'p') { onPrev && onPrev(); }
      else if (e.key.toLowerCase() === 'f') { onFlag && onFlag(); }
      else if (e.key.toLowerCase() === 's') { onSubmitPrompt && onSubmitPrompt(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onNumberKey, onNext, onPrev, onFlag, onSubmitPrompt]);
}
