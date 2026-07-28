import type { ComponentType } from "react";
import GoogleRewardsScenario, {
  SLUG as googleRewardsSlug,
} from "./google-rewards/google-rewards";

/**
 * Maps a scenario's slug to its own dedicated detail page, so each scenario
 * can be developed independently with as much custom detail as it needs.
 * Slugs without an entry here fall back to the generic ScenarioDetail page.
 */
export const scenarioPages: Record<string, ComponentType> = {
  [googleRewardsSlug]: GoogleRewardsScenario,
};
