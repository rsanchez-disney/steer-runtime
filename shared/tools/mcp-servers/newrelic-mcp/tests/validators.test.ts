import { describe, it, expect } from "vitest";
import { validateNrqlQuery, sanitizeNrqlString } from "../src/utils/validators.js";

describe("validateNrqlQuery", () => {
    it("allows SELECT queries", () => {
        expect(validateNrqlQuery("SELECT count(*) FROM Transaction").valid).toBe(true);
    });

    it("allows FROM queries", () => {
        expect(validateNrqlQuery("FROM Transaction SELECT count(*)").valid).toBe(true);
    });

    it("allows complex SELECT with WHERE and FACET", () => {
        expect(
            validateNrqlQuery(
                "SELECT average(duration) FROM Transaction WHERE appName = 'MyApp' FACET name SINCE 1 hour ago",
            ).valid,
        ).toBe(true);
    });

    it("allows TIMESERIES queries", () => {
        expect(
            validateNrqlQuery("SELECT count(*) FROM Transaction TIMESERIES 1 minute").valid,
        ).toBe(true);
    });

    it("rejects DELETE", () => {
        const result = validateNrqlQuery("DELETE FROM Transaction");
        expect(result.valid).toBe(false);
        expect(result.error).toContain("forbidden");
    });

    it("rejects DROP", () => {
        const result = validateNrqlQuery("DROP TABLE users");
        expect(result.valid).toBe(false);
        expect(result.error).toContain("forbidden");
    });

    it("rejects INSERT", () => {
        const result = validateNrqlQuery("INSERT INTO Transaction VALUES (1, 2, 3)");
        expect(result.valid).toBe(false);
    });

    it("rejects UPDATE", () => {
        const result = validateNrqlQuery("UPDATE Transaction SET foo = 'bar'");
        expect(result.valid).toBe(false);
    });

    it("rejects CREATE", () => {
        const result = validateNrqlQuery("CREATE TABLE users");
        expect(result.valid).toBe(false);
    });

    it("rejects ALTER", () => {
        const result = validateNrqlQuery("ALTER TABLE users ADD COLUMN foo");
        expect(result.valid).toBe(false);
    });

    it("rejects queries not starting with SELECT/FROM", () => {
        const result = validateNrqlQuery("SHOW TABLES");
        expect(result.valid).toBe(false);
        expect(result.error).toContain("must start with SELECT or FROM");
    });

    it("rejects empty query", () => {
        const result = validateNrqlQuery("");
        expect(result.valid).toBe(false);
    });

    it("rejects whitespace-only query", () => {
        const result = validateNrqlQuery("   ");
        expect(result.valid).toBe(false);
    });

    it("handles case-insensitive SELECT", () => {
        expect(validateNrqlQuery("select count(*) from Transaction").valid).toBe(true);
        expect(validateNrqlQuery("Select Count(*) From Transaction").valid).toBe(true);
    });

    it("handles case-insensitive FROM", () => {
        expect(validateNrqlQuery("from Transaction select count(*)").valid).toBe(true);
    });

    it("detects mutation keywords mid-query", () => {
        // Attempt to inject DELETE via subquery-like syntax
        const result = validateNrqlQuery("SELECT * FROM Transaction WHERE DELETE = 1");
        expect(result.valid).toBe(false);
    });
});

describe("sanitizeNrqlString", () => {
    it("removes single quotes", () => {
        expect(sanitizeNrqlString("test'value")).toBe("testvalue");
        expect(sanitizeNrqlString("'test'")).toBe("test");
    });

    it("removes backslashes", () => {
        expect(sanitizeNrqlString("test\\value")).toBe("testvalue");
        expect(sanitizeNrqlString("\\\\")).toBe("");
    });

    it("replaces newlines with spaces", () => {
        expect(sanitizeNrqlString("test\nvalue")).toBe("test value");
        expect(sanitizeNrqlString("test\rvalue")).toBe("test value");
        expect(sanitizeNrqlString("test\r\nvalue")).toBe("test  value");
    });

    it("handles injection attempt: OR 1=1 --", () => {
        const malicious = "' OR 1=1 --";
        const sanitized = sanitizeNrqlString(malicious);
        expect(sanitized).toBe(" OR 1=1 --");
        expect(sanitized).not.toContain("'");
    });

    it("handles injection attempt: UNION SELECT", () => {
        const malicious = "test' UNION SELECT * FROM secrets --";
        const sanitized = sanitizeNrqlString(malicious);
        expect(sanitized).toBe("test UNION SELECT * FROM secrets --");
        expect(sanitized).not.toContain("'");
    });

    it("preserves safe characters", () => {
        expect(sanitizeNrqlString("MyApp-prod_v2.0")).toBe("MyApp-prod_v2.0");
        expect(sanitizeNrqlString("test@example.com")).toBe("test@example.com");
        expect(sanitizeNrqlString("Service (Production)")).toBe("Service (Production)");
    });

    it("handles empty string", () => {
        expect(sanitizeNrqlString("")).toBe("");
    });

    it("handles string with only dangerous characters", () => {
        expect(sanitizeNrqlString("'\\'\\")).toBe("");
    });
});
