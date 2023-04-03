import { memoize } from "lodash-es"
import {
  asScopable,
  createStore, 
  Scope, 
  Store, 
  useStore,
} from "../scope"
import { Scopable } from "../scope"

type Func = (...args: any[]) => any

export function createStoreFamily <T extends Func> (hook: T, scopes?: Scopable[]) {
  const res = memoize ((...args: Parameters <T>) => {
    const res = createStore (() => hook (...args), scopes)
    return res as Store <ReturnType <T>>
  })

  return asScopable (res, scopes)
}

export function hoist <T extends Func> (hook: T, scopes?: Scope[]) {
  const family = createStoreFamily <T> (hook, scopes)
  const res = (...args: Parameters <T>) => {
    const store = family (...args)
    return useStore (store)
  }

  return asScopable (res, scopes)
}
