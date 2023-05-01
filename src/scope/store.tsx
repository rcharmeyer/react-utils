import { InternalStore, Scope, Snapshot, Store } from "./types"
import { useLowestScopeIn, useScopeExists } from "./scopes-context"
import { useContext } from "react"
import { createInternalStore, useInternalStore } from "./internal-store"
import { RootScope } from "./root-scope"
import { readPromise } from "../async/read-promise"
import { useInitial } from "../hooks"

export type Scopable = Scope | { scopes: Scope[] }

export function asScopable <T> (res: T, scopes?: Scopable[]) {
  scopes ??= []
  const resolvedScopes = scopes
    .map ((s: any) => s.scopes ? s.scopes : [ s ])
    .flat ()

  Object.defineProperty (res, "scopes", {
    get () {
      return resolvedScopes
    }
  })

  return res as T & {
    scopes: Scope[]
  }
}

export function createStore <T> (hook: () => T, scopes?: Scopable[]): Store<T> {
  const res = {
    get hook () {
      return hook
    }
  }
  return asScopable (res, scopes)
}

function useInternalContext <T> (store: Store<T>) {
  const inRoot = useScopeExists (RootScope)
  if (!inRoot) throw new Error ("useStore must be called within the context of the RootScope")

  const scope = useLowestScopeIn (store.scopes) ?? RootScope

  return useContext (scope.Context)
}

function useStorePromise <T> (store: Store<T>) {
  const getStoreInstance = useInternalContext (store)
  return getStoreInstance (store)
}

function useStoreInstance <T> (store: Store <T>) {
  const promise = useStorePromise (store)
  return readPromise (promise)
}

export function useStore <T> (store: Store <T>): T {
  const instance = useStoreInstance (store)
  const { result, thrown } = useInternalStore (instance)

  if (thrown) throw thrown
  return result
}

export function useStorePreload <T> (store: Store <T>) {
  useStorePromise (store) // don't read the promise
}

export function useStoreLazy <T> (store: Store <T>, fallback: T): T {
  const promise = useStorePromise (store)

  const getInstance = useInitial <() => InternalStore <Snapshot>> (() => {
    let cached: InternalStore <Snapshot> | undefined
    return () => {
      if (cached) return cached
      try {
        return readPromise (promise)
      }
      catch (thrown) {
        if (! (thrown instanceof Promise)) throw thrown

        cached = createInternalStore <Snapshot> ({ result: fallback })
        thrown.then (cached.write)
        return cached
      }
    }
  })
  
  const { result, thrown } = useInternalStore (getInstance ())

  if (thrown) throw thrown
  return result
}
