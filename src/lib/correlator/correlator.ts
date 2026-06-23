import { randomUUID } from 'crypto';
import cls from 'cls-hooked';

const store = cls.createNamespace('correlation-id-namespace');
const CORRELATION_ID_KEY = 'correlation-id';

function withId(fn: () => void, id?: string): void {
  store.run(() => {
    store.set(CORRELATION_ID_KEY, id || randomUUID());
    fn();
  });
}

function runWithId<T>(id: string | undefined, fn: () => T): T {
  return store.runAndReturn(() => {
    store.set(CORRELATION_ID_KEY, id || randomUUID());
    return fn();
  });
}

function getId(): string | undefined {
  try {
    return store.get(CORRELATION_ID_KEY);
  } catch {
    return undefined;
  }
}

const correlator = {
  withId,
  runWithId,
  getId,
  bindEmitter: store.bindEmitter.bind(store),
  bind: store.bind.bind(store),
};

export default correlator;
