import { useState, useEffect } from "react";

interface KvStoreOptions {
  persistent?: boolean;
  localStorageKey?: string;
  trackAndIsolate?: boolean;
}

export const createKvStore = (
  { persistent, localStorageKey, trackAndIsolate }: KvStoreOptions = {
    persistent: false,
    localStorageKey: "usePersistentKvStateDefaultLocalStorageKey",
    trackAndIsolate: false,
  }
) => {
  const kvStore = new Map();
  const listeners = new Map();
  const scopeTracking = new Map();
  let count = BigInt(0);

  const useKVStore = <K extends PropertyKey, T>(
    propKey: K,
    initialValue?: T
  ): [T, (newValue: T) => void] => {
    count++;
    let key = propKey;
    const newScope = `${propKey.toString()}.${count.toString()}`;
    const [thisScope, setScope] = useState<any>(null);
    const lsKey = `${localStorageKey}.${key.toString()}`;

    const [state, setState] = useState<T>(() => {
      if (trackAndIsolate) {
        console.log("setting state", key, initialValue, kvStore.has(key));
      }
      if (kvStore.has(key)) {
        return kvStore.get(key);
      }

      if (persistent && localStorage.getItem(lsKey)) {
        kvStore.set(key, JSON.parse(localStorage.getItem(lsKey) as string));
        return kvStore.get(key);
      }

      if (trackAndIsolate) {
        return initialValue || "";
      }

      kvStore.set(key, initialValue);
      persistent && localStorage.setItem(lsKey, JSON.stringify(initialValue));
      return kvStore.get(key);
    });

    const setupScope = () => {
      if (trackAndIsolate && initialValue !== undefined) {
        key = scopeTracking.get(propKey);
        scopeTracking.delete(propKey);
        console.log("setting scope (top level)", key);
        setScope(key);
        setKVStore(initialValue);
      }

      if (trackAndIsolate && initialValue === undefined) {
        if (scopeTracking.has(key)) {
          console.log("setting scope", newScope);
          key = scopeTracking.get(key);
          setScope(key);
        } else {
          console.log("setupScope", newScope);
          scopeTracking.set(propKey, newScope);
          kvStore.set(newScope, initialValue);
          //@ts-ignore
          key = newScope;
          setScope(newScope);
        }
      }
    };

    const cleanupScope = () => {
      if (trackAndIsolate && initialValue !== undefined) {
        console.log(
          "cleanupScope",
          kvStore.size,
          scopeTracking.size,
          listeners.size,
          thisScope,
          key
        );
        scopeTracking.delete(propKey);
        kvStore.delete(key);
        listeners.delete(key);
      }
    };

    const setupListeners = () => {
      if (trackAndIsolate) {
        console.log("setupListeners", key);
      }
      if (!listeners.has(key)) {
        listeners.set(key, []);
      }
      listeners.get(key).push(setState);
    };

    const cleanupListeners = () => {
      if (trackAndIsolate) {
        console.log("cleanupListeners", key);
      }

      if (listeners.has(key)) {
        listeners.set(
          key,
          listeners.get(key).filter((listener: any) => listener !== setState)
        );

        if (listeners.get(key).length === 0) {
          listeners.delete(key);
        }
      }
    };

    useEffect(() => {
      setupScope();
      setupListeners();

      return () => {
        cleanupScope();
        cleanupListeners();
      };
    }, [key]);

    const setKVStore = (newValue: T) => {
      if (trackAndIsolate) {
        if (thisScope) {
          key = thisScope;
        }
        console.log("setting scope and value", key);
      }

      if (!key) return;

      kvStore.set(key, newValue);
      persistent && localStorage.setItem(lsKey, JSON.stringify(newValue));
      listeners.get(key).forEach((listener: any) => listener(newValue));
    };

    return [state, setKVStore];
  };

  return useKVStore;
};

export const useKvState = createKvStore();
export const usePersistentKvState = createKvStore({ persistent: true });
export const useScopedKvState = createKvStore({
  trackAndIsolate: true,
});
