import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { BadColor, GoodColor } from 'interface/guide';
import { ResourceLink, SpellLink } from 'interface';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import getResourceSpent from 'parser/core/getResourceSpent';
import { FINISHERS, getMaxComboPoints } from '../../constants';
import Finishers from '../features/Finishers';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/rogue';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';

export default class FinisherUse extends Analyzer {
  static dependencies = {
    finishers: Finishers,
  };

  protected finishers!: Finishers;

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

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE(6)}>
        <div className="pad">
          <label>
            <ResourceLink id={RESOURCE_TYPES.COMBO_POINTS.id} /> spender usage
          </label>
          {this.chart}
        </div>
      </Statistic>
    );
  }

  private onCast(event: CastEvent) {
    const cpsSpent = getResourceSpent(event, RESOURCE_TYPES.COMBO_POINTS);
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
          {tooltip} at {cpsSpent} combo points, you should try to never spend combo points under the
          recommended amount
        </>
      );
    }

    this.castEntries.push({ value, tooltip });
  }

  get guide(): JSX.Element {
    const explanation = (
      <p>
        Finishers should typically be used at 1 below max combo points or higher. Your primary
        finisher is <SpellLink id={SPELLS.DISPATCH} />. You want to maintain as close to possible
        100% uptime on both <SpellLink id={SPELLS.BETWEEN_THE_EYES} />
        and <SpellLink id={SPELLS.SLICE_AND_DICE} /> buff. Prioritise refreshing{' '}
        <SpellLink id={SPELLS.BETWEEN_THE_EYES} /> when the debuff is about to drop, and{' '}
        <SpellLink id={SPELLS.SLICE_AND_DICE} /> when the debuff is under pandemic window (tooltip
        here maybe to explain pandemic). When talented into{' '}
        <SpellLink id={TALENTS.GREENSKINS_WICKERS_TALENT} /> you will want to cast{' '}
        <SpellLink id={SPELLS.BETWEEN_THE_EYES} /> as close to on cd as possible to maximise the
        proc uptime.
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>Casts </strong>
          <small>
            - Green indicates an efficient cast under energy, yellow indicate a cast slighlty above
            the recommended energy threshold, while red indicates a "wasted" cast above the
            recommended energy threshold (Ignore this section in aoe for now)
          </small>
          <PerformanceBoxRow values={this.castEntries} />
        </RoundedPanel>
      </div>
    );
    return explanationAndDataSubsection(explanation, data, 40);
  }
}
