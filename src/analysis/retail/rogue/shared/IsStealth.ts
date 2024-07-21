import SPELLS from 'common/SPELLS';
import Combatant from 'parser/core/Combatant';

const STEALTH_BUFFS = [SPELLS.STEALTH, SPELLS.VANISH_BUFF];
const STEALTH_DANCE_BUFFS = [...STEALTH_BUFFS, SPELLS.SHADOW_DANCE_BUFF];
const STEALTH_STANCE_BUFFS = [...STEALTH_DANCE_BUFFS, SPELLS.SUBTERFUGE_BUFF];

export function isStealth(combatant: Combatant, delayWindow: number) {
  return STEALTH_BUFFS.some((s) => combatant.hasBuff(s.id, null, delayWindow));
}

export function isStealthOrDance(combatant: Combatant, delayWindow: number) {
  return STEALTH_DANCE_BUFFS.some((s) => combatant.hasBuff(s.id, null, delayWindow));
}

export function isStealthStance(combatant: Combatant, delayWindow: number) {
  return STEALTH_STANCE_BUFFS.some((s) => combatant.hasBuff(s.id, null, delayWindow));
}
