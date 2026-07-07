import { describe, expect, it } from "vitest";
import {
  RECORD_TYPES,
  convertWeightToKg,
  formatTimeInput,
  getBestRecordIndex,
  recordNumericValue,
  secondsToTime,
  sortRecords,
  timeToSeconds,
} from "../helpers";
import type { WorkoutRecord } from "../../types/records";

const time = (v: string, date = "2026-01-01"): WorkoutRecord => ({
  workout: "Murph",
  recordType: RECORD_TYPES.TIME,
  recordValue: v,
  date,
});

const weight = (v: string, date = "2026-01-01"): WorkoutRecord => ({
  workout: "Deadlift",
  recordType: RECORD_TYPES.WEIGHT,
  recordValue: v,
  date,
});

describe("timeToSeconds", () => {
  it("parses HH:MM:SS", () => expect(timeToSeconds("01:02:03")).toBe(3723));
  it("parses MM:SS", () => expect(timeToSeconds("45:30")).toBe(2730));
  it("parses SS", () => expect(timeToSeconds("59")).toBe(59));
  it("returns NaN on garbage", () => expect(timeToSeconds("ab:cd")).toBeNaN());
});

describe("secondsToTime", () => {
  it("formats under 1h as MM:SS", () => expect(secondsToTime(2730)).toBe("45:30"));
  it("formats over 1h as HH:MM:SS", () => expect(secondsToTime(3723)).toBe("01:02:03"));
});

describe("formatTimeInput", () => {
  it("masks progressively", () => {
    expect(formatTimeInput("12")).toBe("12");
    expect(formatTimeInput("1234")).toBe("12:34");
    expect(formatTimeInput("123456")).toBe("12:34:56");
  });
});

describe("convertWeightToKg", () => {
  it("keeps kg", () => expect(convertWeightToKg("100", "KG")).toBe(100));
  it("converts lb", () => expect(convertWeightToKg("100", "LB")).toBeCloseTo(45.3592));
});

describe("sortRecords", () => {
  it("does not mutate input", () => {
    const input = [time("50:00"), time("40:00")];
    const copy = [...input];
    sortRecords(input);
    expect(input).toEqual(copy);
  });

  it("sorts TIME ascending numerically (9:30 beats 10:30)", () => {
    const sorted = sortRecords([time("10:30"), time("09:30")]);
    expect(sorted[0].recordValue).toBe("09:30");
  });

  it("sorts WEIGHT descending with mixed units", () => {
    const sorted = sortRecords([weight("100 KG"), weight("300 LB")]);
    expect(sorted[0].recordValue).toBe("300 LB"); // ~136 kg
  });

  it("sorts by date when requested", () => {
    const sorted = sortRecords(
      [time("10:00", "2026-02-01"), time("10:00", "2026-01-01")],
      true
    );
    expect(sorted[0].date).toBe("2026-01-01");
  });
});

describe("getBestRecordIndex", () => {
  it("returns -1 for empty", () => expect(getBestRecordIndex([])).toBe(-1));
  it("finds fastest time in original order", () => {
    const records = [time("50:00"), time("39:00"), time("45:00")];
    expect(getBestRecordIndex(records)).toBe(1);
  });
});

describe("recordNumericValue", () => {
  it("TIME to seconds", () => expect(recordNumericValue(time("01:00:00"))).toBe(3600));
  it("WEIGHT to kg", () => expect(recordNumericValue(weight("220 LB"))).toBeCloseTo(99.79, 1));
});
