import { memoize } from "lodash-es"
import { Scope, Store } from "./types"
import { useLowestScopeIn, useScopeExists } from "./scopes-context"
import { useContext } from "react"
import { useInternalStore } from "./internal-store"
import { RootScope } from "./root-scope"

export function createStore <T> (hook: () => T, scopes?: Scope[]): Store<T> {
  scopes ??= []
  const copyOfScopes = [...scopes]

  return {
    get hook () {
      return hook
    },
    get scopes () {
      return copyOfScopes
    }
  }
}

export function useStore <T> (store: Store <T>): T {
  const inRoot = useScopeExists (RootScope)
  if (!inRoot) throw new Error ("useStore must be called within the context of the RootScope")

  const scope = useLowestScopeIn (store.scopes) ?? RootScope

  const getStoreInstance = useContext (scope.context)
  const { result, thrown } = useInternalStore (getStoreInstance (store.hook))

  if (thrown) throw thrown
  return result
}
