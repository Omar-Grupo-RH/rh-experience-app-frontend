import { describe, it, expect } from "vitest";
import { currencyFormat } from "@/utils/formatMoney";

describe("currencyFormat", () => {
  it("formatea cantidades como pesos mexicanos", () => {
    expect(currencyFormat(1500)).toBe("$1,500.00");
    expect(currencyFormat(0)).toBe("$0.00");
    expect(currencyFormat(999999.99)).toBe("$999,999.99");
  });

  it("redondea a dos decimales", () => {
    expect(currencyFormat(10.005)).toBe("$10.01");
    expect(currencyFormat(10.004)).toBe("$10.00");
  });

  it("maneja negativos (reembolsos/penalizaciones)", () => {
    expect(currencyFormat(-250)).toBe("-$250.00");
  });
});
