import { describe, expect, it } from "vitest";

import { gradeForQes } from "../grade.js";

describe("gradeForQes", () => {
  it.each([
    [0, "A"],
    [20, "A"],
    [21, "B"],
    [40, "B"],
    [41, "C"],
    [60, "C"],
    [61, "D"],
    [80, "D"],
    [81, "E"],
    [100, "E"],
  ] as const)("maps %i to grade %s", (qes, grade) => {
    expect(gradeForQes(qes)).toBe(grade);
  });
});
