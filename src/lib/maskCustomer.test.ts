import { describe, expect, it } from "vitest";
import { maskLastName, maskPhone, staffCustomerName } from "./maskCustomer";

describe("maskPhone", () => {
  it("keeps only the last 4 digits", () => {
    expect(maskPhone("05334108871")).toBe("****-***-8871");
  });

  it("ignores spaces and a country prefix", () => {
    expect(maskPhone("+90 533 410 88 71")).toBe("****-***-8871");
  });

  it("returns empty when there are fewer than 4 digits", () => {
    expect(maskPhone(null)).toBe("");
    expect(maskPhone("12")).toBe("");
  });
});

describe("maskLastName", () => {
  it("shows the initial and a dot", () => {
    expect(maskLastName("Yakışır")).toBe("Y.");
  });

  it("uses Turkish casing for the initial", () => {
    expect(maskLastName("ışık")).toBe("I.");
    expect(maskLastName("ipek")).toBe("İ.");
  });

  it("returns empty when there is no surname", () => {
    expect(maskLastName(null)).toBe("");
    expect(maskLastName("  ")).toBe("");
  });
});

describe("staffCustomerName", () => {
  it("keeps the first name and masks the surname", () => {
    expect(staffCustomerName("Tarık", "Yakışır")).toBe("Tarık Y.");
  });
});
