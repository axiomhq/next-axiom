import { useRef } from 'react';
import { equals } from 'remeda';

export function useDeepMemo<T extends Record<string, unknown>>(value: T) {
  const ref = useRef<T>();

  if (!equals(value, ref.current)) {
    ref.current = value;
  }

  return ref.current;
}
