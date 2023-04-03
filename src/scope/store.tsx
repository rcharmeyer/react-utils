import { memoize } from "lodash-es"
import { Scope, Store } from "./types"
import { useLowestScopeIn, useScopeExists } from "./scopes-context"
import { useContext } from "react"
import { useInternalStore } from "./internal-store"
import { RootScope } from "./root-scope"

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

export function useStore <T> (store: Store <T>): T {
  const inRoot = useScopeExists (RootScope)
  if (!inRoot) throw new Error ("useStore must be called within the context of the RootScope")

  const scope = useLowestScopeIn (store.scopes) ?? RootScope

  const getStoreInstance = useContext (scope.Context)
  const { result, thrown } = useInternalStore (getStoreInstance (store))

  if (thrown) throw thrown
  return result
}
