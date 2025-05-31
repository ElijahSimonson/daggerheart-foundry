import CombatSettingsConfig from "./applications/settings/combat-settings.mjs";
import CompendiumBrowserSettingsConfig from "./applications/settings/compendium-browser-settings.mjs";
import ModuleArtSettingsConfig from "./applications/settings/module-art-settings.mjs";
import VariantRulesSettingsConfig from "./applications/settings/variant-rules-settings.mjs";
import VisibilitySettingsConfig from "./applications/settings/visibility-settings.mjs";
import PrimaryPartySetting from "./data/settings/primary-party-setting.mjs";
import TransformationSetting from "./data/settings/transformation-setting.mjs";

/**
 * Register all of the system's keybindings.
 */
export function registerSystemKeybindings() {
  game.keybindings.register("daggerheart", "skipDialogNormal", {
    name: "KEYBINDINGS.DAGGERHEART.SkipDialogNormal",
    editable: [{key: "ShiftLeft"}, {key: "ShiftRight"}]
  });

  game.keybindings.register("daggerheart", "skipDialogAdvantage", {
    name: "KEYBINDINGS.DAGGERHEART.SkipDialogAdvantage",
    editable: [{key: "AltLeft"}, {key: "AltRight"}]
  });

  game.keybindings.register("daggerheart", "skipDialogDisadvantage", {
    name: "KEYBINDINGS.DAGGERHEART.SkipDialogDisadvantage",
    editable: [{key: "ControlLeft"}, {key: "ControlRight"}, {key: "OsLeft"}, {key: "OsRight"}]
  });

  game.keybindings.register("daggerheart", "dragCopy", {
    name: "KEYBINDINGS.DAGGERHEART.DragCopy",
    editable: [{key: "ControlLeft"}, {key: "ControlRight"}, {key: "AltLeft"}, {key: "AltRight"}]
  });

  game.keybindings.register("daggerheart", "dragMove", {
    name: "KEYBINDINGS.DAGGERHEART.DragMove",
    editable: [{key: "ShiftLeft"}, {key: "ShiftRight"}, {key: "OsLeft"}, {key: "OsRight"}]
  });

}
/* -------------------------------------------- */

/**
 * Register all of the system's settings.
 */
export function registerSystemSettings() {
  // Internal System Migration Version
  game.settings.register("daggerheart", "systemMigrationVersion", {
    name: "System Migration Version",
    scope: "world",
    config: false,
    type: String,
    default: ""
  });

  // Polymorph Settings
  game.settings.register("daggerheart", "transformationSettings", {
    scope: "client",
    config: false,
    type: TransformationSetting
  });

  // Allow rotating square templates
  game.settings.register("daggerheart", "gridAlignedSquareTemplates", {
    name: "SETTINGS.dhGridAlignedSquareTemplatesN",
    hint: "SETTINGS.dhGridAlignedSquareTemplatesL",
    scope: "world",
    config: true,
    default: true,
    type: Boolean
  });

  // Collapse Item Cards (by default)
  game.settings.register("daggerheart", "autoCollapseItemCards", {
    name: "SETTINGS.dhAutoCollapseCardN",
    hint: "SETTINGS.dhAutoCollapseCardL",
    scope: "client",
    config: true,
    default: false,
    type: Boolean,
    onChange: s => {
      ui.chat.render();
    }
  });

  // Collapse Chat Card Trays
  game.settings.register("daggerheart", "autoCollapseChatTrays", {
    name: "SETTINGS.DAGGERHEART.COLLAPSETRAYS.Name",
    hint: "SETTINGS.DAGGERHEART.COLLAPSETRAYS.Hint",
    scope: "client",
    config: true,
    default: "older",
    type: String,
    choices: {
      never: "SETTINGS.DAGGERHEART.COLLAPSETRAYS.Never",
      older: "SETTINGS.DAGGERHEART.COLLAPSETRAYS.Older",
      always: "SETTINGS.DAGGERHEART.COLLAPSETRAYS.Always"
    }
  });

  // Allow Polymorphing
  game.settings.register("daggerheart", "allowPolymorphing", {
    name: "SETTINGS.DAGGERHEART.PERMISSIONS.AllowTransformation.Name",
    hint: "SETTINGS.DAGGERHEART.PERMISSIONS.AllowTransformation.Hint",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  // Allow Summoning
  game.settings.register("daggerheart", "allowSummoning", {
    name: "SETTINGS.DAGGERHEART.PERMISSIONS.AllowSummoning.Name",
    hint: "SETTINGS.DAGGERHEART.PERMISSIONS.AllowSummoning.Hint",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  // Metric Length Weights
  game.settings.register("daggerheart", "metricLengthUnits", {
    name: "SETTINGS.DAGGERHEART.METRIC.LengthUnits.Name",
    hint: "SETTINGS.DAGGERHEART.METRIC.LengthUnits.Hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });

  // Metric Volume Weights
  game.settings.register("daggerheart", "metricVolumeUnits", {
    name: "SETTINGS.DAGGERHEART.METRIC.VolumeUnits.Name",
    hint: "SETTINGS.DAGGERHEART.METRIC.VolumeUnits.Hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });

  // Metric Unit Weights
  game.settings.register("daggerheart", "metricWeightUnits", {
    name: "SETTINGS.DAGGERHEART.METRIC.WeightUnits.Name",
    hint: "SETTINGS.DAGGERHEART.METRIC.WeightUnits.Hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });

  // Strict validation
  game.settings.register("daggerheart", "strictValidation", {
    scope: "world",
    config: false,
    type: Boolean,
    default: true
  });

  // Compendium Browser source exclusion
  game.settings.registerMenu("daggerheart", "packSourceConfiguration", {
    name: "DAGGERHEART.CompendiumBrowser.Sources.Name",
    label: "DAGGERHEART.CompendiumBrowser.Sources.Label",
    hint: "DAGGERHEART.CompendiumBrowser.Sources.Hint",
    icon: "fas fa-book-open-reader",
    type: CompendiumBrowserSettingsConfig,
    restricted: true
  });

  game.settings.register("daggerheart", "packSourceConfiguration", {
    name: "Pack Source Configuration",
    scope: "world",
    config: false,
    type: Object,
    default: {}
  });

  // Combat Settings
  game.settings.registerMenu("daggerheart", "combatConfiguration", {
    name: "SETTINGS.DAGGERHEART.COMBAT.Name",
    label: "SETTINGS.DAGGERHEART.COMBAT.Label",
    hint: "SETTINGS.DAGGERHEART.COMBAT.Hint",
    icon: "fas fa-explosion",
    type: CombatSettingsConfig,
    restricted: true
  });

  game.settings.register("daggerheart", "autoRecharge", {
    name: "SETTINGS.DAGGERHEART.NPCS.AutoRecharge.Name",
    hint: "SETTINGS.DAGGERHEART.NPCS.AutoRecharge.Hint",
    scope: "world",
    config: false,
    default: "no",
    type: String,
    choices: {
      no: "SETTINGS.DAGGERHEART.NPCS.AutoRecharge.No",
      silent: "SETTINGS.DAGGERHEART.NPCS.AutoRecharge.Silent",
      yes: "SETTINGS.DAGGERHEART.NPCS.AutoRecharge.Yes"
    }
  });

  game.settings.register("daggerheart", "criticalDamageModifiers", {
    name: "SETTINGS.DAGGERHEART.CRITICAL.MultiplyModifiers.Name",
    hint: "SETTINGS.DAGGERHEART.CRITICAL.MultiplyModifiers.Hint",
    scope: "world",
    config: false,
    type: Boolean,
    default: false
  });

  game.settings.register("daggerheart", "criticalDamageMaxDice", {
    name: "SETTINGS.DAGGERHEART.CRITICAL.MaxDice.Name",
    hint: "SETTINGS.DAGGERHEART.CRITICAL.MaxDice.Hint",
    scope: "world",
    config: false,
    type: Boolean,
    default: false
  });

  game.settings.registerMenu("daggerheart", "variantRulesConfiguration", {
    name: "SETTINGS.DAGGERHEART.VARIANT.Name",
    label: "SETTINGS.DAGGERHEART.VARIANT.Label",
    hint: "SETTINGS.DAGGERHEART.VARIANT.Hint",
    icon: "fas fa-list-check",
    type: VariantRulesSettingsConfig,
    restricted: true
  });

  game.settings.register("daggerheart", "proficiencyModifier", {
    name: "SETTINGS.DAGGERHEART.VARIANT.ProficiencyModifier.Name",
    hint: "SETTINGS.DAGGERHEART.VARIANT.ProficiencyModifier.Hint",
    scope: "world",
    config: false,
    default: "bonus",
    type: String,
    choices: {
      bonus: "SETTINGS.DAGGERHEART.VARIANT.ProficiencyModifier.Bonus",
      dice: "SETTINGS.DAGGERHEART.VARIANT.ProficiencyModifier.Dice"
    }
  });

  game.settings.register("daggerheart", "restVariant", {
    name: "SETTINGS.DAGGERHEART.VARIANT.Rest.Name",
    hint: "SETTINGS.DAGGERHEART.VARIANT.Rest.Hint",
    scope: "world",
    config: false,
    default: "normal",
    type: String,
    choices: {
      normal: "SETTINGS.DAGGERHEART.VARIANT.Rest.Normal",
      gritty: "SETTINGS.DAGGERHEART.VARIANT.Rest.Gritty",
      epic: "SETTINGS.DAGGERHEART.VARIANT.Rest.Epic"
    }
  });

  // Visibility Settings
  game.settings.registerMenu("daggerheart", "visibilityConfiguration", {
    name: "SETTINGS.DAGGERHEART.VISIBILITY.Name",
    label: "SETTINGS.DAGGERHEART.VISIBILITY.Label",
    hint: "SETTINGS.DAGGERHEART.VISIBILITY.Hint",
    icon: "fas fa-eye",
    type: VisibilitySettingsConfig,
    restricted: true
  });

  game.settings.register("daggerheart", "attackRollVisibility", {
    name: "SETTINGS.DAGGERHEART.VISIBILITY.Attack.Name",
    hint: "SETTINGS.DAGGERHEART.VISIBILITY.Attack.Hint",
    scope: "world",
    config: false,
    default: "none",
    type: String,
    choices: {
      all: "SETTINGS.DAGGERHEART.VISIBILITY.Attack.All",
      hideAC: "SETTINGS.DAGGERHEART.VISIBILITY.Attack.HideAC",
      none: "SETTINGS.DAGGERHEART.VISIBILITY.Attack.None"
    }
  });

  game.settings.register("daggerheart", "concealItemDescriptions", {
    name: "SETTINGS.DAGGERHEART.VISIBILITY.ItemDescriptions.Name",
    hint: "SETTINGS.DAGGERHEART.VISIBILITY.ItemDescriptions.Hint",
    scope: "world",
    config: false,
    default: false,
    type: Boolean
  });

  // Primary Group
  game.settings.register("daggerheart", "primaryParty", {
    name: "Primary Party",
    scope: "world",
    config: false,
    default: null,
    type: PrimaryPartySetting,
    onChange: s => ui.actors.render()
  });

  // Control hints
  game.settings.register("daggerheart", "controlHints", {
    name: "DAGGERHEART.Controls.Name",
    hint: "DAGGERHEART.Controls.Hint",
    scope: "client",
    config: true,
    type: Boolean,
    default: true
  });
}

/**
 * Register additional settings after modules have had a chance to initialize to give them a chance to modify choices.
 */
export function registerDeferredSettings() {
  game.settings.register("daggerheart", "theme", {
    name: "SETTINGS.DAGGERHEART.THEME.Name",
    hint: "SETTINGS.DAGGERHEART.THEME.Hint",
    scope: "client",
    config: false,
    default: "",
    type: String,
    choices: {
      "": "SHEETS.DAGGERHEART.THEME.Automatic",
      ...CONFIG.DAGGERHEART.themes
    },
    onChange: s => setTheme(document.body, s)
  });

  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    setTheme(document.body, game.settings.get("daggerheart", "theme"));
  });
  matchMedia("(prefers-contrast: more)").addEventListener("change", () => {
    setTheme(document.body, game.settings.get("daggerheart", "theme"));
  });

  // Hook into core color scheme setting.
  const setting = game.settings.get("core", "uiConfig");
  const settingConfig = game.settings.settings.get("core.uiConfig");
  const { onChange } = settingConfig ?? {};
  if ( onChange ) settingConfig.onChange = (s, ...args) => {
    onChange(s, ...args);
    setTheme(document.body, s.colorScheme);
  };
  setTheme(document.body, setting.colorScheme);
}

/* -------------------------------------------- */

/**
 * Set the theme on an element, removing the previous theme class in the process.
 * @param {HTMLElement} element     Body or sheet element on which to set the theme data.
 * @param {string} [theme=""]       Theme key to set.
 * @param {Set<string>} [flags=[]]  Additional theming flags to set.
 */
export function setTheme(element, theme="", flags=new Set()) {
  if ( foundry.utils.getType(theme) === "Object" ) theme = theme.applications;
  element.className = element.className.replace(/\bdaggerheart-(theme|flag)-[\w-]+\b/g, "");

  // Primary Theme
  if ( !theme && (element === document.body) ) {
    if ( matchMedia("(prefers-color-scheme: dark)").matches ) theme = "dark";
    if ( matchMedia("(prefers-color-scheme: light)").matches ) theme = "light";
  }
  if ( theme ) {
    element.classList.add(`daggerheart-theme-${theme.slugify()}`);
    element.dataset.theme = theme;
  }
  else delete element.dataset.theme;

  // Additional Flags
  if ( (element === document.body) && matchMedia("(prefers-contrast: more)").matches ) flags.add("high-contrast");
  for ( const flag of flags ) element.classList.add(`daggerheart-flag-${flag.slugify()}`);
  element.dataset.themeFlags = Array.from(flags).join(" ");
}
