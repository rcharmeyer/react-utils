import { PropsWithChildren, createContext, memo, useContext } from "react"

type Func = (arg: any) => any

export function createProvider <T, P = {}> (hook: (arg: P) => T) {
  const context = createContext <T> (null as any)
  const ContextProvider = memo (context.Provider)

  const Provider = ({
    children,
    ...props
  }: PropsWithChildren <P>) => {
    const value = hook (props as P)
    return (
      <ContextProvider value={value}>
        {children}
      </ContextProvider>
    )
  }

  const useInternalContext = () => useContext (context)

  return [ Provider, useInternalContext ] as const
}
