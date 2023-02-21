import { FilteredDamageTracker, SpellUsable } from 'analysis/retail/rogue/shared';
import SPELLS from 'common/SPELLS';
import SpellManaCost from 'parser/shared/modules/SpellManaCost';
import { isStealthAll } from 'analysis/retail/rogue/shared/IsStealth';
//--TODO: for now this only works correctly for HO builds, make sure to update this in the future to take into account talents choices
//        figure out if the "delayWindow" value has to be changed

class VanishDamageTracker extends FilteredDamageTracker {
  static dependencies = {
    ...FilteredDamageTracker.dependencies,
    spellUsable: SpellUsable,
    spellManaCost: SpellManaCost,
  };
  protected spellUsable!: SpellUsable;

  shouldProcessEvent(event: any): boolean {
    // isOnCooldown returns true when this event is a Vanish cast, but we want to keep those casts too
    // ^ copied this from BteDamageTracker not sure if this apply to vanish aswell
    if (
      event.ability.guid !== SPELLS.VANISH.id &&
      this.spellUsable.isOnCooldown(SPELLS.VANISH.id)
    ) {
      return false;
    }
    
    const opportunityStacks = this.selectedCombatant.getBuffStacks(SPELLS.OPPORTUNITY.id);
    const hasAudacity = this.selectedCombatant.hasBuff(SPELLS.AUDACITY_BUFF.id);
    const isInStealthState = isStealthAll(this.selectedCombatant, 100);

    return !((opportunityStacks >3)||hasAudacity) && !isInStealthState;
  }
}

export default VanishDamageTracker;
