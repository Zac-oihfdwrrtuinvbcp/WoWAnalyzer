import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/rogue';
import EventEmitter from 'parser/core/modules/EventEmitter';
import Events, {
  ApplyDebuffEvent,
  DamageEvent,
  EventType,
  RefreshDebuffEvent,
  RemoveDebuffEvent,
} from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import Enemies from 'parser/shared/modules/Enemies';

const GS_DEBUFF_BASE_LENGHT = 10_000;
//const GS_DEBUFF_MAX_LENGHT = GS_DEBUFF_BASE_LENGHT + GS_DEBUFF_BASE_LENGHT * 0.3;

class GhostlyStrikeEventFabricator extends Analyzer {
  static dependencies = {
    eventEmitter: EventEmitter,
    enemies: Enemies,
  };
  protected eventEmitter!: EventEmitter;
  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.GHOSTLY_STRIKE_TALENT),
      this.onGhostlyStrike,
    );

    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(TALENTS.GHOSTLY_STRIKE_TALENT),
      this.applyDebuffDebug,
    );

    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell(SPELLS.BETWEEN_THE_EYES),
      this.refreshDebuffDebug,
    );

    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(TALENTS.GHOSTLY_STRIKE_TALENT),
      this.removeDebuffDebug,
    );

    // this.addEventListener(
    //   Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.BETWEEN_THE_EYES),
    //   this.removeDebuffDebug,
    // );
  }

  protected onGhostlyStrike(event: DamageEvent) {
    const ennemy = this.enemies.getEntity(event);
    //console.log(ennemy);
    const gsDebuff = ennemy?.getBuff(event.ability.guid, event.timestamp, event.sourceID);
    //console.log(gsDebuff);
    const gsApplyDebuffEvent: ApplyDebuffEvent = {
      type: EventType.ApplyDebuff,
      source: event.source,
      ability: event.ability,
      timestamp: event.timestamp,
      sourceID: event.sourceID,
      targetID: event.targetID!,
      targetIsFriendly: false,
      sourceIsFriendly: true,
    };

    const gsRemoveDebuffEvent: RemoveDebuffEvent = {
      type: EventType.RemoveDebuff,
      source: event.source,
      ability: event.ability,
      timestamp: event.timestamp + 10_000,
      sourceID: event.sourceID,
      targetID: event.targetID!,
      targetIsFriendly: false,
      sourceIsFriendly: true,
    };

    if (ennemy && gsDebuff) {
      const remainingTime = gsDebuff.end! - event.timestamp;
      const pandemic = Math.min(remainingTime, GS_DEBUFF_BASE_LENGHT * 0.3);
      gsRemoveDebuffEvent.timestamp += pandemic;
      //console.log('Gs debuff already present, remaining: ', remainingTime, gsDebuff);
    } else {
      //console.log('Gs debuff not present, fabricate applyDebuff and removeDebuff');
    }

    this.eventEmitter.fabricateEvent(gsApplyDebuffEvent);
    this.eventEmitter.fabricateEvent(gsRemoveDebuffEvent);
  }

  protected applyDebuffDebug(event: ApplyDebuffEvent) {
    console.log(
      'APPLY ',
      event.ability.name,
      ' at ',
      this.owner.formatTimestamp(event.timestamp),
      event,
    );
  }

  protected removeDebuffDebug(event: RemoveDebuffEvent) {
    console.log(
      'REMOVE ',
      event.ability.name,
      ' at ',
      this.owner.formatTimestamp(event.timestamp),
      event,
    );
  }

  protected refreshDebuffDebug(event: RefreshDebuffEvent) {
    console.log(
      'REFRESH ',
      event.ability.name,
      ' at ',
      this.owner.formatTimestamp(event.timestamp),
      event,
    );
  }
}

export default GhostlyStrikeEventFabricator;
