import React, { createContext, PropsWithChildren, useContext, useMemo } from "react"
import { Scope } from "./types"

const ScopesContext = createContext <Scope[]> ([])
ScopesContext.displayName = "ScopesContext"

export function ScopeProvider (props: PropsWithChildren <{ scope: Scope }>) {
  const scopes = useContext (ScopesContext)
  
  const value = useMemo (() => {
    return [ props.scope, ...scopes ]
  }, [ props.scope, scopes ])
  
  return (
    <ScopesContext.Provider value={value}>
      {props.children}
    </ScopesContext.Provider>
  )
}

/**
 * @param scope - The scope that is expected
 * @returns if the scope exists
 * 
 * @example
 * ```js
 * const CounterScope = createScope ()
 * 
 * function useAssertCounterScopeExists () {
 *   const exists = useScopeExists (CounterScope)
 *   if (!exists) throw new Error ("CounterScope does not exist")
 * }
 * 
 * // useCountState is only valid within CounterScope
 * const useCountState = hoist (() => {
 *   useAssertCounterScopeExists ()
 *   // ...
 * }, [ CounterScope ])
 * ```
 */
export function useScopeExists (scope: Scope) {
  const scopes = useContext (ScopesContext)
  return scopes.includes (scope)
}

export function useLowestScopeIn (consumerScopes: Scope[]) {
  const ancestorScopes = useContext (ScopesContext)

  return useMemo (() => {
    return ancestorScopes.find ((s) => consumerScopes.includes (s))
  }, [ ancestorScopes, consumerScopes ])
}
