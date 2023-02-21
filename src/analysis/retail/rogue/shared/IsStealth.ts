import SPELLS from 'common/SPELLS';
import Combatant from 'parser/core/Combatant';


// - There is more than currently used stealth types but this is to reflect the current simc implementation which should make it easier/clearer
//   to transpose apl rules into wowAnalyzer in the future

const STEALTH_BUFFS = [SPELLS.STEALTH, SPELLS.VANISH_BUFF];
const STEALTH_DANCE_BUFFS = [...STEALTH_BUFFS, SPELLS.SHADOW_DANCE_BUFF];
const STEALTH_ROGUE_BUFFS = [SPELLS.SUBTERFUGE_BUFF, SPELLS.SHADOW_DANCE_BUFF];
const STEALTH_STANCE_BUFFS = [...STEALTH_BUFFS, ...STEALTH_ROGUE_BUFFS, SPELLS.SEPSIS_BUFF]
const STEALTH_ALL_BUFFS = [...STEALTH_STANCE_BUFFS];


export function isStealth(combatant: Combatant, delayWindow: number) {
  return STEALTH_BUFFS.some((s) => combatant.hasBuff(s.id, null, delayWindow));
}

export function isStealthOrDance(combatant: Combatant, delayWindow: number) {
  return STEALTH_DANCE_BUFFS.some((s) => combatant.hasBuff(s.id, null, delayWindow));
}

export function isStealthAll(combatant: Combatant, delayWindow: number) {
  return STEALTH_ALL_BUFFS.some((s) => combatant.hasBuff(s.id, null, delayWindow));
}
