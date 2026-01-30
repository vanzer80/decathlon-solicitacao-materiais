import { describe, expect, it } from "vitest";
import { generateRequestId, isValidWebhookResponse, isHtmlResponse } from "../shared/utils";

describe("generateRequestId", () => {
  it("should generate a valid Request_ID in format YYYYMMDD-HHMMSS-6CHARS", () => {
    const requestId = generateRequestId();
    
    // Verifica o padrão YYYYMMDD-HHMMSS-6CHARS
    const pattern = /^\d{8}-\d{6}-[A-Z0-9]{6}$/;
    expect(requestId).toMatch(pattern);
  });

  it("should generate unique Request_IDs", () => {
    const id1 = generateRequestId();
    const id2 = generateRequestId();
    
    expect(id1).not.toBe(id2);
  });

  it("should have valid date components", () => {
    const requestId = generateRequestId();
    const [dateTime] = requestId.split("-");
    const [year, month, day] = [
      dateTime.substring(0, 4),
      dateTime.substring(4, 6),
      dateTime.substring(6, 8),
    ];

    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);

    expect(yearNum).toBeGreaterThanOrEqual(2020);
    expect(monthNum).toBeGreaterThanOrEqual(1);
    expect(monthNum).toBeLessThanOrEqual(12);
    expect(dayNum).toBeGreaterThanOrEqual(1);
    expect(dayNum).toBeLessThanOrEqual(31);
  });
});

describe("isValidWebhookResponse", () => {
  it("should return true for valid response with ok: true", () => {
    expect(isValidWebhookResponse({ ok: true })).toBe(true);
    expect(isValidWebhookResponse({ ok: true, message: "Success" })).toBe(true);
  });

  it("should return false for response with ok: false", () => {
    expect(isValidWebhookResponse({ ok: false })).toBe(false);
  });

  it("should return false for non-object responses", () => {
    expect(isValidWebhookResponse(null)).toBe(false);
    expect(isValidWebhookResponse(undefined)).toBe(false);
    expect(isValidWebhookResponse("string")).toBe(false);
    expect(isValidWebhookResponse(123)).toBe(false);
  });

  it("should return false for object without ok property", () => {
    expect(isValidWebhookResponse({})).toBe(false);
    expect(isValidWebhookResponse({ message: "Success" })).toBe(false);
  });
});

describe("isHtmlResponse", () => {
  it("should detect HTML responses", () => {
    expect(isHtmlResponse("<!DOCTYPE html>")).toBe(true);
    expect(isHtmlResponse("<html>")).toBe(true);
    expect(isHtmlResponse("  <!DOCTYPE html>")).toBe(true);
    expect(isHtmlResponse("  <html>")).toBe(true);
  });

  it("should return false for JSON responses", () => {
    expect(isHtmlResponse('{"ok": true}')).toBe(false);
    expect(isHtmlResponse('{"error": "not found"}')).toBe(false);
  });

  it("should return false for plain text", () => {
    expect(isHtmlResponse("Success")).toBe(false);
    expect(isHtmlResponse("Error message")).toBe(false);
  });
});
