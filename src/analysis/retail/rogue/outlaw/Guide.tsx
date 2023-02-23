import { GuideProps, Section, SubSection } from 'interface/guide';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import { t, Trans } from '@lingui/macro';
import EnergyCapWaste from 'analysis/retail/rogue/shared/guide/EnergyCapWaste';
//import TALENTS from 'common/TALENTS/rogue';
//import HideExplanationsToggle from 'interface/guide/components/HideExplanationsToggle';
import { ResourceLink, SpellLink } from 'interface';
//import SPELLS from 'common/SPELLS';
import { RoundedPanel, SideBySidePanels } from 'interface/guide/components/GuideDivs';
//import CooldownUsage from 'parser/core/MajorCooldowns/CooldownUsage';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

import CombatLogParser from './CombatLogParser';
import { AplSectionData } from 'interface/guide/components/Apl';
import * as AplCheck from './modules/AplCheck';
import { TALENTS_ROGUE } from 'common/TALENTS';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <ResourceUsageSection modules={modules} events={events} info={info} />
      <CoreRotation modules={modules} events={events} info={info} />
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
            -- WIP section -- This will highlight{' '}
            <SpellLink id={TALENTS_ROGUE.BLADE_RUSH_TALENT.id} />
            and <SpellLink id={TALENTS_ROGUE.KILLING_SPREE_TALENT.id} />
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

function CoreRotation({ modules, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Core Rotation (Experimental)">
      <p>Outlaw rogue rotation is driven by a priority list.</p>

      <p>
        This Action Priority List (APL) is a simplified version off the simc APL that can be found{' '}
        <a href="https://raw.githubusercontent.com/simulationcraft/simc/dragonflight/engine/class_modules/apl/rogue/outlaw_df.simc">
          here
        </a>
        .
      </p>
      <AplSectionData checker={AplCheck.check} apl={AplCheck.apl()} />
      <hr />
      <p>
        As mentioned before use the accuracy here as a reference point to compare to other logs.
      </p>
    </Section>
  );
}
