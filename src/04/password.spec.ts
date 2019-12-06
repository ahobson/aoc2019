import { isMatchingPassword } from "./password";

describe("password", () => {
  it("should report matches", () => {
    expect(isMatchingPassword("111111")).toBeTruthy();
    expect(isMatchingPassword("223450")).toBeFalsy();
    expect(isMatchingPassword("123789")).toBeFalsy();
  });
});
