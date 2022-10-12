import { Vonn, Vetyst } from 'CONTRIBUTORS';
import Expansion from 'game/Expansion';
import SPECS from 'game/SPECS';
import { AlertWarning } from 'interface';
import Config from 'parser/Config';

import CHANGELOG from './CHANGELOG';

const config: Config = {
  contributors: [Vonn, Vetyst],
  expansion: Expansion.Dragonflight,
  patchCompatibility: null,
  isPartial: true,
  description: (
    <>
      <AlertWarning>
        Right now the Enhancement Analyzer is a work-in-progress, and only holds very basic
        functionality.
      </AlertWarning>
      <br />
      Hey there! Thanks for checking out the Enhancement Analyzer. If you have any feedback or
      suggestions, feel free to reach out to Vonn via Discord (vønn#2776) or drop an issue in the
      GitHub repo.
    </>
  ),
  exampleReport: '',

  spec: SPECS.ENHANCEMENT_SHAMAN,
  changelog: CHANGELOG,
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "EnhancementShaman" */).then(
      (exports) => exports.default,
    ),

  path: __dirname,
};

export default config;