import "@testing-library/jest-dom"

import { expect, test } from 'vitest'

import { render, screen } from "@testing-library/react"
import user from '@testing-library/user-event'

import { createStore, useStore } from "./index"
import { RootScope } from "./root-scope"
import { Suspense } from "react"

const textStore = createStore (() => {
  return "a"
})

textStore.displayName = "textStore"

const textStore1 = createStore (() => {
  return useStore (textStore)
})

textStore1.displayName = "textStore1"

const textStore2 = createStore (() => {
  return useStore (textStore1)
})

textStore2.displayName = "textStore2"

const Text = () => {
  const text = useStore (textStore2)
  return <div>{text}</div>
}

const App = () => (
  <RootScope>
    <article>
      <Suspense fallback="Loading...">
        <Text />
      </Suspense>
    </article>
  </RootScope>
)

test ("root doesn't cause a crash", async () => {
  render (<App />)
  expect (screen.queryByText ("Loading...")).toBeInTheDocument ()

  const el = await screen.findByText ("a")
  expect (el).toBeInTheDocument ()
})
