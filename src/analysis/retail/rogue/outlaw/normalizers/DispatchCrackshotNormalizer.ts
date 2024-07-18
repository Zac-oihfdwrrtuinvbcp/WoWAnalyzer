import SPELLS from 'common/SPELLS';
import { AnyEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import getResourceSpent from 'parser/core/getResourceSpent';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options } from 'parser/core/Module';
import { TALENTS_ROGUE } from 'common/TALENTS';

// This normalizer remove the subsequent dispatch cast events procced Between the eyes when talented into crackshot
class DispatchCrackshotNormalizer extends EventsNormalizer {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_ROGUE.CRACKSHOT_TALENT);
  }

  normalize(events: AnyEvent[]) {
    const fixedEvents: AnyEvent[] = [];
    const BUFFER_MS = 500;
    let lastBtEevent: AnyEvent;

    events.forEach((event: AnyEvent, idx: number) => {
      //We will want to check dispatch events that are close to a BtE casts and that cost no energy
      fixedEvents.push(event);

      if (event.type !== EventType.Cast) {
        return;
      }

      const spellId = event.ability.guid;

      if (spellId === SPELLS.BETWEEN_THE_EYES.id) {
        lastBtEevent = event;
        return;
      }

      if (spellId === SPELLS.DISPATCH.id) {
        if (lastBtEevent && event.timestamp - lastBtEevent.timestamp < BUFFER_MS) {
          const energyCost = getResourceSpent(event, RESOURCE_TYPES.ENERGY);
          if (!energyCost) {
            fixedEvents.pop();
          }
        }
        return;
      }
    });
    return fixedEvents;
  }
}
export default DispatchCrackshotNormalizer;
