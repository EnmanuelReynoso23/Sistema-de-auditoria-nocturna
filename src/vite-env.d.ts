/// <reference types="vite/client" />

// Tipos para APIs web modernas
interface WakeLockSentinel {
  readonly released: boolean;
  readonly type: 'screen';
  release(): Promise<void>;
}

interface Navigator {
  wakeLock: {
    request(type: 'screen'): Promise<WakeLockSentinel>;
  };
}
