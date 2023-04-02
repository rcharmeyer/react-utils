import { memoize } from "lodash-es"
import {
  createStore, 
  Scope, 
  Store, 
  useStore,
} from "../scope"

type Func = (...args: any[]) => any

export function createStoreFamily <T extends Func> (hook: T, deps?: Scope[]) {
  return memoize ((...args: Parameters <T>) => {
    const res = createStore (() => hook (...args), deps)
    return res as Store <ReturnType <T>>
  })
}

export function hoist <T extends Func> (hook: T, deps?: Scope[]) {
  const storeFamily = createStoreFamily <T> (hook, deps)
  return (...args: Parameters <T>): ReturnType <T> => {
    const store = storeFamily (...args)
    return useStore (store)
  }
}
