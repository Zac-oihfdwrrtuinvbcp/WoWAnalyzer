import SPELLS from 'common/SPELLS';
import { suggestion } from 'parser/core/Analyzer';
import aplCheck, { Apl, build, CheckResult, PlayerInfo, Rule, tenseAlt } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import TALENTS from 'common/TALENTS/rogue';
import {
  and,
  buffMissing,
  buffPresent,
  debuffMissing,
  hasResource,
  hasTalent,
  or,
  describe,
  buffStacks,
  spellAvailable,
}  from 'parser/shared/metrics/apl/conditions';

import { AnyEvent, EventType } from 'parser/core/Events';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
//import Finishers from '../features/Finishers'


const hasFinisherCondition = () => {//             this should be using: finishers.recommendedFinisherPoints()
  return hasResource(RESOURCE_TYPES.COMBO_POINTS, {atLeast: 6 })
};

const rtbCondition = () => {
  const hasBS = buffPresent(SPELLS.BROADSIDE).validate;
  const hasTB = buffPresent(SPELLS.TRUE_BEARING).validate;
  const hasRS = buffPresent(SPELLS.RUTHLESS_PRECISION).validate;
  const hasSnC = buffPresent(SPELLS.SKULL_AND_CROSSBONES).validate;
  const hasBT = buffPresent(SPELLS.BURIED_TREASURE).validate;
  //const rtbBuffCount = hasBS + hasTB + hasRS + hasSnC + hasBT;

  //if snc is down and rtbBuffCount < 2 should reroll
   //return describe()
};

const notInStealthCondition = () => {
  return describe(and(buffMissing(SPELLS.SHADOW_DANCE_BUFF),
  buffMissing(SPELLS.SUBTERFUGE_BUFF)), (tense) => (
    <>
      you {tenseAlt(tense, 'are', 'were')} not in stealth stance.
    </>
  ),
  )
};

const COMMON_COOLDOWN: Rule[] = [
  {
    spell: TALENTS.BLADE_RUSH_TALENT,
    condition: describe(hasResource(RESOURCE_TYPES.ENERGY, {atMost: 90}),
    (tense) => (
      <>
        you {tenseAlt(tense, 'are', 'were')} under ~70/80 energy.
      </>)),
  },
  {
    spell: TALENTS.ROLL_THE_BONES_TALENT,
    condition: buffMissing(TALENTS.ROLL_THE_BONES_TALENT),
  },
  {
    spell: SPELLS.VANISH,
    condition: and(buffMissing(SPELLS.AUDACITY_TALENT_BUFF),
    describe(buffStacks(SPELLS.OPPORTUNITY, {atMost: 3}),
    (tense) => (
      <> you {tenseAlt(tense, 'have', 'had')} less than max stacks of <SpellLink id= {SPELLS.OPPORTUNITY}/></>)),
    notInStealthCondition()),
  },
  {
    spell: SPELLS.SHADOW_DANCE,
    condition: and(buffMissing(SPELLS.AUDACITY_TALENT_BUFF),
    buffMissing(SPELLS.OPPORTUNITY),
    spellAvailable(SPELLS.VANISH, true),
    notInStealthCondition()),
  },
];

const COMMON_FINISHER: Rule[] = [
  {
    spell: SPELLS.DISPATCH,
    condition: hasFinisherCondition(),
  },
];

export const COMMON_BUILDER: Rule[] = [
  {
    spell: SPELLS.AMBUSH,
    condition: or(buffPresent(SPELLS.AUDACITY_TALENT_BUFF), 
    buffPresent(SPELLS.SHADOW_DANCE_BUFF), 
    buffPresent(SPELLS.SUBTERFUGE_BUFF))
  },
  {
    spell: SPELLS.PISTOL_SHOT,
    condition: buffPresent(SPELLS.OPPORTUNITY),
  },
  SPELLS.SINISTER_STRIKE,
];

const default_rotation = build([
  ...COMMON_COOLDOWN,
  ...COMMON_FINISHER,
  ...COMMON_BUILDER,
]);

export const apl = (): Apl => {
  return default_rotation;
};

export const check = (events: AnyEvent[], info: PlayerInfo): CheckResult => {
  const check = aplCheck(apl());
  return check(events, info);
};

export default suggestion((events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);
  return undefined;
});
