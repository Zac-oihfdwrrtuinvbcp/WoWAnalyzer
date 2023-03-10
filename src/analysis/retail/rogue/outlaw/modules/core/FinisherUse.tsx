import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, TargettedEvent } from 'parser/core/Events';
import { BadColor, GoodColor } from 'interface/guide';
import { SpellLink } from 'interface';
import DonutChart from 'parser/ui/DonutChart';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import getResourceSpent from 'parser/core/getResourceSpent';
import { FINISHERS, getMaxComboPoints } from '../../constants';
import Finishers from '../features/Finishers';
import SPELLS from 'common/SPELLS';
import TALENTS, { TALENTS_ROGUE } from 'common/TALENTS/rogue';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BetweenTheEyes from '../spells/BetweenTheEyes';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { ChecklistUsageInfo, SpellUse, spellUseToBoxRowEntry } from 'parser/core/SpellUsage/core';
import { ReactNode } from 'react';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import SpellUsageSubSection from 'parser/core/SpellUsage/SpellUsageSubSection';
import { formatDurationMillisMinSec } from 'common/format';

//-- TODO: Verify that greenskin wickers buff id is correct
//         Update the display to the thing assassination uses as this is a bit messy to read
//    User has slice and dice prepull??

const BTE_ACCEPTABLE_REFRESH_TIME = 6000;
const BTE_FLAG_REFRESH_TIME = 4000;

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
  spellUses: SpellUse[] = [];

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

    if (cpsSpent === 0) {
      return;
    }

    const targetCps = this.finishers.recommendedFinisherPoints();
    let cpsPerformance = QualitativePerformance.Good;
    let cpsSummary: ReactNode;
    let cpsDetails: ReactNode;

    this.totalFinisherCasts += 1;
    if (cpsSpent < targetCps) {
      this.lowCpFinisherCasts += 1;

      cpsPerformance = QualitativePerformance.Fail;
      cpsSummary = <div>Spend &gt;= {targetCps} CPs</div>;
      cpsDetails = (
        <div>
          You spent {cpsSpent} CPs. Try to always spend at least {targetCps} CPs when casting a
          finisher.
        </div>
      );
    } else {
      cpsSummary = <div>Spent &gt;= {targetCps} CPs</div>;
      cpsDetails = <div>You spent {cpsSpent} CPs.</div>;
    }

    const hasRuthlessPrecisionBuff = this.selectedCombatant.hasBuff(SPELLS.RUTHLESS_PRECISION.id);
    const hasGreenskinBuff = this.selectedCombatant.hasBuff(
      TALENTS_ROGUE.GREENSKINS_WICKERS_TALENT.id,
    );
    const hasShadowDanceBuff = this.selectedCombatant.hasBuff(SPELLS.SHADOW_DANCE_BUFF.id);
    const bteRemainingTime = this.betweenTheEyes.getTimeRemaining(event as TargettedEvent<any>);

    let finisherChoicePerformance = QualitativePerformance.Good;
    let finisherChoiceSummary = (
      <div>Between the eyes debuff was up and slice and dice buff was up</div>
    );
    let finisherChoiceDetails = <div> You cast {event.ability.name}</div>;

    if (
      this.spellUsable.isAvailable(SPELLS.BETWEEN_THE_EYES.id) &&
      spellId !== SPELLS.BETWEEN_THE_EYES.id
    ) {
      if (this.hasGreenskinTalent) {
        if (!hasGreenskinBuff) {
          finisherChoicePerformance = QualitativePerformance.Fail;
          finisherChoiceSummary = <div>Between the eyes was ready</div>;
          finisherChoiceDetails = (
            <>
              {finisherChoiceDetails} with <SpellLink id={SPELLS.BETWEEN_THE_EYES.id} /> off
              cooldown, when talented into{' '}
              <SpellLink id={TALENTS_ROGUE.GREENSKINS_WICKERS_TALENT.id} /> you should try to press{' '}
              <SpellLink id={SPELLS.BETWEEN_THE_EYES.id} /> as much on cd as possible.
            </>
          );
        }
      } else {
        if (hasRuthlessPrecisionBuff && this.hasImprovedBteTalent) {
          finisherChoicePerformance = QualitativePerformance.Fail;
          finisherChoiceSummary = <div>Between the eyes was ready</div>;
          finisherChoiceDetails = (
            <>
              {finisherChoiceDetails} with <SpellLink id={SPELLS.BETWEEN_THE_EYES.id} /> off
              cooldown, when talented into{' '}
              <SpellLink id={TALENTS_ROGUE.IMPROVED_BETWEEN_THE_EYES_TALENT.id} /> try to press{' '}
              <SpellLink id={SPELLS.BETWEEN_THE_EYES.id} /> on cooldown with{' '}
              <SpellLink id={SPELLS.RUTHLESS_PRECISION.id} /> buff up.
            </>
          );
        } else if (bteRemainingTime === 0 && !hasShadowDanceBuff && this.hasCountTheOddsTalent) {
          finisherChoicePerformance = QualitativePerformance.Fail;
          finisherChoiceSummary = <div>Between the eyes debuff was missing from the target</div>;
          finisherChoiceDetails = (
            <>
              {finisherChoiceDetails} with <SpellLink id={SPELLS.BETWEEN_THE_EYES.id} /> off
              cooldown, never let
              <SpellLink id={SPELLS.BETWEEN_THE_EYES.id} /> debuff fall off.
            </>
          );
        } else if (
          bteRemainingTime <= BTE_FLAG_REFRESH_TIME &&
          !hasShadowDanceBuff &&
          this.hasCountTheOddsTalent
        ) {
          finisherChoicePerformance = QualitativePerformance.Ok;
          finisherChoiceSummary = <div>Time remaining on betweenTheEyes: {bteRemainingTime}</div>;
          finisherChoiceDetails = (
            <>
              {finisherChoiceDetails} with <SpellLink id={SPELLS.BETWEEN_THE_EYES.id} /> off
              cooldown, try to refresh
              <SpellLink id={SPELLS.BETWEEN_THE_EYES.id} /> debuff early to not let it fall off.
            </>
          );
        }
      }
    } else if (spellId === SPELLS.BETWEEN_THE_EYES.id) {
      if (this.hasGreenskinTalent) {
        if (hasGreenskinBuff) {
          finisherChoicePerformance = QualitativePerformance.Fail;
          finisherChoiceSummary = <div>Greenskin Wickers buff was already present</div>;
          finisherChoiceDetails = (
            <>
              {finisherChoiceDetails} with a{' '}
              <SpellLink id={TALENTS_ROGUE.GREENSKINS_WICKERS_TALENT.id} /> buff, try to not
              override your <SpellLink id={TALENTS_ROGUE.GREENSKINS_WICKERS_TALENT.id} /> buffs.
            </>
          );
        }
      } else if (bteRemainingTime > BTE_ACCEPTABLE_REFRESH_TIME && this.hasCountTheOddsTalent) {
        finisherChoicePerformance = QualitativePerformance.Ok;
        finisherChoiceSummary = (
          <div>
            Time left on Between the Eyes debuff: {formatDurationMillisMinSec(bteRemainingTime)}{' '}
          </div>
        );
        finisherChoiceDetails = (
          <div>
            You used <SpellLink id={SPELLS.BETWEEN_THE_EYES.id} /> with{' '}
            {formatDurationMillisMinSec(bteRemainingTime)} left on the debuff, since you aren't
            playing <SpellLink id={TALENTS_ROGUE.GREENSKINS_WICKERS_TALENT.id} /> talent, you do not
            need to refresh it's debuff this early, try to instead keep the cooldown ready in case
            of target swapping for example. Refreshing the debuff early before a{' '}
            <SpellLink id={TALENTS_ROGUE.SHADOW_DANCE_TALENT.id} /> window is however fine.
          </div>
        );
      }
    } else if (
      !this.selectedCombatant.hasBuff(SPELLS.SLICE_AND_DICE.id) &&
      spellId !== SPELLS.SLICE_AND_DICE.id &&
      !this.selectedCombatant.hasBuff(SPELLS.GRAND_MELEE.id)
    ) {
      finisherChoicePerformance = QualitativePerformance.Fail;
      finisherChoiceSummary = (
        <div>
          Between the eyes debuff was present on the target and slice and dice buff was missing
        </div>
      );
      finisherChoiceDetails = (
        <>
          {finisherChoiceDetails} with <SpellLink id={SPELLS.SLICE_AND_DICE.id} /> buff down, try to
          maintain
          <SpellLink id={SPELLS.SLICE_AND_DICE.id} /> buff at all time.
        </>
      );
    } else if (spellId === SPELLS.SLICE_AND_DICE.id) {
      if (!this.selectedCombatant.hasBuff(SPELLS.SLICE_AND_DICE.id, event.timestamp, 0, 300)) {
        finisherChoiceSummary = (
          <div>
            Between the eyes debuff was present on the target and you had no slice and dice buff
            running
          </div>
        );
      } else {
        finisherChoiceSummary = <div>snd</div>;
      }
    }

    const checklistItems: ChecklistUsageInfo[] = [
      {
        check: 'finisher choice',
        timestamp: event.timestamp,
        performance: finisherChoicePerformance,
        summary: finisherChoiceSummary,
        details: finisherChoiceDetails,
      },
      {
        check: 'cps',
        timestamp: event.timestamp,
        performance: cpsPerformance,
        summary: cpsSummary,
        details: cpsDetails,
      },
    ];

    const performance = combineQualitativePerformances(checklistItems.map((it) => it.performance));

    this.spellUses.push({
      event,
      performance: performance,
      checklistItems: checklistItems,
      performanceExplanation:
        performance !== QualitativePerformance.Fail ? `${performance} Usage` : 'Bad Usage',
    });
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

    const performances = this.spellUses.map((it) =>
      spellUseToBoxRowEntry(it, this.owner.fight.start_time),
    );

    return (
      <SpellUsageSubSection
        explanation={explanation}
        performance={performances}
        uses={this.spellUses}
        castBreakdownSmallText={
          <> - Green is a good cast, Yellow is an ok cast, Red is a bad cast.</>
        }
      />
    );
  }
}
