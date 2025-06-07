//Import Configuration

import DAGGERHEART from "./module/config.mjs";
import {
  applyLegacyRules, RegisterDeferredSettings, registerSystemKeybindings, registerSystemSettings
} from "./module/settings.mjs";
import * as documents from "./module/documents/_module.mjs";

//Import Submodules


/* -------------------------------------------- */
/*  Define Module Structure                     */
/* -------------------------------------------- */

globalThis.daggerheart = {
  applications,
  canvas,
  config: DAGGERHEART,
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

Hooks.once("init", function() {
  globalThis.daggerheart = game.daggerheart = Object.assign(game.system, globalThis.daggerheart);
  utils.log(`Initializing the Daggerheart Game System - Version ${daggerheart.version}\n${DAGGERHEART.ASCII}`);

  //Record Configuration Values
  CONFIG.DAGGERHEART = DAGGERHEART;
  CONFIG.ActiveEffect.documentClass = documents.ActiveEffectDH;
  CONFIG.ActiveEffect.legacyTransferral = false;
  CONFIG.Actor.documentClass = documents.ActorDH;
  CONFIG.ChatMessage.documentClass = documents.ChatMessageDH;
  CONFIG.Combat.documentClass = documents.CombatDH;
  CONFIG.Combatant.documentClass = documents.CombatantDH;
  CONFIG.CombatantGroup.documentClass = documents.CombatantGroupDH;
  CONFIG.Item.collection = dataModels.collection.ItemsDH;
  CONFIG.Item.compendiumIndexFields.push("system.container");
  CONFIG.Item.documentClass = documents.ItemDH;
  CONFIG.JournalEntryPage.documentClass = documents.JournalEntryPageDH;
  CONFIG.Token.documentClass = documents.TokenDocumentDH;
  CONFIG.Token.objectClass = canvas.TokenDH;
  CONFIG.User.documentClass = documents.UserDH;
  Roll.TOOLTIP_TEMPLATE = "systems/daggerheart/templates/chat/roll-breakdown.hbs"
  CONFIG.Dice.BasicRoll = dice.BasicRoll;
  CONFIG.Dice.DamageRoll = dice.DamageRoll;
  CONFIG.Dice.D20Die = dice.D20Die;
  CONFIG.Dice.D20Roll = dice.D20Roll;
  CONFIG.Dice.HopeFearRoll = dice.HopeFearRoll;
  CONFIG.MeasuredTemplate.defaults.angles = 53.13;
  CONFIG.Note.objectClass = canvas.NoteDH;
  CONFIG.ui.chat = applications.ChatLogDH;
  CONFIG.ui.combat = applications.combat.CombatTrackerDH;
  CONFIG.ui.items = applications.item.ItemDirectoryDH;
  CONFIG.ux.DragDrop = DragDropDH;

  //Register System Settings
  registerSystemSettings();
  registerSystemKeybindings();

  //Configure Art Module
  game.daggerheart.moduleArt = new ModuleArt();

  //Configure tooltips
  game.daggerheart.tooltips = new TooltipsDH();

  //Register module data from Manifest
  registerModuleData();

  //Register Roll Extensions
  CONFIG.Dice.rolls = [dice.BasicRoll, dice.D20Roll, dice.DamageRoll, dice.HopeFearRoll];

  //Hook up system data types
  CONFIG.ActiveEffect.dataModels = dataModels.activeEffect.config;
  CONFIG.Actor.dataModels = dataModels.actor.config;
  CONFIG.Item.dataModels = dataModels.item.config;
  CONFIG.ChatMessage.dataModels = dataModels.chatMessage.config;
  CONFIG.JournalEntryPage.dataModels = dataModels.journal.config;

  //Add fonts
  _configureFonts();

  //Register Sheet application classes
  const DocumentSheetConfig = foundry.applications.apps.DocumentSheetConfig;
  DocumentSheetConfig.unregisterSheet(Actor, "core", foundry.appv1.sheets.ActorSheet);
  DocumentSheetConfig.registerSheet(Actor, "daggerheart", applications.actor.CharacterActorSheet, {
    types:["character"],
    makeDefault: true,
    label: "DAGGERHEART.SheetClassCharacter"
  });
  DocumentSheetConfig.registerSheet(Actor, "daggerheart", applications.actor.NPCActorSheet, {
    types:["npc"],
    makeDefault: true,
    label: "DAGGERHEART.SheetClassNPC"
  });
  DocumentSheetConfig.registerSheet(Actor, "daggerheart", applications.actor.ActorSheetDHVehicle, {
    types: ["vehicle"],
    makeDefault: true,
    label: "DAGGERHEART.SheetClassVehicle",
  });
  DocumentSheetConfig.registerSheet(Actor, "daggerheart", applications.actor.GroupActorSheet, {
    types:["group"],
    makeDefault: true,
    label: "DAGGERHEART.SheetClassGroup",
  });
  DocumentSheetConfig.unregisterSheet(Item, "core", foundry.appv1.sheets.ItemSheet);
  DocumentSheetConfig.registerSheet(Item, "daggerheart", applications.item.ItemSheetDH, {
    makeDefault: true,
    label: "DAGGERHEART.SheetClassItem"
  });
  DocumentSheetConfig.unregisterSheet(Item, "daggerheart", applications.item.ItemSheetDH, {types: ["container"]});
  DocumentSheetConfig.registerSheet(Item, "daggerheart", applications.item.ContainerSheet, {
    makeDefault: true,
    types: ["container"],
    label: "DAGGERHEART.SheetClassContainer"
  });
  DocumentSheetConfig.registerSheet(JournalEntry, "daggerheart", applications.journal.JournalSheetDH, {
    makeDefault: true,
    label: "DAGGERHEART.SheetClassJournalEntry"
  });
  DocumentSheetConfig.registerSheet(JournalEntryPage, "daggerheart", applications.journal.JournalClassPageSheet,{
    label: "DAGGERHEART.SheetClassClassSummary",
    types: ["class", "subclass"]
  });
  DocumentSheetConfig.registerSheet(JournalEntryPage, "daggerheart", applications.JournalMapLocationPageSheet, {
    label: "DAGGERHEART.SheetClassMap",
    types: ["map"]
  });
  DocumentSheetConfig.registerSheet(JournalEntryPage, "daggerheart", applications.JournalRulePageSheet, {
    label: "DAGGERHEART.SheetClassRule",
    types: ["rule"]
  });

  CONFIG.Token.prototypeSheetClass = applications.PrototypeTokenConfigDH;
  DocumentSheetConfig.unregisterSheet(TokenDocument, "core", foundry.applications.sheets.TokenConfig);
  DocumentSheetConfig.registerSheet(TokenDocument, "daggerheart", applications.TokenConfigDH, {
    label: "DAGGERHEART.SheetClassToken"
  });

  //Preload Handlebars helpers and partials
  utils.registerHandlebarsHelpers();
  utils.preloadHandlebarsTemplates();

  //Enrichers
  enrichers.registerCustomEnrichers();

});

/**
 * Configure explicit lists of attributes that are trackable on the token HUD and in combat tracker
 * @internal
 */
function _configureTrackableAttributes() {
  const common = {
    bar: [],
    value: [
      ...Object.keys(DAGGERHEART.traits).map(traits => `traits.${trait}.value`),
      "attributes.evasion.value",
      "attributes.ac.ThresholdMaj",
      "attributes.ac.ThresholdSev",
    ]
  };

  const creature = {
    bar: [
      ...common.bar,
      "attributes.hp",
    ],
    value: [
      ...common.value,
    ]
  };

  CONFIG.Actor.trackableAttributes = {
    character: {
      bar: [...creature.bar, "resources.primary", "resources.secondary", "resources.tertiary"],
      value: [...creature.value]
    },
    npc: {
      bar: [...creature.bar, "resources.legact", "resources.legres"],
      value: [...creature.value, "details.tier"]
    },
    vehicle: {
      bar: [...common.bar, "attributes.hp"],
      value: [...common.value]
    },
    group: {
      bar: [],
      value: []
    }
  };
}

/**
 * Configure which attributes are available for item consumption
 * @internal
 */
function _configureConsumableAttributes() {
  CONFIG.DAGGERHEART.consumableResources = [
    ...Object.keys(DAGGERHEART.traits).map(trait => `traits.${trait}.value`),
    "attributes.ac.ThresholdMaj",
    "attributes.ac.ThresholdSev",
    "attributes.hp.value",
    ...Objects.keys(DAGGERHEART.currencies).map(denom => `currency.${denom}`),
    "resources.primary.value", "resources.secondary.value", "resources.tertiary.value",
    "resources.legact.value", "resources.legres.value",
  ];
}

/**
 * Configure additional system fonts
 */
function _configureFonts(){
  Object.assign(CONFIG.fontDefinitions, {
    Roboto: {
      editor: true,
      fonts: [
        {urls: ["systems/daggerheart/fonts/roboto/Roboto-Regular.woff2"]},
        {urls: ["systems/daggerheart/fonts/roboto/Roboto-Bold.woff2"], weight: "bold"},
        {urls: ["systems/daggerheart/fonts/roboto/Roboto-Italic.woff2"], style: "italic"},
        {urls: ["systems/daggerheart/fonts/roboto/Roboto-BoldItalic.woff2"], weight: "bold", style: "italic"}
      ]
    },
    "Roboto Condensed": {
      editor: true,
      fonts: [
        { urls: ["systems/daggerheart/fonts/roboto-condensed/RobotoCondensed-Regular.woff2"] },
        { urls: ["systems/daggerheart/fonts/roboto-condensed/RobotoCondensed-Bold.woff2"], weight: "bold" },
        { urls: ["systems/daggerheart/fonts/roboto-condensed/RobotoCondensed-Italic.woff2"], style: "italic" },
        {
          urls: ["systems/daggerheart/fonts/roboto-condensed/RobotoCondensed-BoldItalic.woff2"], weight: "bold",
          style: "italic"
        }
      ]
    },
    "Roboto Slab": {
      editor: true,
      fonts: [
        { urls: ["systems/daggerheart/fonts/roboto-slab/RobotoSlab-Regular.ttf"] },
        { urls: ["systems/daggerheart/fonts/roboto-slab/RobotoSlab-Bold.ttf"], weight: "bold" }
      ]
    }
  })
}

/**
 * Configure system status effects
 */
