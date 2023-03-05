import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, TargettedEvent } from 'parser/core/Events';
import { BadColor, GoodColor } from 'interface/guide';
import { SpellLink } from 'interface';
import DonutChart from 'parser/ui/DonutChart';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import getResourceSpent from 'parser/core/getResourceSpent';
import { FINISHERS, getMaxComboPoints } from '../../constants';
import Finishers from '../features/Finishers';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import SPELLS from 'common/SPELLS';
import TALENTS, { TALENTS_ROGUE } from 'common/TALENTS/rogue';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BetweenTheEyes from '../spells/BetweenTheEyes';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

//-- TODO: Verify that greenskin wickers buff id is correct
//         Update the display to the thing assassination uses as this is a bit messy to read

export default class FinisherUse extends Analyzer {
  static dependencies = {
    finishers: Finishers,
    spellUsable: SpellUsable,
    betweenTheEyes: BetweenTheEyes,
  };

  protected finishers!: Finishers;
  protected spellUsable!: SpellUsable;
  protected betweenTheEyes!: BetweenTheEyes;

  protected hasImprovedBteTalent = this.selectedCombatant.hasTalent(
    TALENTS_ROGUE.IMPROVED_BETWEEN_THE_EYES_TALENT,
  );
  protected hasCountTheOddsTalent = this.selectedCombatant.hasTalent(
    TALENTS_ROGUE.COUNT_THE_ODDS_TALENT,
  );
  protected hasGreenskinTalent = this.selectedCombatant.hasTalent(
    TALENTS_ROGUE.GREENSKINS_WICKERS_TALENT,
  );

  totalFinisherCasts = 0;
  lowCpFinisherCasts = 0;

  castEntries: BoxRowEntry[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(FINISHERS), this.onCast);
  }

  get maxCpFinishers() {
    return this.totalFinisherCasts - this.lowCpFinisherCasts;
  }

  get chart() {
    const items = [
      {
        color: GoodColor,
        label: 'Max CP Finishers',
        value: this.maxCpFinishers,
        tooltip: (
          <>This includes finishers cast at {getMaxComboPoints(this.selectedCombatant) - 1} CPs.</>
        ),
      },
      {
        color: BadColor,
        label: 'Low CP Finishers',
        value: this.lowCpFinisherCasts,
      },
    ];

    return <DonutChart items={items} />;
  }

  private onCast(event: CastEvent) {
    const cpsSpent = getResourceSpent(event, RESOURCE_TYPES.COMBO_POINTS);
    const spellId = event.ability.guid;
    let value = QualitativePerformance.Good;
    let tooltip = (
      <>
        At {this.owner.formatTimestamp(event.timestamp)} you cast{' '}
        <SpellLink id={event.ability.guid} />{' '}
      </>
    );

    if (cpsSpent === 0) {
      return;
    }

    this.totalFinisherCasts += 1;
    if (cpsSpent < this.finishers.recommendedFinisherPoints()) {
      this.lowCpFinisherCasts += 1;
      value = QualitativePerformance.Fail;

      tooltip = (
        <>
          {tooltip} with {cpsSpent} combo points, you should try to never spend combo points under
          the recommended amount
        </>
      );
    }
    const hasRuthlessPrecisionBuff = this.selectedCombatant.hasBuff(SPELLS.RUTHLESS_PRECISION.id);
    const hasGreenskinBuff = this.selectedCombatant.hasBuff(
      TALENTS_ROGUE.GREENSKINS_WICKERS_TALENT.id,
    );
    const hasShadowDanceBuff = this.selectedCombatant.hasBuff(SPELLS.SHADOW_DANCE_BUFF.id);
    const bteRemainingTime = this.betweenTheEyes.getTimeRemaining(event as TargettedEvent<any>);

    if (
      this.spellUsable.isAvailable(SPELLS.BETWEEN_THE_EYES.id) &&
      spellId !== SPELLS.BETWEEN_THE_EYES.id
    ) {
      if (this.hasGreenskinTalent) {
        if (!hasGreenskinBuff) {
          value = QualitativePerformance.Fail;
          tooltip = (
            <>
              {tooltip} with <SpellLink id={SPELLS.BETWEEN_THE_EYES.id} /> off cooldown, when
              talented into <SpellLink id={TALENTS_ROGUE.GREENSKINS_WICKERS_TALENT.id} /> you should
              try to press <SpellLink id={SPELLS.BETWEEN_THE_EYES.id} /> as much on cd as possible.
            </>
          );
        }
      } else {
        if (hasRuthlessPrecisionBuff && this.hasImprovedBteTalent) {
          value = QualitativePerformance.Fail;
          tooltip = (
            <>
              {tooltip} with <SpellLink id={SPELLS.BETWEEN_THE_EYES.id} /> off cooldown, when
              talented into <SpellLink id={TALENTS_ROGUE.IMPROVED_BETWEEN_THE_EYES_TALENT.id} /> try
              to press <SpellLink id={SPELLS.BETWEEN_THE_EYES.id} /> on cooldown with{' '}
              <SpellLink id={SPELLS.RUTHLESS_PRECISION.id} /> buff up.
            </>
          );
        } else if (bteRemainingTime === 0 && !hasShadowDanceBuff && this.hasCountTheOddsTalent) {
          value = QualitativePerformance.Fail;
          tooltip = (
            <>
              {tooltip} with <SpellLink id={SPELLS.BETWEEN_THE_EYES.id} /> off cooldown, never let
              <SpellLink id={SPELLS.BETWEEN_THE_EYES.id} /> debuff fall off.
            </>
          );
        } else if (bteRemainingTime <= 4 && !hasShadowDanceBuff && this.hasCountTheOddsTalent) {
          value = QualitativePerformance.Ok;
          tooltip = (
            <>
              {tooltip} with <SpellLink id={SPELLS.BETWEEN_THE_EYES.id} /> off cooldown, try to
              refresh
              <SpellLink id={SPELLS.BETWEEN_THE_EYES.id} /> debuff early to not let it fall off.
            </>
          );
        }
      }
    } else if (spellId === SPELLS.BETWEEN_THE_EYES.id) {
      if (this.hasGreenskinTalent) {
        if (hasGreenskinBuff) {
          value = QualitativePerformance.Fail;
          tooltip = (
            <>
              {tooltip} with a <SpellLink id={TALENTS_ROGUE.GREENSKINS_WICKERS_TALENT.id} /> buff,
              try to not override your <SpellLink id={TALENTS_ROGUE.GREENSKINS_WICKERS_TALENT.id} />{' '}
              buffs.
            </>
          );
        }
      }
    } else if (
      !this.selectedCombatant.hasBuff(SPELLS.SLICE_AND_DICE.id) &&
      spellId !== SPELLS.SLICE_AND_DICE.id &&
      !this.selectedCombatant.hasBuff(SPELLS.GRAND_MELEE.id)
    ) {
      value = QualitativePerformance.Fail;
      tooltip = (
        <>
          {tooltip} with <SpellLink id={SPELLS.SLICE_AND_DICE.id} /> buff down, try to maintain
          <SpellLink id={SPELLS.SLICE_AND_DICE.id} /> buff at all time.
        </>
      );
    }
    this.castEntries.push({ value, tooltip });
  }

  get guide(): JSX.Element {
    const explanation = (
      <p>
        <strong>Finishers</strong> should typically be used at 1 below max combo points or higher.
        You want to maintain as close to possible 100% uptime on both{' '}
        <SpellLink id={SPELLS.BETWEEN_THE_EYES} /> and <SpellLink id={SPELLS.SLICE_AND_DICE} />{' '}
        buff.
        {this.hasGreenskinTalent && (
          <>
            {' '}
            Since you are talented into <SpellLink id={TALENTS.GREENSKINS_WICKERS_TALENT} /> you
            will want to cast <SpellLink id={SPELLS.BETWEEN_THE_EYES} /> as close to on cd as
            possible to maximise the proc uptime.
          </>
        )}
      </p>
    );

    const data = (
      <div>
        <strong>Casts Breakdown</strong>
        <small>- Green is a good cast, Yellow is an ok cast, Red is a bad cast</small>
        <PerformanceBoxRow values={this.castEntries} />
      </div>
    );
    return explanationAndDataSubsection(explanation, data, 40);
  }
}
