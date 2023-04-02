import "@testing-library/jest-dom"

import React, { Suspense, useState } from "react"
import { expect, test } from 'vitest'

import { render, screen } from "@testing-library/react"
import user from '@testing-library/user-event'

import { createLoader } from "./create-loader"

const timeout = (ms: number) => new Promise (resolve => setTimeout (resolve, ms))

const useLoadTitle = createLoader (async () => {
  await timeout (100)
  return "title"
})

function Title () {
  const title = useLoadTitle ()
  return <span>{title}</span>
}

function App () {
  const [ show, setShow ] = useState (false)
  const onClick = () => setShow (!show)

  const title = !show ? null : (
    <Suspense fallback="loading">
      <Title />
    </Suspense>
  )

  return (
    <Suspense>
      <article>
        <button type="button" onClick={onClick} />
        <h1>{title}</h1>
      </article>
    </Suspense>
  )
}

test ("no heading before click", async () => {
  // arrange
  render (<App />)

  // assert
  expect (screen.getByRole ("heading")).toHaveTextContent ("")
})

test ("heading says 'loading' after click", async () => {
  // arrange
  render (<App />)

  // act
  await user.click (screen.getByRole ("button"))
  await screen.findByRole ("heading")

  // assert
  expect (screen.queryByText ("loading")).toBeDefined()
  expect (screen.queryByText ("title")).toBeNull()
})

test ("heading says 'title' after first click", async () => {
  // arrange
  render (<App />)

  // act
  await user.click (screen.getByRole ("button"))
  await screen.findByRole ("heading")
  await screen.findByText ("title")

  // assert
  expect (screen.queryByText ("loading")).toBeNull()
  expect (screen.queryByText ("title")).toBeDefined()
})

test ("heading says 'title' after second click", async () => {
  // arrange
  render (<App />)

  // act
  await user.click (screen.getByRole ("button"))
  await screen.findByRole ("heading")
  await screen.findByText ("title")
  await user.click (screen.getByRole ("button"))

  // assert
  expect (screen.queryByText ("loading")).toBeNull()
  expect (screen.queryByText ("title")).toBeDefined()
})
