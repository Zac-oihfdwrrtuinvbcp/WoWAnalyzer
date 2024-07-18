import SPELLS from 'common/SPELLS/rogue';
import { CastEvent } from 'parser/core/Events';
import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import getResourceSpent from 'parser/core/getResourceSpent';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

class GlobalCooldown extends CoreGlobalCooldown {
  static dependencies = {
    ...CoreGlobalCooldown.dependencies,
  };

  /*
   * Pistol Shots triggered by Fan the Hammer show up as casts of the same spell ID, but aren't actually casts.
   * Because they aren't casts, they don't have GCD events.
   */
  onCast(event: CastEvent) {
    const spellId = event.ability.guid;
    const energyCost = getResourceSpent(event, RESOURCE_TYPES.ENERGY);
    if (spellId === SPELLS.PISTOL_SHOT.id && energyCost === 0) {
      return;
    }

    if (spellId === SPELLS.DISPATCH.id && energyCost === 0) {
      return;
    }

    const isOnGCD = this.isOnGlobalCooldown(spellId);
    if (!isOnGCD) {
      return;
    }
    console.log(event);
    super.onCast(event);
  }
}

export default GlobalCooldown;
