import styled from '@emotion/styled';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/rogue';
import { SpellLink } from 'interface';
import { AplSummary } from 'interface/guide/components/Apl';
import { ComponentProps } from 'react';
import { TooltipElement } from 'interface';

const BlockBorder = styled.section`
  border: 1px solid #333a;
  border-radius: 2px;
  padding: 0.5em;
  padding-bottom: 0;

  & > header {
    margin-top: calc(-0.5em + -1em / 0.85);
    margin-left: 0.25em;
    /* via color picker, unfortunately */
    background: #131210;
    width: max-content;
    font-weight: bold;
    font-size: 0.85em;
  }
`;

const Block = ({ label, children }: React.PropsWithChildren<{ label: React.ReactNode }>) => (
  <BlockBorder>
    <header>{label}</header>
    <div>{children}</div>
  </BlockBorder>
);

const SummaryContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  gap: 1em;
  max-width: 42em;
  margin-bottom: 0.5em;
`;

const finisherCondTooltip = (
  <TooltipElement
    content={
      <>
        At <strong>5 or more</strong> combot points inside <SpellLink spell={SPELLS.STEALTH} /> or{' '}
        <SpellLink spell={SPELLS.SUBTERFUGE_BUFF} /> and at <strong>6 or more</strong> otherwise
      </>
    }
  >
    {' '}
    finisher condition
  </TooltipElement>
);

function HOAplSummary(): JSX.Element {
  return (
    <SummaryContainer>
      <Block label="Cooldowns">
        <ol>
          <li>
            <SpellLink spell={SPELLS.BLADE_FLURRY} /> to maintain the buff in AOE situations
          </li>
          <li>
            <SpellLink spell={SPELLS.ROLL_THE_BONES} /> to maintain the buff
          </li>
          <li>
            <SpellLink spell={talents.ADRENALINE_RUSH_TALENT} /> on cooldown.
          </li>
          <li>
            <SpellLink spell={talents.KILLING_SPREE_TALENT} /> if the {finisherCondTooltip} is met.
          </li>
          <li>
            <SpellLink spell={SPELLS.VANISH} /> if{' '}
            <SpellLink spell={talents.ADRENALINE_RUSH_TALENT} /> buff is up and the{' '}
            {finisherCondTooltip} is met.
          </li>
          <li>
            <SpellLink spell={talents.THISTLE_TEA_TALENT} /> under 50 energy.
          </li>
        </ol>
      </Block>

      <Block label={<>Finishers ( if the {finisherCondTooltip} is met )</>}>
        <ol>
          <li>
            <SpellLink spell={SPELLS.BETWEEN_THE_EYES} /> (make sure the cooldown is ready for your
            next stealth window)
          </li>
          <li>
            <SpellLink spell={SPELLS.DISPATCH} />
          </li>
        </ol>
      </Block>
      <Block label={<>Builders</>}>
        <ol>
          <li>
            <SpellLink spell={SPELLS.BLADE_FLURRY} /> at 5+ targets.
          </li>
          <li>
            <SpellLink spell={talents.GHOSTLY_STRIKE_TALENT} /> on cooldown.
          </li>
          <li>
            <SpellLink spell={SPELLS.AMBUSH} /> when in stealth stance or with an{' '}
            <SpellLink spell={talents.AUDACITY_TALENT} /> proc up
          </li>
          <li>
            <SpellLink spell={SPELLS.PISTOL_SHOT} /> with{' '}
            <SpellLink spell={talents.FAN_THE_HAMMER_TALENT} /> procs up
          </li>
          <li>
            <SpellLink spell={SPELLS.SINISTER_STRIKE} /> if you don't meet the conditions for any
            other builders.
          </li>
        </ol>
      </Block>
    </SummaryContainer>
  );
}

export default function OutlawAplSummary(props: ComponentProps<typeof AplSummary>): JSX.Element {
  return <HOAplSummary />;
}
