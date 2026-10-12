import { moveRow } from "./positions";

const positions = { a: 0, b: 1, c: 2, d: 3 };

describe("moveRow", () => {
  it("shifts the rows between up when a row moves down", () => {
    expect(moveRow(positions, "a", 0, 2)).toEqual({ a: 2, b: 0, c: 1, d: 3 });
  });

  it("shifts the rows between down when a row moves up", () => {
    expect(moveRow(positions, "d", 3, 1)).toEqual({ a: 0, b: 2, c: 3, d: 1 });
  });
});
