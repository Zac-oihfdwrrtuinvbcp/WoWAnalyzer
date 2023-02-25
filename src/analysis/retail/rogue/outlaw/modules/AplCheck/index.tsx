import SPELLS from 'common/SPELLS';
import { suggestion } from 'parser/core/Analyzer';
import aplCheck, {
  Apl,
  build,
  CheckResult,
  PlayerInfo,
  Rule,
  tenseAlt,
} from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import TALENTS from 'common/TALENTS/rogue';
import {
  and,
  buffMissing,
  buffPresent,
  debuffMissing,
  hasResource,
  or,
  describe,
  buffStacks,
  not,
  optional,
} from 'parser/shared/metrics/apl/conditions';

import { AnyEvent } from 'parser/core/Events';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
//import Finishers from '../features/Finishers'

//--TODO: Figure out pandemic thingy for GS and BTE

const hasFinisherCondition = () => {
  //             this should be using: finishers.recommendedFinisherPoints()
  return hasResource(RESOURCE_TYPES.COMBO_POINTS, { atLeast: 6 });
};

// const rtbCondition = () => {
//   const hasBS = buffPresent(SPELLS.BROADSIDE).validate;
//   const hasTB = buffPresent(SPELLS.TRUE_BEARING).validate;
//   const hasRS = buffPresent(SPELLS.RUTHLESS_PRECISION).validate;
//   const hasSnC = buffPresent(SPELLS.SKULL_AND_CROSSBONES).validate;
//   const hasBT = buffPresent(SPELLS.BURIED_TREASURE).validate;
//   //const rtbBuffCount = hasBS + hasTB + hasRS + hasSnC + hasBT;

//   //if snc is down and rtbBuffCount < 2 should reroll
//    //return describe()
// };

const notInStealthCondition = () => {
  return describe(
    and(
      buffMissing(SPELLS.SHADOW_DANCE_BUFF),
      buffMissing(SPELLS.SUBTERFUGE_BUFF),
      buffMissing(SPELLS.STEALTH_BUFF),
      buffMissing(SPELLS.VANISH_BUFF),
    ),
    (tense) => <>you {tenseAlt(tense, 'are', 'were')} not in stealth stance</>,
  );
};

const COMMON_COOLDOWN: Rule[] = [
  {
    spell: TALENTS.THISTLE_TEA_TALENT,
    condition: describe(hasResource(RESOURCE_TYPES.ENERGY, { atMost: 50 }), (tense) => (
      <>you {tenseAlt(tense, 'are', 'were')} under 50 energy</>
    )),
  },
  {
    spell: TALENTS.BLADE_RUSH_TALENT,
    condition: describe(hasResource(RESOURCE_TYPES.ENERGY, { atMost: 70 }), (tense) => (
      <>you {tenseAlt(tense, 'are', 'were')} under ~70/80 energy</>
    )),
  },
  {
    spell: TALENTS.KILLING_SPREE_TALENT,
    condition: describe(hasResource(RESOURCE_TYPES.ENERGY, { atMost: 30 }), (tense) => (
      <>you {tenseAlt(tense, 'are', 'were')} under ~50/60 energy</>
    )),
  },
  {
    spell: TALENTS.ROLL_THE_BONES_TALENT,
    condition: buffMissing(TALENTS.ROLL_THE_BONES_TALENT),
  },
  {
    spell: SPELLS.VANISH,
    condition: and(
      buffMissing(SPELLS.AUDACITY_TALENT_BUFF),
      describe(buffStacks(SPELLS.OPPORTUNITY, { atMost: 3 }), (tense) => (
        <>
          {' '}
          you {tenseAlt(tense, 'have', 'had')} less than max stacks of{' '}
          <SpellLink id={SPELLS.OPPORTUNITY} />
        </>
      )),
      notInStealthCondition(),
      optional(not(hasFinisherCondition())),
    ),
  },
  {
    spell: TALENTS.SHADOW_DANCE_TALENT,
    condition: describe(
      and(
        buffMissing(SPELLS.AUDACITY_TALENT_BUFF),
        buffMissing(SPELLS.OPPORTUNITY),
        //I don't think the inverse part of this function work correclty, not sure how to update tho
        //spellAvailable(SPELLS.VANISH, true),
        notInStealthCondition(),
        optional(not(hasFinisherCondition())),
      ),
      (tense) => (
        <>
          <SpellLink id={SPELLS.AUDACITY_TALENT_BUFF} /> and <SpellLink id={SPELLS.OPPORTUNITY} />{' '}
          {tenseAlt(tense, 'are', 'were')} missing
        </>
      ),
    ),
  },
];

const COMMON_FINISHER: Rule[] = [
  {
    spell: SPELLS.BETWEEN_THE_EYES,
    condition: and(
      hasFinisherCondition(),
      debuffMissing(SPELLS.BETWEEN_THE_EYES, {
        timeRemaining: 4000,
        duration: 21000,
        pandemicCap: 4,
      }),
      //optional(buffMissing(SPELLS.SHADOW_DANCE_BUFF),),
    ),
  },
  {
    spell: SPELLS.SLICE_AND_DICE,
    condition: and(
      hasFinisherCondition(),
      buffMissing(SPELLS.SLICE_AND_DICE, {
        timeRemaining: 18000,
        duration: 45000,
        pandemicCap: 1,
      }),
      //NOT WORKING
      optional(buffMissing(SPELLS.GRAND_MELEE)),
    ),
  },
  {
    spell: SPELLS.DISPATCH,
    condition: hasFinisherCondition(),
  },
];

export const COMMON_BUILDER: Rule[] = [
  {
    spell: TALENTS.GHOSTLY_STRIKE_TALENT,
    condition: and(
      debuffMissing(TALENTS.GHOSTLY_STRIKE_TALENT, {
        timeRemaining: 3000,
        duration: 10000,
        pandemicCap: 0,
      }),
      notInStealthCondition(),
    ),
  },
  {
    spell: SPELLS.AMBUSH,
    condition: or(
      buffPresent(SPELLS.AUDACITY_TALENT_BUFF),
      describe(
        or(
          buffPresent(SPELLS.SHADOW_DANCE_BUFF),
          buffPresent(SPELLS.SUBTERFUGE_BUFF),
          buffPresent(SPELLS.STEALTH_BUFF),
          buffPresent(SPELLS.VANISH_BUFF),
        ),
        (tense) => <>you {tenseAlt(tense, 'are', 'were')} in stealth stance</>,
      ),
    ),
  },
  {
    spell: SPELLS.PISTOL_SHOT,
    condition: buffPresent(SPELLS.OPPORTUNITY),
  },
  SPELLS.SINISTER_STRIKE,
];

const hidden_opportunity_rotation = build([
  ...COMMON_COOLDOWN,
  ...COMMON_FINISHER,
  ...COMMON_BUILDER,
]);

export const apl = (): Apl => {
  return hidden_opportunity_rotation;
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
