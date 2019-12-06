import { isMatchingPassword } from "./password";

describe("password", () => {
  it("should report matches", () => {
    expect(isMatchingPassword("111111")).toBeFalsy();
    expect(isMatchingPassword("223450")).toBeFalsy();
    expect(isMatchingPassword("123789")).toBeFalsy();

    expect(isMatchingPassword("112233")).toBeTruthy();
    expect(isMatchingPassword("123444")).toBeFalsy();
    expect(isMatchingPassword("111122")).toBeTruthy();
    expect(isMatchingPassword("111123")).toBeFalsy();
    expect(isMatchingPassword("112222")).toBeTruthy();
    expect(isMatchingPassword("112233")).toBeTruthy();
  });
});
