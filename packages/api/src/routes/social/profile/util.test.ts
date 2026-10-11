import { describe, expect, test } from "vitest";
import { withAvatarUrl } from "./util";

describe("util.ts", () => {
  test("returns object with avatarUrl", () => {
    const profile = {
      username: "test",
      avatarKey: "test-key",
    };

    const expectedProfile = {
      username: "test",
      avatarUrl: "https://cdn.example.com/test-key",
    };

    expect(withAvatarUrl(profile)).toEqual(expectedProfile);
  });

  test("doesn't return avatarKey", () => {
    const profile = {
      avatarKey: "test-key",
    };

    expect(withAvatarUrl(profile)).not.toHaveProperty("avatarKey");
  });

  test("returns null avatarUrl when avatarKey is null", () => {
    const profile = {
      username: "test",
      avatarKey: null,
    };

    expect(withAvatarUrl(profile).avatarUrl).toBe(null);
  });

  test("returns null avatarUrl when avatarKey is empty string", () => {
    const profile = {
      username: "test",
      avatarKey: "",
    };

    expect(withAvatarUrl(profile).avatarUrl).toBe(null);
  });
});
