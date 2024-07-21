import TALENTS from 'common/TALENTS/rogue';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import { isStealthStance } from '../../../shared/IsStealth';
import SpellUsable from 'parser/shared/modules/SpellUsable';

/**
 * If talented into Crackshot, Between the Eyes resets its cooldown when cast from stealth.
 */
class Crackshot extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.CRACKSHOT_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BETWEEN_THE_EYES),
      this.onBtECast,
    );
  }

  onBtECast(event: CastEvent) {
    // If the player is in stealth, reset the cooldown of BtE
    if (isStealthStance(this.selectedCombatant, 0)) {
      this.spellUsable.endCooldown(SPELLS.BETWEEN_THE_EYES.id);
    }
  }
}

export default Crackshot;
