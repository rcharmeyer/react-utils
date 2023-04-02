import { createContext, memo, useContext } from "react"

type Func = (...args: any) => any

export function createProvider <T extends Func> (hook: T) {
  const context = createContext <ReturnType <T>> (null as any)
  const ContextProvider = memo (context.Provider)

  const Provider = (props: { children: React.ReactNode }) => {
    const value = hook()
    return (
      <ContextProvider value={value}>
        {props.children}
      </ContextProvider>
    )
  }

  const useInternalContext = () => useContext (context)

  return [ Provider, useInternalContext ] as const
}
