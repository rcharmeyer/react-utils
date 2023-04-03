import { ComponentType, PropsWithChildren } from "react"

type Func = (...args: any[]) => any

export type Snapshot = {
  result?: any,
  thrown?: Error|Promise<any>,
}

export type InternalStore <T> = {
  subscribe: (callback: VoidFunction) => VoidFunction,
  read: () => T,
  write: (arg: T) => void,
}

export type StoreBuilder = (func: Func) => InternalStore <Snapshot>

export type Scope = ComponentType <PropsWithChildren> & {
  Context: React.Context <StoreBuilder>,
}

export type Store <T> = {
  hook: () => T,
  scopes: Scope[],
}
