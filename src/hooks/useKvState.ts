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

    if (trackAndIsolate && initialValue !== undefined && thisScope) {
      console.debug(
        "function called",
        propKey,
        key,
        newScope,
        thisScope,
        count
      );
      scopeTracking.set(propKey, thisScope);
    }

    const [state, setState] = useState<T>(() => {
      if (trackAndIsolate) {
        console.debug(
          "setting state",
          key,
          initialValue,
          kvStore.has(key),
          propKey,
          thisScope
        );
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
      if (trackAndIsolate) {
        if (scopeTracking.has(propKey)) {
          if (thisScope) {
            key = thisScope;
          } else {
            key = scopeTracking.get(propKey);
          }

          console.debug("setting scope", key);
          setScope(key);
        } else {
          console.debug("setupScope", thisScope || newScope);
          scopeTracking.set(propKey, thisScope || newScope);
          kvStore.set(thisScope || newScope, initialValue);
          //@ts-ignore
          key = thisScope || newScope;
          setScope(thisScope || newScope);
        }
      }

      if (trackAndIsolate && initialValue !== undefined) {
        if (thisScope) {
          key = thisScope;
        } else {
          key = scopeTracking.get(propKey);
        }
        scopeTracking.delete(propKey);
        console.debug("setting scope (top level)", key);
        setScope(key);
      }
    };

    const cleanupScope = () => {
      if (trackAndIsolate && initialValue !== undefined) {
        console.debug(
          "cleanupScope",
          kvStore.size,
          scopeTracking.size,
          listeners.size,
          thisScope,
          key,
          propKey,
          scopeTracking.get(propKey)
        );

        scopeTracking.delete(propKey);
        kvStore.delete(key);
        listeners.delete(key);
      }
    };

    const setupListeners = () => {
      if (trackAndIsolate) {
        console.debug("setupListeners", key);
      }
      if (!listeners.has(key)) {
        listeners.set(key, []);
      }
      listeners.get(key).push(setState);
    };

    const cleanupListeners = () => {
      if (trackAndIsolate) {
        console.debug("cleanupListeners", key);
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

    const setValuesForScopedKvState = () => {
      if (trackAndIsolate && initialValue !== undefined) {
        setKVStore(initialValue);
      }

      if (trackAndIsolate && initialValue === undefined) {
        const kvVal = kvStore.get(key);
        if (kvVal) {
          setState(kvVal);
        }
      }
    };

    useEffect(() => {
      setupScope();
      setupListeners();
      setValuesForScopedKvState();

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
        console.debug("setting scope and value", key);
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
