import "@testing-library/jest-dom"

import { useMemo, useState } from "react"
import { beforeEach, expect, test } from 'vitest'

import { render, screen } from "@testing-library/react"
import user from '@testing-library/user-event'

import { createProvider } from "./create-provider"
import { useEvent } from "../hooks"
import { useStruct } from "../hooks"

const [ CounterProvider, useCountState ] = createProvider (() => {
  const [ count, setCount ] = useState (0)

  const increment = useEvent (() => {
    setCount (count + 1)
  })

  return useStruct ({ count, increment })
})

function Counter (props: {
  testId: string,
}) {
  const { count, increment } = useCountState ()

  const buttonId = `${props.testId}-button`
  return (
    <div data-testid={props.testId}>
      <span>{count}</span>
      <button data-testid={buttonId} onClick={increment}>+</button>
    </div>
  )
}

function App () {
  return (
    <article>
      <CounterProvider>
        <Counter testId="alpha" />
        <Counter testId="bravo" />
      </CounterProvider>
      <CounterProvider>
        <Counter testId="gamma" />
        <Counter testId="omega" />
      </CounterProvider>
    </article>
  )
}

function testCounter (key: string, expected: string) {
  test (`${key} was incremented ${expected} times`, () => {
    expect (screen.getByTestId (key)).toHaveTextContent (expected)
  })
}

beforeEach (async () => {
  render (<App />)
  await user.click (screen.getByTestId ("alpha-button"))
})

// assert
testCounter ("alpha", "1")
testCounter ("bravo", "1")
testCounter ("gamma", "0")
testCounter ("omega", "0")
