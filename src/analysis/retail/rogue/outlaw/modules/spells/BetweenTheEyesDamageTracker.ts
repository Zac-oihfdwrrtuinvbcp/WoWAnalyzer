import { FilteredDamageTracker, SpellUsable } from 'analysis/retail/rogue/shared';
import SPELLS from 'common/SPELLS';
import SpellManaCost from 'parser/shared/modules/SpellManaCost';
import { TALENTS_ROGUE } from '../../../../../../common/TALENTS';

class BetweenTheEyesDamageTracker extends FilteredDamageTracker {
  static dependencies = {
    ...FilteredDamageTracker.dependencies,
    spellUsable: SpellUsable,
    spellManaCost: SpellManaCost,
  };
  protected spellUsable!: SpellUsable;

  protected hasImprovedBteTalent = this.selectedCombatant.hasTalent(
    TALENTS_ROGUE.IMPROVED_BETWEEN_THE_EYES_TALENT,
  );
  protected hasCtOTalent = this.selectedCombatant.hasTalent(TALENTS_ROGUE.COUNT_THE_ODDS_TALENT);
  protected hasGSWTalent = this.selectedCombatant.hasTalent(
    TALENTS_ROGUE.GREENSKINS_WICKERS_TALENT,
  );

  shouldProcessEvent(event: any): boolean {
    // isOnCooldown returns true when this event is a BTE cast, but we want to keep those casts too
    if (
      event.ability.guid !== SPELLS.BETWEEN_THE_EYES.id &&
      this.spellUsable.isOnCooldown(SPELLS.BETWEEN_THE_EYES.id)
    ) {
      return false;
    }

    const hasRuthlessPrecision = this.selectedCombatant.hasBuff(SPELLS.RUTHLESS_PRECISION.id);
    const hasShadowDance = this.selectedCombatant.hasBuff(SPELLS.SHADOW_DANCE_BUFF.id);

    return (
      this.hasGSWTalent ||
      (!(this.hasCtOTalent && hasShadowDance) && hasRuthlessPrecision && this.hasImprovedBteTalent)
    );
  }
}

export default BetweenTheEyesDamageTracker;
