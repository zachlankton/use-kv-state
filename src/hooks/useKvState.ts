import { useState, useEffect } from "react";

interface KVStore {
  [key: PropertyKey]: any;
}

interface Listeners {
  [key: PropertyKey]: ((value: any) => void)[];
}

interface KvStoreOptions {
  persistent?: boolean;
  localStorageKey?: string;
}

export const createKvStore = (
  { persistent, localStorageKey }: KvStoreOptions = {
    persistent: false,
    localStorageKey: "usePersistentKvStateDefaultLocalStorageKey",
  }
) => {
  const kvStore = new Map();
  const listeners = new Map();

  const useKVStore = <K extends PropertyKey, T>(
    key: K,
    initialValue: T
  ): [T, (newValue: T) => void] => {
    const lsKey = `${localStorageKey}.${key.toString()}`;

    const [state, setState] = useState<T>(() => {
      if (kvStore.has(key)) {
        return kvStore.get(key);
      }

      if (persistent && localStorage.getItem(lsKey)) {
        kvStore.set(key, JSON.parse(localStorage.getItem(lsKey) as string));
        return kvStore.get(key);
      }

      kvStore.set(key, initialValue);
      persistent && localStorage.setItem(lsKey, JSON.stringify(initialValue));

      return kvStore.get(key);
    });

    useEffect(() => {
      if (!listeners.has(key)) {
        listeners.set(key, []);
      }
      listeners.get(key).push(setState);

      return () => {
        listeners.set(
          key,
          listeners.get(key).filter((listener: any) => listener !== setState)
        );
      };
    }, [key]);

    const setKVStore = (newValue: T) => {
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
