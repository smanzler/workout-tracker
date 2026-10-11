import { defaultWorkoutName } from "./workout-name";

const at = (hours: number, minutes = 0) => new Date(2026, 9, 5, hours, minutes);

describe("defaultWorkoutName", () => {
  it("names the workout after the time of day", () => {
    expect(defaultWorkoutName(at(4, 59))).toBe("Night Workout");
    expect(defaultWorkoutName(at(5))).toBe("Morning Workout");
    expect(defaultWorkoutName(at(11, 59))).toBe("Morning Workout");
    expect(defaultWorkoutName(at(12))).toBe("Afternoon Workout");
    expect(defaultWorkoutName(at(17))).toBe("Evening Workout");
    expect(defaultWorkoutName(at(21))).toBe("Night Workout");
    expect(defaultWorkoutName(at(23, 59))).toBe("Night Workout");
  });
});
