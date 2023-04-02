import "@testing-library/jest-dom"

import { useMemo, useState } from "react"
import { beforeEach, expect, test } from 'vitest'

import { render, screen } from "@testing-library/react"
import user from '@testing-library/user-event'

import { createScope, hoist } from "./index"
import { useEvent } from "../hooks"
import { useStruct } from "../hooks"

const CounterScope = createScope ()

const useCountState = hoist (() => {
  const [ count, setCount ] = useState (0)

  const increment = useEvent (() => {
    setCount (count + 1)
  })

  return useStruct ({ count, increment })
}, [ CounterScope ])

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

const App = () => (
  <article>
    <CounterScope>
      <Counter testId="alpha" />
      <Counter testId="bravo" />
    </CounterScope>
    <CounterScope>
      <Counter testId="gamma" />
      <Counter testId="omega" />
    </CounterScope>
  </article>
)

function testCounter (key: string, expected: string) {
  test (`${key} was incremented ${expected} times`, () => {
    expect (screen.getByTestId (key)).toHaveTextContent (expected)
  })
}

beforeEach (async () => {
  render (<App />)
  const button = await screen.findByTestId ("alpha-button")
  await user.click (button)
})

// assert
testCounter ("alpha", "1")
testCounter ("bravo", "1")
testCounter ("gamma", "0")
testCounter ("omega", "0")
