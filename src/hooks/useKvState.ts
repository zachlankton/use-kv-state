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
  const kvStore: KVStore = {};
  const listeners: Listeners = {};

  const useKVStore = <K extends PropertyKey, T>(
    key: K,
    initialValue: T
  ): [T, (newValue: T) => void] => {
    const lsKey = `${localStorageKey}.${key.toString()}`;

    const [state, setState] = useState<T>(() => {
      if (kvStore.hasOwnProperty(key)) {
        return kvStore[key];
      }

      if (persistent && localStorage.getItem(lsKey)) {
        kvStore[key] = JSON.parse(localStorage.getItem(lsKey) as string);
        return kvStore[key];
      }

      kvStore[key] = initialValue;
      persistent && localStorage.setItem(lsKey, JSON.stringify(initialValue));

      return kvStore[key];
    });

    useEffect(() => {
      if (!listeners[key]) {
        listeners[key] = [];
      }
      listeners[key].push(setState);

      return () => {
        listeners[key] = listeners[key].filter(
          (listener) => listener !== setState
        );
      };
    }, [key]);

    const setKVStore = (newValue: T) => {
      kvStore[key] = newValue;
      persistent && localStorage.setItem(lsKey, JSON.stringify(newValue));
      listeners[key].forEach((listener) => listener(newValue));
    };

    return [state, setKVStore];
  };

  return useKVStore;
};

export const useKvState = createKvStore();
export const usePersistentKvState = createKvStore({ persistent: true });
