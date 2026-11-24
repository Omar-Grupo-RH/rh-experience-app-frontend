import { describe, it, expect } from "vitest";
import { generarEstrellas } from "@/utils/generateStars";

describe("generarEstrellas", () => {
  it("genera estrellas llenas según la calificación", () => {
    expect(generarEstrellas(0)).toBe("☆☆☆☆☆");
    expect(generarEstrellas(1)).toBe("★☆☆☆☆");
    expect(generarEstrellas(3)).toBe("★★★☆☆");
    expect(generarEstrellas(5)).toBe("★★★★★");
  });

  it("siempre devuelve 5 caracteres", () => {
    for (let r = 0; r <= 5; r++) {
      expect([...generarEstrellas(r)]).toHaveLength(5);
    }
  });
});
