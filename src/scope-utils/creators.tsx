import { memoize } from "lodash-es"
import {
  createStore, 
  Scope, 
  Store, 
  useStore,
} from "../scope"

type Func = (...args: any[]) => any

function withScopes <T extends Func> (func: T, scopes: Scope[]) {
  Object.defineProperty (func, "scopes", {
    get () {
      return scopes
    }
  })

  return func as T & {
    scopes: Scope[]
  }
}

export function createStoreFamily <T extends Func> (hook: T, scopes?: Scope[]) {
  scopes ??= []

  const res = memoize ((...args: Parameters <T>) => {
    const res = createStore (() => hook (...args), scopes)
    return res as Store <ReturnType <T>>
  })

  return withScopes (res, scopes)
}

export function hoist <T extends Func> (hook: T, scopes?: Scope[]) {
  scopes ??= []

  const family = createStoreFamily <T> (hook, scopes)
  const res = (...args: Parameters <T>) => {
    const store = family (...args)
    return useStore (store)
  }

  return withScopes (res, scopes)
}
