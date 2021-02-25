import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders Hello", async () => {
  render(<App />);
  const hElement = await screen.findByText(/Hello!/i);
  expect(hElement).toBeInTheDocument();
});
