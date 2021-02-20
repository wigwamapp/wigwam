import React from "react";
import { render } from "@testing-library/react";
import { expect } from "chai";
import App from "./App";

describe("<App>", () => {
  it("renders fine", () => {
    const { getByText } = render(<App />);
    const hElement = getByText(/Hello!/i);
    expect(document.body.contains(hElement));
  });
});
