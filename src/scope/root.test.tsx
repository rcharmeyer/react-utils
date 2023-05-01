import "@testing-library/jest-dom"

import { expect, test } from 'vitest'

import { act, render, screen } from "@testing-library/react"

import { createStore, useStore } from "./index"
import { RootScope } from "./root-scope"
import { Suspense } from "react"

const textStore = createStore (() => {
  return "a"
})

const textStore1 = createStore (() => {
  return useStore (textStore)
})

const textStore2 = createStore (() => {
  return useStore (textStore1)
})

const textStore3 = createStore (() => {
  return useStore (textStore2)
})

textStore.displayName = "textStore"
textStore1.displayName = "textStore1"
textStore2.displayName = "textStore2"
textStore3.displayName = "textStore3"

const TEXT_STORE = textStore3

const Text = () => {
  const text = useStore (TEXT_STORE)
  return <div>{text}</div>
}

function Loading () {
  return <div>Loading...</div>
}

const App = () => (
  <RootScope>
    <article>
      <Suspense fallback={<Loading />}>
        <Text />
      </Suspense>
    </article>
  </RootScope>
)

beforeEach (() => {
  act (() => {
    const { rerender } = render (<App />)
    rerender (<App />)
  })
})

test ("show loading (sadly)", async () => {
  expect (screen.queryByText ("Loading...")).toBeInTheDocument ()
})

test ("root doesn't cause a crash", async () => {
  const el = await screen.findByText ("a")
  expect (el).toBeInTheDocument ()
})
