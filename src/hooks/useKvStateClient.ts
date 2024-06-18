"use client";

import { useState, useEffect } from "react";

function importNextCookies() {
  if (typeof window !== "undefined") return null;

  try {
    return require("next/headers").cookies;
  } catch (error) {
    return null;
  }
}

const nextCookies = importNextCookies();

function getClientCookieValue(key: string, defaultValue: any) {
  if (typeof window === "undefined") return defaultValue;
  const cookies = document.cookie.split("; ");
  const cookie = cookies.find((cookie) => cookie.startsWith(`${key}=`));
  if (!cookie) return defaultValue;
  return JSON.parse(cookie.split("=")[1]);
}

interface KvStoreOptions {
  persistent?: boolean;
  localStorageKey?: string;
  trackAndIsolate?: boolean;
  setCookies?: boolean;
}

export const createKvStore = (
  {
    persistent,
    localStorageKey,
    trackAndIsolate,
    setCookies,
  }: KvStoreOptions = {
    persistent: false,
    localStorageKey: "usePersistentKvStateDefaultLocalStorageKey",
    trackAndIsolate: false,
    setCookies: false,
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
    const lsKey = `${localStorageKey}-${key.toString()}`;

    const setLocalStorageAndOrCookies = (key: string, value: any) => {
      if (persistent && typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(key, JSON.stringify(value));
      }

      if (setCookies && typeof window !== "undefined") {
        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 20);
        const expires = expirationDate.toUTCString();
        document.cookie = `${key}=${value}; expires=${expires}; path=/; SameSite=Lax`;
      }
    };

    if (trackAndIsolate && initialValue !== undefined && thisScope) {
      if (listeners.has(thisScope) && listeners.get(thisScope).length > 1) {
        scopeTracking.delete(propKey);
      } else {
        scopeTracking.set(propKey, thisScope);
      }
    }

    const [state, setState] = useState<T>(() => {
      if (kvStore.has(key) && !persistent) {
        return kvStore.get(key);
      }

      if (setCookies && nextCookies && nextCookies().has(lsKey)) {
        return JSON.parse(nextCookies().get(lsKey).value) || initialValue;
      }

      if (
        persistent &&
        typeof window !== "undefined" &&
        window.localStorage &&
        localStorage.getItem(lsKey)
      ) {
        const parsedVal = JSON.parse(localStorage.getItem(lsKey) as string);
        const cookieValue = getClientCookieValue(lsKey, initialValue);

        if (setCookies) {
          kvStore.set(key, cookieValue);
          return cookieValue;
        }

        kvStore.set(key, parsedVal);
        return initialValue;
      }

      if (trackAndIsolate) {
        return initialValue || "";
      }

      kvStore.set(key, initialValue);
      persistent &&
        typeof window !== "undefined" &&
        window.localStorage &&
        setLocalStorageAndOrCookies(lsKey, initialValue);

      return kvStore.get(key);
    });

    useEffect(() => {
      if (
        persistent &&
        typeof window !== "undefined" &&
        window.localStorage &&
        localStorage.getItem(lsKey)
      ) {
        const parsedVal = JSON.parse(localStorage.getItem(lsKey) as string);

        if (setCookies) {
          setLocalStorageAndOrCookies(lsKey, parsedVal);
        }
        kvStore.set(key, parsedVal);
        setState(kvStore.get(key));
      }
    }, []);

    const setupScope = () => {
      if (trackAndIsolate) {
        if (scopeTracking.has(propKey)) {
          if (thisScope) {
            key = thisScope;
          } else {
            key = scopeTracking.get(propKey);
          }

          setScope(key);
        } else {
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

        setScope(key);
      }
    };

    const cleanupScope = () => {
      if (trackAndIsolate && initialValue !== undefined) {
        scopeTracking.delete(propKey);
        kvStore.delete(key);
        listeners.delete(key);
      }
    };

    const setupListeners = () => {
      if (!listeners.has(key)) {
        listeners.set(key, []);
      }
      listeners.get(key).push(setState);
    };

    const cleanupListeners = () => {
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
      }

      if (!key) return;

      kvStore.set(key, newValue);
      persistent &&
        typeof window !== "undefined" &&
        window.localStorage &&
        setLocalStorageAndOrCookies(lsKey, newValue);

      listeners.get(key).forEach((listener: any) => listener(newValue));
    };

    return [state, setKVStore];
  };

  return useKVStore;
};

export const useKvState = createKvStore();

export const usePersistentKvState = createKvStore({
  persistent: true,
  localStorageKey: "usePersistentKvStateDefaultLocalStorageKey",
});

export const usePersistentKvCookies = createKvStore({
  persistent: true,
  localStorageKey: "usePersistentKvCookiesDefaultLocalStorageKey",
  setCookies: true,
});

export const useScopedKvState = createKvStore({
  trackAndIsolate: true,
});
