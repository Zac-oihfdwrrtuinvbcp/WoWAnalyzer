import { GuideProps, PassFailCheckmark, Section, SubSection } from 'interface/guide';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import { t, Trans } from '@lingui/macro';
import EnergyCapWaste from 'analysis/retail/rogue/shared/guide/EnergyCapWaste';
import TALENTS from 'common/TALENTS/rogue';
import { ResourceLink, SpellLink } from 'interface';
import { RoundedPanel, SideBySidePanels } from 'interface/guide/components/GuideDivs';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import CombatLogParser from './CombatLogParser';
import SPELLS from 'common/SPELLS';
import { ExplanationAndDataSubSection } from 'interface/guide/components/ExplanationRow';
import PassFailBar from 'interface/guide/components/PassFailBar';

function PassFail({
  value,
  total,
  passed,
  customTotal,
}: {
  value: number;
  total: number;
  passed: boolean;
  customTotal?: number;
}) {
  return (
    <div>
      <PassFailBar pass={value} total={customTotal ?? total} />
      &nbsp; <PassFailCheckmark pass={passed} />
      <p>
        {value} / {total} ({((value / total) * 100).toFixed(2)}%)
      </p>
    </div>
  );
}

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <ResourceUsageSection modules={modules} events={events} info={info} />
      <CoreRotationSection modules={modules} events={events} info={info} />
      <PreparationSection />
    </>
  );
}

function ResourceUsageSection({ modules }: GuideProps<typeof CombatLogParser>) {
  const percentAtCap = modules.energyTracker.percentAtCap;
  const energyWasted = modules.energyTracker.wasted;

  return (
    <Section
      title={t({
        id: 'guide.rogue.outlaw.sections.resources.title',
        message: 'Resource Use',
      })}
    >
      <SubSection
        title={t({
          id: 'guide.rogue.outlaw.sections.resources.energy.title',
          message: 'Energy',
        })}
      >
        <p>
          <Trans id="guide.rogue.outlaw.sections.resources.energy.summary">
            Your primary resource is <ResourceLink id={RESOURCE_TYPES.ENERGY.id} />. Typically,
            ability use will be limited by <ResourceLink id={RESOURCE_TYPES.ENERGY.id} />, not time.
            Avoid capping <ResourceLink id={RESOURCE_TYPES.ENERGY.id} /> - lost{' '}
            <ResourceLink id={RESOURCE_TYPES.ENERGY.id} /> regeneration is lost DPS. It will
            occasionally be impossible to avoid capping{' '}
            <ResourceLink id={RESOURCE_TYPES.ENERGY.id} /> - like while handling mechanics or during
            intermission phases.
          </Trans>
        </p>
        <EnergyCapWaste
          percentAtCap={percentAtCap}
          perfectTimeAtCap={0.05}
          goodTimeAtCap={0.1}
          okTimeAtCap={0.15}
          wasted={energyWasted}
        />
        {modules.energyGraph.plot}
        <p></p>
        <p>
          <Trans id="guide.rogue.outlaw.sections.resources.energy.BRandKS">
            -- WIP section -- This will highlight <SpellLink id={TALENTS.BLADE_RUSH_TALENT.id} />
            and <SpellLink id={TALENTS.KILLING_SPREE_TALENT.id} />
            usage when talented as we primarly use both these spells for energy efficiency.
          </Trans>
        </p>
      </SubSection>
      <SubSection
        title={t({
          id: 'guide.rogue.outlaw.sections.resources.comboPoints.title',
          message: 'Combo Points',
        })}
      >
        <p>
          <Trans id="guide.rogue.outlaw.sections.resources.comboPoints.summary">
            Most of your abilities either <strong>build</strong> or <strong>spend</strong>{' '}
            <ResourceLink id={RESOURCE_TYPES.COMBO_POINTS.id} />. Never use a builder at 6 or 7 CPs,
            and always wait until 6 or more cps to use a spender.
          </Trans>
        </p>
        <SideBySidePanels>
          <RoundedPanel>{modules.builderUse.chart}</RoundedPanel>
          <RoundedPanel>{modules.finisherUse.chart}</RoundedPanel>
        </SideBySidePanels>
        <p></p>
        <p>
          <Trans id="guide.rogue.outlaw.sections.resources.comboPoints.buildersBreakdown">
            -- WIP section -- Maybe highlight which builders the user is commonly overcapping with.
          </Trans>
        </p>
      </SubSection>
    </Section>
  );
}

function CoreRotationSection({ modules }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section
      title={t({
        id: 'guide.rogue.outlaw.sections.coreRotation.title',
        message: '-- WIP section -- Core rotation',
      })}
    >
      <SubSection
        title={t({
          id: 'guide.rogue.outlaw.sections.coreRotation.buffsUptimes.title',
          message: 'Buffs Uptimes',
        })}
      >
        <p>
          <Trans id="guide.rogue.outlaw.sections.coreRotation.buffsUptimes.summary">
            You should aim to have as close to possible to 100% uptime on your maintainance buff (
            <SpellLink id={TALENTS.ROLL_THE_BONES_TALENT} />,{' '}
            <SpellLink id={SPELLS.SLICE_AND_DICE} />, <SpellLink id={SPELLS.BETWEEN_THE_EYES} />
            ).
          </Trans>
        </p>
      </SubSection>

      <SubSection
        title={t({
          id: 'guide.rogue.outlaw.sections.coreRotation.finishers.title',
          message: 'Finishers',
        })}
      >
        <p>
          <Trans id="guide.rogue.outlaw.sections.coreRotation.finishers.summary">
            Finishers should typically be used at 1 below max combo points or higher. Your primary
            finisher is <SpellLink id={SPELLS.DISPATCH} />. You want to maintain as close to
            possible 100% uptime on both <SpellLink id={SPELLS.BETWEEN_THE_EYES} />
            and <SpellLink id={SPELLS.SLICE_AND_DICE} /> buff. Prioritise refreshing{' '}
            <SpellLink id={SPELLS.BETWEEN_THE_EYES} /> when the debuff is about to drop, and{' '}
            <SpellLink id={SPELLS.SLICE_AND_DICE} /> when the debuff is under pandemic window
            (tooltip here maybe to explain pandemic).
          </Trans>
        </p>
        <p>
          When talented into <SpellLink id={TALENTS.GREENSKINS_WICKERS_TALENT} /> you will want to
          cast <SpellLink id={SPELLS.BETWEEN_THE_EYES} /> as close to on cd as possible to maximise
          the proc uptime.
        </p>
        <p>-- WIP -- Perfomance box row section on the right like sin rogue does </p>
      </SubSection>

      <SubSection
        title={t({
          id: 'guide.rogue.outlaw.sections.coreRotation.procs.title',
          message: 'Procs',
        })}
      >
        <p>
          <Trans id="guide.rogue.outlaw.sections.coreRotation.procs.summary">
            One of the most important rule about outlaw is to not waste procs (tooltip for rare
            exceptions).
          </Trans>
        </p>
        <ExplanationAndDataSubSection
          explanationPercent={70}
          explanation={
            <p>
              <SpellLink id={SPELLS.OPPORTUNITY} /> procs are generated by{' '}
              <SpellLink id={SPELLS.SINISTER_STRIKE} />
              (and <SpellLink id={SPELLS.AMBUSH} /> since you are talented into{' '}
              <SpellLink id={TALENTS.HIDDEN_OPPORTUNITY_TALENT} />
              ), it is important to never cast a builder that would risk overwritting a proc and
              wasting it.
            </p>
          }
          data={<PassFail value={190} total={200} passed={190 / 200 > 0.9} />}
        />
        <p>
          <SpellLink id={TALENTS.AUDACITY_TALENT} /> procs are generated by{' '}
          <SpellLink id={SPELLS.PISTOL_SHOT} />, it is important to never cast a{' '}
          <SpellLink id={SPELLS.PISTOL_SHOT} /> that would risk overwritting a proc and wasting it.
        </p>
        <p>
          -- WIP -- Proc used / (proc wasted + potential overriden procs) efficiency bars akin to
          how devastations evoker handles procs in damage efficiency section
        </p>
      </SubSection>

      <SubSection
        title={t({
          id: 'guide.rogue.outlaw.sections.coreRotation.hoLoop.title',
          message: 'Hidden opportunity "Loop" - Special section only shown for hidden opp builds',
        })}
      >
        <p>
          <Trans id="guide.rogue.outlaw.sections.coreRotation.hoLoop.summary">
            When playing any <SpellLink id={TALENTS.HIDDEN_OPPORTUNITY_TALENT} /> build a very
            important concept is to maintain the pistol shot {'>'} ambush "loop". The goal should be
            to press sinister strike as little as possible, we achieve this following these simple
            rules:
            <ul>
              <li>
                Never cast <SpellLink id={SPELLS.SINISTER_STRIKE} /> while having a{' '}
                <SpellLink id={SPELLS.AUDACITY_TALENT_BUFF} /> or{' '}
                <SpellLink id={SPELLS.OPPORTUNITY} /> proc
              </li>
              <li>
                Never cast <SpellLink id={SPELLS.SINISTER_STRIKE} /> whith{' '}
                <SpellLink id={SPELLS.VANISH} /> or <SpellLink id={TALENTS.SHADOW_DANCE_TALENT} />{' '}
                cooldown is ready
              </li>
            </ul>
          </Trans>
        </p>
        <p>
          -- WIP -- you pressed sinister strike with procs 'x' times, you pressed sinister strike
          with vanish or dance ready 'x' times
        </p>
      </SubSection>

      <SubSection
        title={t({
          id: 'guide.rogue.outlaw.sections.coreRotation.rollTheBones.title',
          message: 'Roll the bones',
        })}
      >
        <p>
          <Trans id="guide.rogue.outlaw.sections.coreRotation.rollTheBones.summary">
            You should aim to maintain 100% uptime on your{' '}
            <SpellLink id={TALENTS.ROLL_THE_BONES_TALENT} /> buffs. Roll if you do not have any{' '}
            <SpellLink id={TALENTS.ROLL_THE_BONES_TALENT} /> buff active or reroll based on the
            conditions bellow:(HO only, this will change for kir builds)
            <ul>
              <li>
                Roll away any single buff that is not <SpellLink id={SPELLS.SKULL_AND_CROSSBONES} />
              </li>
              <li>
                Roll away any 2 buff that contains <SpellLink id={SPELLS.GRAND_MELEE} />, except for
                <SpellLink id={SPELLS.SKULL_AND_CROSSBONES} /> paired with{' '}
                <SpellLink id={SPELLS.GRAND_MELEE} />
              </li>
            </ul>
          </Trans>
        </p>
        <p>
          -- WIP -- Uptime bar + find a way to display time spent when the user should have rolled
          and when user pressed bad rerolls{' '}
        </p>
      </SubSection>
    </Section>
  );
}
