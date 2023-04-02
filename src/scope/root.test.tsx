import "@testing-library/jest-dom"

import { expect, test } from 'vitest'

import { render, screen } from "@testing-library/react"
import user from '@testing-library/user-event'

import { createStore, useStore } from "./index"
import { RootScope } from "./root-scope"

const textStore = createStore (() => {
  return "a"
})

const Text = () => {
  const text = useStore (textStore)
  return <div>{text}</div>
}

const App = () => (
  <RootScope>
    <Text />
  </RootScope>
)

test ("root doesn't cause a crash", async () => {
  render (<App />)
  const el = await screen.findByText ("a")
  expect (el).toBeInTheDocument ()
})
