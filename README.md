# react-utils
My library of React utilities.

## Hooks

## Scopes & Hoisting State

### Using `createStore`

```jsx
const AccordionScope = createScope ()

const openIdStore = createStore (() => {
  const [ openId, setOpenId ] = useState (null)
  return { openId, setOpenId }
}, [ AccordionScope ])

function AccordionItem ({ id, children }) {
  const { openId, setOpenId } = useStore (openIdStore)
  const open = openId === id
  const toggleOpen = useEvent (() => setOpenId (open ? null : id))

  return (
    <Expandable open={open} onToggle={toggleOpen}>
      {children}
    </Expandable>
  )
}
```

### Adding `createStoreFamily`

```jsx
const AccordionScope = createScope ()

const openIdStore = createStore (() => {
  const [ openId, setOpenId ] = useState (null)
  return { openId, setOpenId }
}, [ AccordionScope ])

const openStoreBy = createStoreFamily ((id) => {
  const { openId, setOpenId } = useStore (openIdStore)
  const open = openId === id
  const toggleOpen = useEvent (() => setOpenId (open ? null : id))
  return { open, toggleOpen }
}, [ AccordionScope ])

function AccordionItem ({ id, children }) {
  const { open, toggleOpen } = useStore (openStoreBy (id))
  return (
    <Expandable open={open} onToggle={toggleOpen}>
      {children}
    </Expandable>
  )
}
```

### Using `hoist` instead of `create`

```jsx
const AccordionScope = createScope ()

const useOpenIdState = hoist (() => {
  const [ openId, setOpenId ] = useState (null)
  return { openId, setOpenId }
}, [ AccordionScope ])

const useOpenToggleBy = hoist ((id) => {
  const { openId, setOpenId } = useStore (openIdStore)
  const open = openId === id
  const toggleOpen = useEvent (() => setOpenId (open ? null : id))
  return { open, toggleOpen }
}, [ AccordionScope ])

function AccordionItem ({ id, children }) {
  const { open, toggleOpen } = useOpenToggleBy (id)
  return (
    <Expandable open={open} onToggle={toggleOpen}>
      {children}
    </Expandable>
  )
}
```

## Utilities

### `useEvent`

Based on this
[React RFC](https://github.com/reactjs/rfcs/blob/useevent/text/0000-useevent.md)
of the same name.

This hook is a lot like `useCallback` but it requires no deps because the
reference is always stable and always represents the latest callback. However,
unlike `useCallback` it does not support returning values or async functions.

```jsx
function Expandable ({ children }) {
  const [ active, setActive ] = useState (false)

  const toggleActive = useEvent (() => {
    setActive (!active)
  })

  // Button never re-renders, not possible with useCallback
  return <>
    <Button onClick={toggleActive}>
    {active && <div>{children}</div>}
  </>
}
```

### `useStruct`

```tsx
// with useStruct
function useTuple (a, b) {
  return useStruct ([ a, b ])
}

// without
function useTuple (a, b) {
  return useMemo (() => {
    return [a, b] as const
  }, [a, b])
}
```

### `useMemoShallow`

`useMemo` except it will also check for shallow equality of the return value.

```tsx
type Item = {
  id: string,
  tags: string[],
}

function useFilteredItems (items: Item[], tag: string) {
  return useMemoShallow (() => {
    return items.filter (item => item.tags.includes (tag))
  }, [ items, tag ])
}
```
