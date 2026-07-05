import type { Grade } from "./types.js";

export function gradeForQes(qes: number): Grade {
  if (qes <= 20) {
    return "A";
  }

  if (qes <= 40) {
    return "B";
  }

  if (qes <= 60) {
    return "C";
  }

  if (qes <= 80) {
    return "D";
  }

  return "E";
}
