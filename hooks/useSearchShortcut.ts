'use client';

import { useLayoutEffect } from 'react';

const NON_TEXT_INPUT_TYPES = new Set([
  'button',
  'checkbox',
  'color',
  'date',
  'datetime-local',
  'file',
  'hidden',
  'image',
  'month',
  'radio',
  'range',
  'reset',
  'submit',
  'time',
  'week',
]);

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return false;
  }

  const editableContainer = target.closest('[contenteditable]');
  if (editableContainer instanceof HTMLElement && editableContainer.isContentEditable) {
    return true;
  }

  const formControl = target.closest('input, textarea');
  if (formControl instanceof HTMLTextAreaElement) {
    return !formControl.disabled && !formControl.readOnly;
  }

  if (formControl instanceof HTMLInputElement) {
    return (
      !formControl.disabled &&
      !formControl.readOnly &&
      !NON_TEXT_INPUT_TYPES.has(formControl.type.toLowerCase())
    );
  }

  return false;
}

function shouldEnableShortcut() {
  if (typeof window === 'undefined') {
    return false;
  }

  const hasFinePointer = window.matchMedia('(any-pointer: fine)').matches;
  const isTouchCentric = window.matchMedia('(pointer: coarse) and (hover: none)').matches;

  return hasFinePointer || !isTouchCentric;
}

export function useSearchShortcut(inputId: string) {
  useLayoutEffect(() => {
    if (!shouldEnableShortcut()) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.isComposing ||
        event.key !== '/' ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey
      ) {
        return;
      }

      if (isEditableTarget(event.target)) {
        return;
      }

      const searchInput = document.getElementById(inputId);
      if (!(searchInput instanceof HTMLInputElement)) {
        return;
      }

      event.preventDefault();
      searchInput.focus();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [inputId]);
}
