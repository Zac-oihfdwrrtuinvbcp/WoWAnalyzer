import type Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import { EventType, GetRelatedEvents, HasTarget } from 'parser/core/Events';
import { encodeEventTargetString, encodeTargetString } from 'parser/shared/modules/Enemies';

import { AplTriggerEvent, Condition, tenseAlt } from 'parser/shared/metrics/apl/index';

type TargetOptions = {
  /**
   * Link relation (see `EventLinkNormalizer`) to use for determining
   * targets on untargeted debuff-applying spells.
   *
   * When present, overrides any targets the event has.
   */
  targetLinkRelation?: string;
};

function getTargets(event: AplTriggerEvent, targetLink?: string): string[] {
  if (targetLink) {
    return GetRelatedEvents(event, targetLink)
      .map(encodeEventTargetString)
      .filter((key): key is string => key !== null);
  } else if (HasTarget(event)) {
    return [encodeEventTargetString(event)!];
  } else {
    return [];
  }
}

/**
   The rule applies when the debuff `spell` is missing. The `optPandemic`
   parameter gives the ability to allow early refreshes to prevent a debuff
   dropping, but this will not *require* early refreshes.
 **/
export function tempDebuffMissing(
  spell: Spell,
  targetOptions?: TargetOptions,
): Condition<{ [key: string]: number } | null> {
  return {
    key: `debuffMissing-${spell.id}`,
    init: () => null,
    update: (state, event) => {
      switch (event.type) {
        case EventType.ApplyDebuff:
          if (event.ability.guid === spell.id) {
            const encodedTargetString = encodeTargetString(
              event.targetID,
              event.targetInstance ?? 0, // was 1
            );
            if (!state) {
              state = {};
            }
            state[encodedTargetString] = event.timestamp;
            //console.log("apply debuff, ", state);
            return state;
          }
          break;
        case EventType.RemoveDebuff:
          if (event.ability.guid === spell.id) {
            const encodedTargetString = encodeTargetString(
              event.targetID,
              event.targetInstance ?? 0,
            );
            if (!state) {
              state = {};
            }
            delete state[encodedTargetString];
            return state;
          }
          break;
      }

      return state;
    },
    validate: (state, event, ruleSpell) => {
      const targets = getTargets(event, targetOptions?.targetLinkRelation);
      if (targets.length === 0) {
        //No target so we can't check for a debuff
        //console.log("no target");
        return false;
      }

      return targets.some((encodedTargetString) => {
        if (state === null || state[encodedTargetString] === undefined) {
          // debuff is missing
          //console.log("state === null, state: ", state, "targets: ", targets);
          return true;
        } else if (state[encodedTargetString] + 200 > event.timestamp) {
          // debuff was *just* applied, possibly by this very spell. treat it as optional
          //console.log("bte just applied");
          return event.ability.guid === ruleSpell.id;
        } else {
          //console.log("return false");
          // otherwise, return true if we can pandemic this debuff
          return false;
        }
      });
    },
    describe: (tense) => (
      <>
        <SpellLink id={spell.id} /> {tenseAlt(tense, 'is', 'was')} missing from the target
      </>
    ),
  };
}
