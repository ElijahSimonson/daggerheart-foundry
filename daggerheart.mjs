//Import Configuration

import DAGGERHEART from "./module/config.mjs";
import {
  applyLegacyRules, RegisterDeferredSettings, registerSystemKeybindings, registerSystemSettings
} from "./module/settings.mjs";

//Import Submodules


/* -------------------------------------------- */
/*  Define Module Structure                     */
/* -------------------------------------------- */

globalThis.daggerheart = {
  applications,
  canvas,
  config: DND5E,
  dataModels,
  dice,
  documents,
  enrichers,
  Filter,
  migrations,
  registry,
  utils
};

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */