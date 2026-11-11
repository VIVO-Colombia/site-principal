import { spawnSync } from "node:child_process"
import path from "node:path"
import { describe, expect, it } from "vitest"

const script = path.resolve(__dirname, "../supabase/tests/run-integration.sh")

describe("supabase sql integration", () => {
  it("passes against an isolated local database with two users and mixed billing states", () => {
    const result = spawnSync("bash", [script], {
      encoding: "utf8",
      env: { ...process.env, PLANEADOR_USE_LOCAL_PG: "1" },
    })

    if (result.status === 2) {
      expect(result.stdout + result.stderr).toMatch(/SKIP/)
      return
    }

    if (result.status !== 0) {
      throw new Error(
        `SQL integration failed (exit ${result.status}):\n${result.stdout}\n${result.stderr}`
      )
    }

    expect(result.stdout).toContain("SQL integration tests passed")
    expect(result.stdout + result.stderr).toContain("ALL INTEGRATION CHECKS PASSED")
  })
})
