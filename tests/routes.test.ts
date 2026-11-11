import { describe, expect, it } from "vitest"

import { isCorporateNavActive } from "../src/config/navigation"
import {
  isPlannerMarketingPath,
  marketingAnchors,
  publicRoutes,
} from "../src/config/routes"

describe("public routes", () => {
  it("keeps the group home at / and planner on its own path", () => {
    expect(publicRoutes.home).toBe("/")
    expect(publicRoutes.planner).toBe("/planner")
    expect(publicRoutes.transport).toBe("/transporte")
    expect(publicRoutes.software).toBe("/software")
  })

  it("points planner marketing anchors at /planner", () => {
    expect(marketingAnchors.features).toBe("/planner#funcionalidades")
    expect(marketingAnchors.howItWorks).toBe("/planner#como-funciona")
    expect(marketingAnchors.faq).toBe("/planner#preguntas-frecuentes")
  })
})

describe("planner marketing paths", () => {
  it("treats planner and plans as planner context", () => {
    expect(isPlannerMarketingPath("/planner")).toBe(true)
    expect(isPlannerMarketingPath("/planes")).toBe(true)
    expect(isPlannerMarketingPath("/")).toBe(false)
    expect(isPlannerMarketingPath("/transporte")).toBe(false)
  })
})

describe("corporate navigation", () => {
  it("marks the active unit without treating / as planner", () => {
    expect(isCorporateNavActive("grupo", "/")).toBe(true)
    expect(isCorporateNavActive("planner", "/")).toBe(false)
    expect(isCorporateNavActive("planner", "/planner")).toBe(true)
    expect(isCorporateNavActive("planner", "/planes")).toBe(true)
    expect(isCorporateNavActive("transporte", "/transporte")).toBe(true)
    expect(isCorporateNavActive("software", "/software")).toBe(true)
  })
})
