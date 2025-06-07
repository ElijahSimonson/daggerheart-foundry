import { preLocalize } from "./utils.mjs";
import * as activities from "./documents/activity/_module.mjs";
import * as advancement from "./documents/advancement/_module.mjs";
import MappingField from "./data/fields/mapping-field.mjs";
import TransformationSetting from "./data/settings/transformation-settings.mjs"
import { ConsumptionTarget } from "./data/activity/fields/consumption-targets-field.mjs"
import MapLocationControlIcon from "./canvas/map-location-control-icon.mjs"


const DAGGERHEART = {};

//ASCII Artwork
DAGGERHEART.ASCII = `
  ____    _    ____  ____ _____ ____  _   _ _____    _    ____ _____
 |  _ \\  / \\  / ___|/ ___| ____|  _ \\| | | | ____|  / \\  |  _ \\_   _|
 | | | |/ _ \\| |  _| |  _|  _| | |_) | |_| |  _|   / _ \\ | |_) || |
 | |_| / ___ \\ |_| | |_| | |___|  _ <|  _  | |___ / ___ \\|  _ < | |
 |____/_/   \\_\\____|\\____|_____|_| \\_\\_| |_|_____/_/   \\_\\_| \\_\\|_|

`;

/**
 * Configuration data for abilities.
 *
 * @typedef {object} TraitConfiguration
 * @property {string} label                               Localized label.
 * @property {string} abbreviation                        Localized abbreviation.
 * @property {string} fullKey                             Fully written key used as alternate for enrichers.
 * @property {string} [reference]                         Reference to a rule page describing this trait.
 * @property {string} [type]                              Whether this is a "physical" or "mental" trait.
 * @property {Object<string, number|string>}  [defaults]  Default values for this trait based on actor type.
 *                                                        If a string is used, the system will attempt to fetch.
 *                                                        the value of the specified trait.
 * @property {string} [icon]                              An SVG icon that represents the trait.
 */

/**
 * The set of Trait Scores used within the system.
 * @enum {TraitConfiguration}
 */

DAGGERHEART.traits = {
    agi : {
        label       : "DAGGERHEART.TraitAgi",
        abbreviation: "DAGGERHEART.TraitAgiAbbr",
        type       : "physical",
        fullKey    : "agility",
        reference : "",
        icon: ""
    },
    str: {
        label       : "DAGGERHEART.TraitAgi",
        abbreviation: "DAGGERHEART.TraitStrAbbr",
        type       : "physical",
        fullKey    : "agility",
        reference : "",
        icon: ""
    },
    fin: {
        label       : "DAGGERHEART.TraitFin",
        abbreviation: "DAGGERHEART.TraitFinAbbr",
        type       : "physical",
        fullKey    : "finesse",
        reference : "",
        icon: ""
    },
    ins: {
        label       : "DAGGERHEART.TraitIns",
        abbreviation: "DAGGERHEART.TraitInsAbbr",
        type       : "mental",
        fullKey    : "instinct",
        reference : "",
        icon: ""
    },
    pre: {
        label       : "DAGGERHEART.TraitPre",
        abbreviation: "DAGGERHEART.TraitPreAbbr",
        type       : "mental",
        fullKey    : "presence",
        reference : "",
        icon: ""
    },
    kno: {
        label       : "DAGGERHEART.TraitKno",
        abbreviation: "DAGGERHEART.TraitKnoAbbr",
        type       : "mental",
        fullKey    : "knowledge",
        reference : "",
        icon: ""
    }
};
preLocalize("traits", {keys: ["label", "abbreviation"]});

/* -------------------------------------------- */
/*  Weapon Details                              */
/* -------------------------------------------- */

/**
 * The set of types which a weapon item can take.
 * @enum {string}
 */

DAGGERHEART.weaponTypes = {
    phyMelee: "DAGGERHEART.WeaponsPhyMelee",
    phyRanged: "DAGGERHEART.WeaponsPhyRanged",
    magMelee: "DAGGERHEART.WeaponsMagMelee",
    magRanged: "DAGGERHEART.WeaponsMagRanged",
};
preLocalize("weaponTypes");

/* -------------------------------------------- */
/*  Time                                        */
/* -------------------------------------------- */

/**
 * @typedef {object} TimeUnitConfiguration
 * @property {string} label            Localized label for this unit.
 * @property {string} [counted]        Localization path for counted plural forms. Only necessary if non-supported unit
 *                                     or using non-standard name for a supported unit. List of supported units can be
 *                                     found here: https://tc39.es/ecma402/#table-sanctioned-single-unit-identifiers
 * @property {number} conversion       Conversion multiplier used to converting between units.
 * @property {boolean} [combat=false]  Is this a combat-specific time unit?
 * @property {boolean} [option=true]   Should this be available when users can select from a list of units?
 */

/**
 * Configuration for time units available to the system.
 * @enum {TimeUnitConfiguration}
 */

DAGGERHEART.timeUnits = {
    second: {
        label: "DAGGERHEART.UNITS.TIME.Second.label",
        converstion: 1/60,
        option: false
    },
    minute: {
        label: "DAGGERHEART.UNITS.TIME.Minute.label",
        conversion: 1,
    },
    hour: {
        label: "DAGGERHEART.UNITS.TIME.Hour.label",
        conversion: 60,
    },
    day: {
        label: "DAGGERHEART.UNITS.TIME.Day.label",
        conversion: 1_440,
    },
    week: {
        label: "DAGGERHEART.UNITS.TIME.Week.label",
        conversion: 10_080,
        option:false
    },
    month: {
        label: "DAGGERHEART.UNITS.TIME.Month.label",
        conversion: 43_200,
    },
    year: {
        label: "DAGGERHEART.UNITS.TIME.Year.label",
        conversion: 525_600,
    }
};
preLocalize("timeUnits", {key: "label"})

/* -------------------------------------------- */

/**
 * Time periods that accept a numeric value.
 * @enum {string}
 */
DAGGERHEART.scalarTimePeriods = new Proxy(DAGGERHEART.timeUnits, {
  get(target, prop) {
    return target[prop]?.label;
  },
  has(target, key) {
    return target[key] && target[key].option !== false;
  },
  ownKeys(target) {
    return Object.keys(target).filter(k => target[k]?.option !== false);
  }
});

/* -------------------------------------------- */

/**
 *
 * Various ways in which an item or trait can be used.
 *
 * @enum {string}
 *
 * preLocalize("traitActivationTypes");
 *
 *
 */

/**
 * @typedef ActivityActivationTypeConfig
 * @property {string} label             Localized label for the activation type.
 * @property {string} [header]          Localized label for the activation type header.
 * @property {string} [group]           Localized label for the presentational group.
 * @property {boolean} [passive=false]  Classify this item as a passive feature on NPC sheets.
 * @property {boolean} [scalar=false]   Does this activation type have a numeric value attached?
 */

/**
 * Configuration data for activation types on activities.
 * @enum {ActivityActivationTypeConfig}
 *
 *
 * preLocalize("activityActivationTypes", { key: "label" });
 */


/* -------------------------------------------- */

/**
 * @typedef {object} ActivityConsumptionTargetConfig
 * @property {string} label                                     Localized label for the target type.
 * @property {ConsumptionConsumeFunction} consume               Function used to consume according to this type.
 * @property {ConsumptionLabelsFunction} consumptionLabels      Function used to generate a hint of consumption amount.
 * @property {{value: string, label: string}[]} [scalingModes]  Additional scaling modes for this consumption type in
 *                                                              addition to the default "amount" scaling.
 * @property {boolean} [targetRequiresEmbedded]                 Use text input rather than select when not embedded.
 * @property {ConsumptionValidTargetsFunction} [validTargets]   Function for creating an array of consumption targets.
 */

/**
 * @callback ConsumptionConsumeFunction
 * @this {ConsumptionTargetData}
 * @param {ActivityUseConfiguration} config  Configuration data for the activity usage.
 * @param {ActivityUsageUpdates} updates     Updates to be performed.
 * @throws ConsumptionError
 */

/**
 * @callback ConsumptionLabelsFunction
 * @this {ConsumptionTargetData}
 * @param {ActivityUseConfiguration} config  Configuration data for the activity usage.
 * @param {object} [options={}]
 * @param {boolean} [options.consumed]       Is this consumption currently set to be consumed?
 * @returns {ConsumptionLabels}
 */

/**
 * @typedef ConsumptionLabels
 * @property {string} label      Label displayed for the consumption checkbox.
 * @property {string} hint       Hint text describing what should be consumed.
 * @property {{ type: string, message: string }} [notes]  Additional notes relating to the consumption to be performed.
 * @property {boolean} [warn]    Display a warning icon indicating consumption will fail.
 */

/**
 * @callback ConsumptionValidTargetsFunction
 * @this {ConsumptionTargetData}
 * @returns {FormSelectOption[]}
 */

/**
 * Configuration information for different consumption targets.
 * @enum {ActivityConsumptionTargetConfig}
 */

DAGGERHEART.activityConsumptionTargets = {
    activityUses:{
        label: "DAGGERHEART.CONSUMPTION.Type.ActivityUses.label",
        consume: ConsumptionTargetData.consumeActivityUses,
        consumptionLabels: ConsumptionTargetData.consumptionLabelsActivityUses
    },
    itemUses: {
        label: "DAGGERHEART.CONSUMPTION.Type.ItemUses.label",
        consume: ConsumptionTargetData.consumeItemUses,
        consumptionLabels: ConsumptionTargetData.consumptionLabelsItemUses
    },
    material: {
        label: "DAGGERHEART.CONSUMPTION.Type.Material.label",
        consume: ConsumptionTargetData.consumeMaterial,
        consumptionLabels: ConsumptionTargetData.consumptionLabelsMaterial,
        targetRequiresEmbedded: true,
        validTargets: ConsumptionTargetData.validMaterialTargets
    },
    hope: {
        label: "DAGGERHEART.CONSUMPTION.Type.Hope.label",
        consume: ConsumptionTargetData.consumeHope,
        consumptionLabels: ConsumptionTargetData.consumptionLabelsHope,
        validTargets: ConsumptionTargetData.validHopeTargets
    },
    stress: {
        label: "DAGGERHEART.CONSUMPTION.Type.Stress.label",
        consume: ConsumptionTargetData.consumeStress,
        consumptionLabels: ConsumptionTargetData.consumptionLabelsStress,
        validTargets: ConsumptionTargetData.validStressTargets
    },
    armour: {
        label: "DAGGERHEART.CONSUMPTION.Type.Armour.label",
        consume: ConsumptionTargetData.consumeArmour,
        consumptionLabels: ConsumptionTargetData.consumptionLabelsArmour,
        targetRequiresEmbedded: true,
        validTargets: ConsumptionTargetData.validArmourTargets
    },
    attribute: {
        label: "DAGGERHEART.CONSUMPTION.Type.Attribute.label",
        consume: ConsumptionTargetData.consumeAttribute,
        consumptionLabels: ConsumptionTargetData.consumptionLabelsAttribute,
        targetRequiresEmbedded: true,
        validTargets: ConsumptionTargetData.validAttributeTargets
    }
};
preLocalize("activityConsumptionTargets", {key: "label"});


/* -------------------------------------------- */
/*  Canvas                                      */
/* -------------------------------------------- */

/**
 * Colors used to visualize temporary and temporary maximum HP in token health bars.
 * @enum {number}
 */
DAGGERHEART.tokenHPColors = {
  damage: 0xFF0000,
  healing: 0x00FF00,
  temp: 0x66CCFF,
  tempmax: 0x440066,
  negmax: 0x550000
};

/* -------------------------------------------- */

/**
 * Colors used when a dynamic token ring effects.
 * @enum {number}
 */
DAGGERHEART.tokenRingColors = {
  damage: 0xFF0000,
  defeated: 0x000000,
  healing: 0x00FF00,
  temp: 0x33AAFF
};

/* -------------------------------------------- */

/**
 * Configuration data for creature types.
 *
 * @typedef {object} AdversaryTypeConfiguration
 * @property {string} label               Localized label.
 * @property {string} plural              Localized plural form used in swarm name.
 * @property {string} [reference]         Reference to a rule page describing this type.
 */

/**
 * Default types of creatures.
 * @enum {AdversaryTypeConfiguration}
 */

DAGGERHEART.adversaryTypes = {
    bruiser: {
        label: "DAGGERHEART.AdversaryBruiser",
        plural: "DAGGERHEART.AdversaryBruiserPl",
        icon: "icons/adversaries/brusier.webp",
        reference: "",
    },
    horde: {
        label: "DAGGERHEART.AdversaryHorde",
        plural: "DAGGERHEART.AdversaryHordePl",
        icon: "icons/adversaries/horde.webp",
        reference: "",
    },
    leader: {
        label: "DAGGERHEART.AdversaryLeader",
        plural: "DAGGERHEART.AdversaryLeaderPl",
        icon: "icons/adversaries/leader.webp",
        reference: "",
    },
    minions: {
        label: "DAGGERHEART.AdversaryMinions",
        plural: "DAGGERHEART.AdversaryMinionsPl",
        icon: "icons/adversaries/minions.webp",
        reference: "",
    },
    ranged: {
        label: "DAGGERHEART.AdversaryRanged",
        plural: "DAGGERHEART.AdversaryRangedPl",
        icon: "icons/adversaries/ranged.webp",
        reference: "",
    },
    skulk: {
        label: "DAGGERHEART.AdversarySkulk",
        plural: "DAGGERHEART.AdversarySkulkPl",
        icon: "icons/adversaries/skulk.webp",
        reference: "",
    },
    social: {
        label: "DAGGERHEART.AdversarySocial",
        plural: "DAGGERHEART.AdversarySocialPl",
        icon: "icons/adversaries/social.webp",
        reference: "",
    },
    solo: {
        label: "DAGGERHEART.AdversarySolo",
        plural: "DAGGERHEART.AdversarySoloPl",
        icon: "icons/adversaries/solo.webp",
        reference: "",
    },
    standard: {
        label: "DAGGERHEART.AdversaryStandard",
        plural: "DAGGERHEART.AdversaryStandardPl",
        icon: "icons/adversaries/standard.webp",
        reference: "",
    },
    support: {
        label: "DAGGERHEART.AdversarySupport",
        plural: "DAGGERHEART.AdversarySupportPl",
        icon: "icons/adversaries/support.webp",
        reference: "",
    }
}
preLocalize("adversaryTypes", {keys: ["label", "plural"], sort: true});

/* -------------------------------------------- */

/**
 * Classification types for item action types.
 * @enum {string}
 */

DAGGERHEART.itemActionTypes = {
    mwak: "DAGGERHEART.ActionMWAK",
    rwak: "DAGGERHEART.ActionRWAK",
    spell: "DAGGERHEART.ActionSpell",
    abil: "DAGGERHEART.ActionAbil",
    heal: "DAGGERHEART.ActionHeal",
    util: "DAGGERHEART.ActionUtil",
    other: "DAGGERHEART.ActionOther"
};
preLocalize("itemActionTypes");

/* -------------------------------------------- */

/* -------------------------------------------- */

/**
 * Different ways in which item capacity can be limited.
 * @enum {string}
 */
DAGGERHEART.itemCapacityTypes = {
  items: "DAGGERHEART.ItemContainerCapacityItems"
};
preLocalize("itemCapacityTypes", { sort: true });

/* -------------------------------------------- */

/**
 * List of tiers.
 * @enum {string}
 */
DAGGERHEART.tiers = {
  teir1: "DAGGERHEART.Tier1",
  tier2: "DAGGERHEART.Tier2",
  teir3: "DAGGERHEART.Tier3",
  teir4: "DAGGERHEART.Tier4",
};
preLocalize("itemRarity");

/* -------------------------------------------- */

/**
 * Configuration data for limited use periods.
 *
 * @typedef {object} LimitedUsePeriodConfiguration
 * @property {string} label                Localized label.
 * @property {string}  abbreviation        Shorthand form of the label.
 * @property {"combat"|"special"} [group]  Grouping if outside the normal "time" group.
 */

/**
 * Enumerate the lengths of time over which an item can have limited use trait.
 * @enum {LimitedUsePeriodConfiguration}
 */

DAGGERHEART.limitedUsePeriods = {
    sr: {
        label: "DAGGERHEART.USES.Period.ShortRest.label",
        abbreviation: "DAGGERHEART.USES.Period.ShortRest.Abbreviation"
    },
    lr: {
        label: "DAGGERHEART.USES.Period.LongRest.label",
        abbreviation: "DAGGERHEART.USES.Period.LongRest.Abbreviation"
    },
    day: {
        label: "DAGGERHEART.USES.Period.Day.label",
        abbreviation: "DAGGERHEART.USES.Period.Day.Abbreviation"
    },
    dusk: {
        label: "DAGGERHEART.USES.Period.Dusk.label",
        abbreviation: "DAGGERHEART.USES.Period.Dusk.Abbreviation",
    },
    session: {
        label: "DAGGERHEART.USES.Period.Session.label",
        abbreviation: "DAGGERHEART.USES.Period.Session.Abbreviation",
        group: "special"
    }
};
preLocalize("limitedUsePeriods", {keys: ["label", "abbreviation"]});

Object.defineProperty(DAGGERHEART.limitedUsePeriods, "recoveryOptions", {
    get(){
        return [
            ...Object.entries(CONFIG.DAGGERHEART.limitedUsePeriods).filter(([, config]) => !config.deprecated)
            .map(([value, {label, type}]) => ({
                value, label, group: game.i18n.localize(`DAGGERHEART.USES.Recovery.${type?.capitalize() ?? "Time"}`)
            })),
            {value: "recharge", label: game.i18n.localize("DAGGERHEART.USES.Recovery.Recharge") }

        ];
    }
});

/**
 * Common damageThresholds calculations.
 * @enum {{ label: string, [formulaMaj]: string, [formulaSev]: string }}
 */

DAGGERHEART.damageThresholds = {
    flat: {
        label: "DAGGERHEART.damageThresholdFlat",
        formulaMaj: "@attributes.level",
        formulaSev: "@attributes.level * 2"
    },
    default: {
        label: "DAGGERHEART.damageThresholdDefault",
        formulaMaj: "@attributes.level + @attributes.armor.majThreshold",
        formulaSev: "@attributes.level + @attributes.armor.sevThreshold"
    }
};
preLocalize("damageThresholds", {key: "label"});


/* -------------------------------------------- */

/**
 * Configuration data for an items that have sub-types.
 *
 * @typedef {object} SubtypeTypeConfiguration
 * @property {string} label                       Localized label for this type.
 * @property {Record<string, string>} [subtypes]  Enum containing localized labels for subtypes.
 */

/**
 * Enumerate the valid consumable types which are recognized by the system.
 * @enum {SubtypeTypeConfiguration}
 */

DAGGERHEART.consumableTypes = {
    ammo: {
        label: "DAGGERHEART.CONSUMABLE.Type.Ammunition.Label",
        subtypes: {
            arrow: "DAGGERHEART.CONSUMABLE.Type.Ammunition.Arrow",
            crossbowBolt: "DAGGERHEART.CONSUMABLE.Type.Ammunition.Bolt",
            firearmBullet: "DAGGERHEART.CONSUMABLE.Type.Ammunition.BulletFirearm",
            slingBullet: "DAGGERHEART.CONSUMABLE.Type.Ammunition.BulletSling",
        },
        potion:{
            label: "DAGGERHEART.CONSUMABLE.Type.Potion.Label",
        },
        food: {
            label: "DAGGERHEART.CONSUMABLE.Type.Food.Label",
        }
    }
};
preLocalize("consumableTypes", {key:"label", sort: true});
preLocalize("consumableTypes.ammo.subtypes", {sort: true});

/**
 * Types of containers.
 * @enum {string}
 */
DAGGERHEART.contianerTypes = {
    backpack: {},
    barrel: {},
    basket: {},
    bottle: {},
    bucket: {},
    case: {},
    chest: {},
    saddlebag: {},
    vial: {},
};

DAGGERHEART.domains = {
    arcana: "DAGGERHEART.Feature.class.Arcana",
    blade: "DAGGERHEART.Feature.class.Blade",
    bone: "DAGGERHEART.Feature.class.Bone",
    codex: "DAGGERHEART.Feature.class.Codex",
    grace: "DAGGERHEART.Feature.class.Grace",
    midnight: "DAGGERHEART.Feature.class.Midnight",
    sage: "DAGGERHEART.Feature.class.Sage",
    splendor: "DAGGERHEART.Feature.class.Splendor",
    valor: "DAGGERHEART.Feature.class.Valor",
}
preLocalize("domains", {key: "label"});

/* -------------------------------------------- */

/**
 * Types of "features" items.
 * @enum {SubtypeTypeConfiguration}
 */

DAGGERHEART.featureTypes = {
    domain: {
        label: "DAGGERHEART.Feature.domain",
        subtypes: {
            ...DAGGERHEART.domains
        }
    },
    class: {
        label: "DAGGERHEART.Feature.class",
    },
    ancestory: {
        label: "DAGGERHEART.Feature.ancestory"
    },
    community: {
        label: "DAGGERHEART.Feature.community"
    }
}
preLocalize("featureTypes", {key: label});
preLocalize("featureTypes.domain.subtupes", {sort: true});

/* -------------------------------------------- */

/**
 * Configuration data for item properties.
 *
 * @typedef {object} ItemPropertyConfiguration
 * @property {string} label           Localized label.
 * @property {string} [abbreviation]  Localized abbreviation.
 * @property {string} [icon]          Icon that can be used in certain places to represent this property.
 * @property {string} [reference]     Reference to a rule page describing this property.
 * @property {boolean} [isPhysical]   Is this property one that can cause damage resistance bypasses?
 * @property {boolean} [isTag]        Is this spell property a tag, rather than a component?
 */

/**
 * The various properties of all item types.
 * @enum {ItemPropertyConfiguration}
 */

DAGGERHEART.itemProperties = {
    ammmo: {
        label: "DAGGERHEART.ITEM.Property.Ammunition"
    },
    massive: {
        label: "DAGGERHEART.ITEM.Property.Massive",
    },
    heavy: {
        label: "DAGGERHEART.ITEM.Property.Heavy",
    },
    quick: {
        label: "DAGGERHEART.ITEM.Property.Quick",
    },
    cumbersome: {
        label: "DAGGERHEART.ITEM.Property.Cumbersome",
    },
    returning: {
        label: "DAGGERHEART.ITEM.Property.Returning"
    },
    versatile: {
        label: "DAGGERHEART.ITEM.Property.Versatile",
    },
    powerful: {
        label: "DAGGERHEART.ITEM.Property.Powerful",
    },
    brutal: {
        label: "DAGGERHEART.ITEM.Property.Brutal",
    },
    deadly: {
        label: "DAGGERHEART.ITEM.Property.Deadly",
    },
    scary: {
        label: "DAGGERHEART.ITEM.Property.Scary",
    },
    reliable: {
        label: "DAGGERHEART.ITEM.Property.Reliable",
    },
    pompous: {
        label: "DAGGERHEART.ITEM.Property.Pompous",
    },
    eruptive: {
        label: "DAGGERHEART.ITEM.Property.Eruptive",
    },
    invigorate: {
        label: "DAGGERHEART.ITEM.Property.Invigorating",
    },
    persuasive: {
        label: "DAGGERHEART.ITEM.Property.Persuasive",
    },
    sharpwing: {
        label: "DAGGERHEART.ITEM.Property.Sharpwing",
    },
    devastating: {
        label: "DAGGERHEART.ITEM.Property.Devastating",
    },
    brave: {
        label: "DAGGERHEART.ITEM.Property.Brave",
    },
    dueling: {
        label: "DAGGERHEART.ITEM.Property.Dueling",
    },
    retractable: {
        label: "DAGGERHEART.ITEM.Property.Retractable",
    },
    reload: {
        label: "DAGGERHEART.ITEM.Property.Reloading",
    },
    lucky: {
        label: "DAGGERHEART.ITEM.Property.Lucky",
    },
    otherworld: {
        label: "DAGGERHEART.ITEM.Property.Otheworldly",
    },
    painful: {
        label: "DAGGERHEART.ITEM.Property.Painful",
    },
    timebend: {
        label: "DAGGERHEART.ITEM.Property.Timebending",
    },
    selfcorrect: {
        label: "DAGGERHEART.ITEM.Property.SelfCorrecting",
    },
    burning: {
        label: "DAGGERHEART.ITEM.Property.Burning",
    },
    concuss: {
        label: "DAGGERHEART.ITEM.Property.Concussive",
    },
    destruct: {
        label: "DAGGERHEART.ITEM.Property.Destructive",
    },
    serrated: {
        label: "DAGGERHEART.ITEM.Property.Serrated",
    },
    long: {
        label: "DAGGERHEART.ITEM.Property.Long",
    },
    grapple: {
        label: "DAGGERHEART.ITEM.Property.Grappling",
    },
    bouncing: {
        label: "DAGGERHEART.ITEM.Property.Bouncing",
    },
    hot: {
        label: "DAGGERHEART.ITEM.Property.Hot",
    },
    lifesteal: {
        label: "DAGGERHEART.ITEM.Property.LifeStealing",
    },
    greedy: {
        label: "DAGGERHEART.ITEM.Property.Greedy",
    },
    bonded: {
        label: "DAGGERHEART.ITEM.Property.Bonded",
    },
    barrier: {
        label: "DAGGERHEART.ITEM.Property.Barrier",
    },
    pair: {
        label: "DAGGERHEART.ITEM.Property.Paired",
    },
    startling: {
        label: "DAGGERHEART.ITEM.Property.Startling",
    },
    hooked: {
        label: "DAGGERHEART.ITEM.Property.Hooked",
    },
    dooubleduty: {
        label: "DAGGERHEART.ITEM.Property.DoubleDuty",
    },
    parry: {
        label: "DAGGERHEART.ITEM.Property.Parry",
    },
    shelter: {
        label: "DAGGERHEART.ITEM.Property.Sheltering",
    },
    doubleup: {
        label: "DAGGERHEART.ITEM.Property.DoubledUp",
    },
    lockedon: {
        label: "DAGGERHEART.ITEM.Property.LockedOn",
    },
    flexible: {
        label: "DAGGERHEART.ITEM.Property.Flexible",
    },
    vheavy: {
        label: "DAGGERHEART.ITEM.Property.VeryHeavy",
    },
    warded: {
        label: "DAGGERHEART.ITEM.Property.Warded",
    },
    resilient: {
        label: "DAGGERHEART.ITEM.Property.Resilient",
    },
    reinforced: {
        label: "DAGGERHEART.ITEM.Property.Reinforced",
    },
    shifting: {
        label: "DAGGERHEART.ITEM.Property.Shifting",
    },
    quiet: {
        label: "DAGGERHEART.ITEM.Property.Quiet",
    },
    hopeful: {
        label: "DAGGERHEART.ITEM.Property.Hopeful",
    },
    timesave: {
        label: "DAGGERHEART.ITEM.Property.TimeSaving",
    },
    inpenetrable: {
        label: "DAGGERHEART.ITEM.Property.Inpenetrable",
    },
    sharp: {
        label: "DAGGERHEART.ITEM.Property.Sharp",
    },
    physical: {
        label: "DAGGERHEART.ITEM.Property.Physical",
    },
    magical: {
        label: "DAGGERHEART.ITEM.Property.Magical",
    },
    channeling: {
        label: "DAGGERHEART.ITEM.Property.Channeling",
    },
    fortified: {
        label: "DAGGERHEART.ITEM.Property.Fortified",
    },
    truthseek: {
        label: "DAGGERHEART.ITEM.Property.TruthSeeking",
    },
    difficult: {
        label: "DAGGERHEART.ITEM.Property.Difficult",
    },
    weightlessContents: {
        label: "DAGGERHEART.ITEM.Property.WeightlessContents",
    },
    protective: {
        label: "DAGGERHEART.ITEM.Property.Protective",
    },
    heal: {
        label: "DAGGERHEART.ITEM.Property.Healing",
    }
};
preLocalize("itemProperties", {keys: ["label", "abbreviation"], sort: true});

DAGGERHEART.validProperties = {
    weapon: new Set([
        "reliable",
        "massive",
        "heavy",
        "quick",
        "cumbersome",
        "returning",
        "versatile",
        "powerful",
        "brutal",
        "deadly",
        "scary",
        "reliable",
        "reload",
        "pompous",
        "eruptive",
        "invigorate",
        "persuasive",
        "sharpwing",
        "devastating",
        "protective",
        "brave",
        "dueling",
        "retractable",
        "brutal",
        "lucky",
        "healing",
        "otherworld",
        "painful",
        "timebend",
        "selfcorrect",
        "burning",
        "concuss",
        "destruct",
        "serrated",
        "long",
        "grapple",
        "bouncing",
        "hot",
        "lifesteal",
        "greedy",
    ]),
    armor: new Set([
        "flexible",
        "heavy",
        "vheavy",
        "warded",
        "resilient",
        "reinforced",
        "shifting",
        "quiet",
        "hopeful",
        "gilded",
        "inpenetrable",
        "sharp",
        "physical",
        "magical",
        "painful",
        "timeslow",
        "channeling",
        "burning",
        "fortified",
        "truthseek",
        "difficult",
    ]),
    container: new Set([
        "weightlessContents",
    ])
};

/* -------------------------------------------- */

/**
 * @typedef {object} CurrencyConfiguration
 * @property {string} label         Localized label for the currency.
 * @property {string} abbreviation  Localized abbreviation for the currency.
 * @property {number} conversion    Number by which this currency should be multiplied to arrive at a standard value.
 * @property {string} icon          Icon representing the currency in the interface.
 */

/**
 * The valid currency denominations with localized labels, abbreviations, and conversions.
 * The conversion number defines how many of that currency are equal to one GP.
 * @enum {CurrencyConfiguration}
 */

DAGGERHEART.currencies = {
    coin: {
        label: "DAGGERHEART.CurrencyCoin",
        conversion: 1/10,
        icon: "systems/dnd5e/icons/currencies/coin.webp",
    },
    handful: {
        label: "DAGGERHEART.CurrencyHandful",
        conversion: 1,
        icon: "systems/dnd5e/icons/currencies/handful.webp",
    },
    bag: {
        label: "DAGGERHEART.CurrencyBag",
        conversion: 10,
        icon: "systems/dnd5e/icons/currencies/bag.webp",
    },
    chest: {
        label: "DAGGERHEART.CurrencyChest",
        conversion: 100,
        icon: "systems/dnd5e/icons/currencies/chest.webp",
    }
};
preLocalize("currencies", {key: "label"});

/* -------------------------------------------- */
/*  Damage                                      */
/* -------------------------------------------- */

/**
 * Standard dice spread available for things like damage.
 * @type {number[]}
 */
DAGGERHEART.dieSteps = [4, 6, 8, 10, 12, 20, 100];

/**
 * Configuration data for damage types.
 *
 * @typedef {object} DamageTypeConfiguration
 * @property {string} label          Localized label.
 * @property {string} icon           Icon representing this type.
 * @property {boolean} [isPhysical]  Is this a type that can be bypassed by magical or silvered weapons?
 * @property {string} [reference]    Reference to a rule page describing this damage type.
 * @property {Color} [color]         Visual color of the damage type.
 */

/**
 * Types of damage the can be caused by abilities.
 * @enum {DamageTypeConfiguration}
 */

DAGGERHEART.damageTypes = {
    magical: {
        label: "DAGGERHEART.DamageMagical",
        icon: "systems/dnd5e/icons/svg/damage/magical.svg",
        color: new Color(d3b245)
    },
    physical: {
        label: "DAGGERHEART.DamagePhysical",
        icon: "systems/dnd5e/icons/svg/damage/physical.svg",
        color: new Color(b0b0b0)
    }
};
preLocalize("damageTypes", {key: "label", sort: true});

/**
 * Different types of healing that can be applied using abilities.
 * @enum {string}
 */

DAGGERHEART.healingTypes = {
    healing: {
        label: "DAGGERHEART.Healing",
        icon: "systems/dnd5e/icons/svg/damage/healing.svg",
        color: new Color(0x46C252)
    }
};
preLocalize("healingTypes", {key: "label"});

/* -------------------------------------------- */
/*  Measurement                                 */
/* -------------------------------------------- */

/**
 * Default units used for imperial & metric settings.
 * @enum {{ imperial: string, metric: string }}
 */
DAGGERHEART.defaultUnits = {
  length: {
    imperial: "ft",
    metric: "m"
  },
  volume: {
    imperial: "cubicFoot",
    metric: "liter"
  },
  weight: {
    imperial: "lb",
    metric: "kg"
  }
};

/* -------------------------------------------- */

/**
 * @typedef {object} UnitConfiguration
 * @property {string} label              Localized label for the unit.
 * @property {string} abbreviation       Localized abbreviation for the unit.
 * @property {number} conversion         Multiplier used to convert between various units.
 * @property {string} [counted]          Localization path for counted plural forms in various unit display modes.
 *                                       Only necessary if non-supported unit or using a non-standard name for a
 *                                       supported unit.
 * @property {string} [formattingUnit]   Unit formatting value as supported by javascript's internationalization system:
 *                                       https://tc39.es/ecma402/#table-sanctioned-single-unit-identifiers. Only
 *                                       required if the formatting name doesn't match the unit key.
 * @property {"imperial"|"metric"} type  Whether this is an "imperial" or "metric" unit.
 */

/**
 * The valid units of measure for movement distances in the game system.
 * By default this uses the imperial units of feet and miles.
 * @enum {string}
 */
DAGGERHEART.movementUnits = {
  ft: {
    label: "DAGGERHEART.UNITS.DISTANCE.Foot.Label",
    abbreviation: "DAGGERHEART.UNITS.DISTANCE.Foot.Abbreviation",
    conversion: 1,
    formattingUnit: "foot",
    type: "imperial"
  },
  mi: {
    label: "DAGGERHEART.UNITS.DISTANCE.Mile.Label",
    abbreviation: "DAGGERHEART.UNITS.DISTANCE.Mile.Abbreviation",
    conversion: 5_280,
    formattingUnit: "mile",
    type: "imperial"
  },
  m: {
    label: "DAGGERHEART.UNITS.DISTANCE.Meter.Label",
    abbreviation: "DAGGERHEART.UNITS.DISTANCE.Meter.Abbreviation",
    conversion: 10 / 3, // Use a simplified 5ft -> 1.5m conversion.
    formattingUnit: "meter",
    type: "metric"
  },
  km: {
    label: "DAGGERHEART.UNITS.DISTANCE.Kilometer.Label",
    abbreviation: "DAGGERHEART.UNITS.DISTANCE.Kilometer.Abbreviation",
    conversion: 10_000 / 3, // Matching simplified conversion
    formattingUnit: "kilometer",
    type: "metric"
  }
};
preLocalize("movementUnits", { keys: ["label", "abbreviation"] });

/**
 * The types of range that are used for measuring actions and effects.
 * @enum {string}
 */
DAGGERHEART.rangeTypes = {
    melee: "DAGGERHEART.DistMelee",
    vclose: "DAGGERHEART.DistVClose",
    close: "DAGGERHEART.DistClose",
    far: "DAGGERHEART.DistFar",
    vfar: "DAGGERHEART.DistVFar",
    out: "DAGGERHEART.DistOut",
};
preLocalize("rangeTypes");

/**
 * The valid units for measurement of volume.
 * @enum {UnitConfiguration}
 */
DAGGERHEART.volumeUnits = {
  cubicFoot: {
    label: "DAGGERHEART.UNITS.VOLUME.CubicFoot.Label",
    abbreviation: "DAGGERHEART.UNITS.Volume.CubicFoot.Abbreviation",
    counted: "DAGGERHEART.UNITS.Volume.CubicFoot.Counted",
    conversion: 1,
    type: "imperial"
  },
  liter: {
    label: "DAGGERHEART.UNITS.VOLUME.Liter.Label",
    abbreviation: "DAGGERHEART.UNITS.Volume.Liter.Abbreviation",
    conversion: 1 / 28.317,
    type: "metric"
  }
};
preLocalize("volumeUnits", { keys: ["label", "abbreviation"] });

/**
 * The valid units for measurement of weight.
 * @enum {UnitConfiguration}
 */
DAGGERHEART.weightUnits = {
  lb: {
    label: "DAGGERHEART.UNITS.WEIGHT.Pound.Label",
    abbreviation: "DAGGERHEART.UNITS.WEIGHT.Pound.Abbreviation",
    conversion: 1,
    formattingUnit: "pound",
    type: "imperial"
  },
  tn: {
    label: "DAGGERHEART.UNITS.WEIGHT.Ton.Label",
    abbreviation: "DAGGERHEART.UNITS.WEIGHT.Ton.Abbreviation",
    counted: "DAGGERHEART.UNITS.WEIGHT.Ton.Counted",
    conversion: 2000,
    type: "imperial"
  },
  kg: {
    label: "DAGGERHEART.UNITS.WEIGHT.Kilogram.Label",
    abbreviation: "DAGGERHEART.UNITS.WEIGHT.Kilogram.Abbreviation",
    conversion: 2.5,
    formattingUnit: "kilogram",
    type: "metric"
  }
};
preLocalize("weightUnits", { keys: ["label", "abbreviation"] });

/* -------------------------------------------- */
/*  Targeting                                   */
/* -------------------------------------------- */

/**
 * @typedef {object} IndividualTargetDefinition
 * @property {string} label           Localized label for this type.
 * @property {string} [counted]       Localization path for counted plural forms. Only necessary for scalar types.
 * @property {boolean} [scalar=true]  Can this target take an associated numeric value?
 */

/**
 * Targeting types that apply to one or more distinct targets.
 * @enum {IndividualTargetDefinition}
 */
DAGGERHEART.individualTargetTypes = {
  self: {
    label: "DAGGERHEART.TARGET.Type.Self.Label",
    scalar: false
  },
  ally: {
    label: "DAGGERHEART.TARGET.Type.Ally.Label",
    counted: "DAGGERHEART.TARGET.Type.Ally.Counted"
  },
  enemy: {
    label: "DAGGERHEART.TARGET.Type.Enemy.Label",
    counted: "DAGGERHEART.TARGET.Type.Enemy.Counted"
  },
  creature: {
    label: "DAGGERHEART.TARGET.Type.Creature.Label",
    counted: "DAGGERHEART.TARGET.Type.Creature.Counted"
  },
  object: {
    label: "DAGGERHEART.TARGET.Type.Object.Label",
    counted: "DAGGERHEART.TARGET.Type.Object.Counted"
  },
  space: {
    label: "DAGGERHEART.TARGET.Type.Space.Label",
    counted: "DAGGERHEART.TARGET.Type.Space.Counted"
  },
  creatureOrObject: {
    label: "DAGGERHEART.TARGET.Type.CreatureOrObject.Label",
    counted: "DAGGERHEART.TARGET.Type.CreatureOrObject.Counted"
  },
  any: {
    label: "DAGGERHEART.TARGET.Type.Any.Label",
    counted: "DAGGERHEART.TARGET.Type.Target.Counted"
  },
  willing: {
    label: "DAGGERHEART.TARGET.Type.WillingCreature.Label",
    counted: "DAGGERHEART.TARGET.Type.WillingCreature.Counted"
  }
};
preLocalize("individualTargetTypes", { key: "label" });

/* -------------------------------------------- */

/**
 * Information needed to represent different area of effect target types.
 *
 * @typedef {object} AreaTargetDefinition
 * @property {string} label        Localized label for this type.
 * @property {string} counted      Localization path for counted plural forms.
 * @property {string} template     Type of `MeasuredTemplate` create for this target type.
 * @property {string} [reference]  Reference to a rule page describing this area of effect.
 * @property {string[]} [sizes]    List of available sizes for this template. Options are chosen from the list:
 *                                 "radius", "width", "height", "length", "thickness". No more than 3 dimensions
 *                                 may be specified.
 * @property {boolean} [standard]  Is this a standard area of effect as defined explicitly by the rules?
 */

/**
 * Targeting types that cover an area.
 * @enum {AreaTargetDefinition}
 */
DAGGERHEART.areaTargetTypes = {
  circle: {
    label: "DAGGERHEART.TARGET.Type.Circle.Label",
    counted: "DAGGERHEART.TARGET.Type.Circle.Counted",
    template: "circle",
    sizes: ["radius"]
  },
  cone: {
    label: "DAGGERHEART.TARGET.Type.Cone.Label",
    counted: "DAGGERHEART.TARGET.Type.Cone.Counted",
    template: "cone",
    reference: "",
    sizes: ["length"],
    standard: true
  },
  cube: {
    label: "DAGGERHEART.TARGET.Type.Cube.Label",
    counted: "DAGGERHEART.TARGET.Type.Cube.Counted",
    template: "rect",
    reference: "",
    sizes: ["width"],
    standard: true
  },
  cylinder: {
    label: "DAGGERHEART.TARGET.Type.Cylinder.Label",
    counted: "DAGGERHEART.TARGET.Type.Cylinder.Counted",
    template: "circle",
    reference: "",
    sizes: ["radius", "height"],
    standard: true
  },
  line: {
    label: "DAGGERHEART.TARGET.Type.Line.Label",
    counted: "DAGGERHEART.TARGET.Type.Line.Counted",
    template: "ray",
    reference: "",
    sizes: ["length", "width"],
    standard: true
  },
  radius: {
    label: "DAGGERHEART.TARGET.Type.Emanation.Label",
    counted: "DAGGERHEART.TARGET.Type.Emanation.Counted",
    template: "circle",
    standard: true
  },
  sphere: {
    label: "DAGGERHEART.TARGET.Type.Sphere.Label",
    counted: "DAGGERHEART.TARGET.Type.Sphere.Counted",
    template: "circle",
    reference: "",
    sizes: ["radius"],
    standard: true
  },
  square: {
    label: "DAGGERHEART.TARGET.Type.Square.Label",
    counted: "DAGGERHEART.TARGET.Type.Square.Counted",
    template: "rect",
    sizes: ["width"]
  },
  wall: {
    label: "DAGGERHEART.TARGET.Type.Wall.Label",
    counted: "DAGGERHEART.TARGET.Type.Wall.Counted",
    template: "ray",
    sizes: ["length", "thickness", "height"]
  }
};
preLocalize("areaTargetTypes", { key: "label", sort: true });

Object.defineProperty(DAGGERHEART, "areaTargetOptions", {
  get() {
    const { primary, secondary } = Object.entries(this.areaTargetTypes).reduce((obj, [value, data]) => {
      const entry = { value, label: data.label };
      if ( data.standard ) obj.primary.push(entry);
      else obj.secondary.push(entry);
      return obj;
    }, { primary: [], secondary: [] });
    return [{ value: "", label: "" }, ...primary, { rule: true }, ...secondary];
  }
});

/**
 * The types of single or area targets which can be applied to abilities.
 * @enum {string}
 */
DAGGERHEART.targetTypes = {
  ...Object.fromEntries(Object.entries(DAGGERHEART.individualTargetTypes).map(([k, v]) => [k, v.label])),
  ...Object.fromEntries(Object.entries(DAGGERHEART.areaTargetTypes).map(([k, v]) => [k, v.label]))
};
preLocalize("targetTypes", { sort: true });

/**
 * Configuration data for rest types.
 *
 * @typedef {object} RestConfiguration
 * @property {Record<string, number>} duration      Duration of different rest variants in minutes.
 * @property {string} label                         Localized label for the rest type.
 * @property {string[]} [activationPeriods]         Activation types that should be displayed in the chat card.
 * @property {number} [NumberMoves]            Number of moves that can be used during this rest type.
 * @property {boolean} [SwapDomainCards] Can domain cards be swapped during this rest type?
 * @property {boolean} [TendWounds]   Is tending wounds an option for this rest type?
 * @property {string} [TendWoundsFormula]  Formula to use when tending wounds during this rest type.
 * @property {boolean} [ClearStress]  Is clearing rest an option for this rest type?
 * @property {string} [ClearStressFormula]  Formula to use when clearing stress during this rest type.
 * @property {boolean} [RepairArmor]  Is repairing armor an option for this rest type?
 * @property {string} [RepairArmorFormula]  Formula to use when repairing armor during this rest type.
 * @property {boolean} [CanPrepare] Can use prepare action.
 * @property {boolean} [WorkProject]  Can work on projects during this rest type?
 * @property {string[]} [recoverPeriods]            What recovery periods should be applied when this rest is taken. The
 *                                                  ordering of the periods determines which is applied if more than one
 *                                                  recovery profile is found.
 */

/**
 * Types of rests.
 * @enum {RestConfiguration}
 */

DAGGERHEART.restTypes = {
    short: {
        duration: {
            normal: 60
        },
        label: "DAGGERHEART.REST.Short.Label",
        activationPeriods: ["shortRest"],
        NumberMoves: 2,
        recoverPeriods: ["sr"],
        SwapDomainCards: true,
        TendWounds: true,
        TendWoundsFormula: "1d4 + @attributes.tier",
        ClearStress: true,
        ClearStressFormula: "1d4 + @attributes.tier",
        RepairArmor: true,
        RepairArmorFormula: "1d4 + @attributes.tier",
        CanPrepare: true,
        WorkProject: false,
    },
    long: {
        duration: {
            normal: 480
        },
        label: "DAGGERHEART.REST.Long.Label",
        activationPeriods: ["longRest"],
        NumberMoves: 2,
        recoverPeriods: ["lr", "sr"],
        SwapDomainCards: true,
        TendWounds: true,
        TendWoundsFormula: "@attributes.hp.max",
        ClearStress: true,
        ClearStressFormula: "@attributes.stress.max",
        RepairArmor: true,
        RepairArmorFormula: "@attributes.armor.max",
        CanPrepare: true,
        WorkProject: true,
    }
};
preLocalize("restTypes", {key: "label"});

/**
 * Attack modes available for weapons.
 * @enum {string}
 */
DAGGERHEART.attackModes = Object.seal({
  oneHanded: {
    label: "DAGGERHEART.ATTACK.Mode.OneHanded"
  },
  twoHanded: {
    label: "DAGGERHEART.ATTACK.Mode.TwoHanded"
  },
  ranged: {
    label: "DAGGERHEART.ATTACK.Mode.Ranged"
  },
  thrown: {
    label: "DAGGERHEART.ATTACK.Mode.Thrown"
  }
});
preLocalize("attackModes", { key: "label" });

/* -------------------------------------------- */

/**
 * Types of attacks based on range.
 * @enum {{ label: string }}
 */
DAGGERHEART.attackTypes = Object.seal({
  melee: {
    label: "DAGGERHEART.ATTACK.Type.Melee"
  },
  ranged: {
    label: "DAGGERHEART.ATTACK.Type.Ranged"
  }
});
preLocalize("attackTypes", { key: "label" });

/* -------------------------------------------- */

/**
 * Compendium packs used for localized items.
 * @enum {string}
 */
DAGGERHEART.sourcePacks = {
  COMMUNITIES: "daggerheart.communities",
  CLASSES: "daggerheart.classes",
  ITEMS: "daggerheart.items",
  ANCESTRIES: "daggerheart.ancestries"
};

/**
 * @import { TransformationSettingData } from "./data/settings/transformation-setting.mjs";
 */

/**
 * @typedef TransformationConfiguration
 * @property {Record<string, TransformationFlagConfiguration>} effects
 * @property {Record<string, TransformationFlagConfiguration>} keep
 * @property {Record<string, TransformationFlagConfiguration>} merge
 * @property {Record<string, TransformationFlagConfiguration>} others
 * @property {Record<string, TransformationPresetConfiguration} presets
 */

/**
 * @typedef TransformationFlagConfiguration
 * @property {string} label         Localized label for the flag.
 * @property {string} [hint]        Localized hint for the flag.
 * @property {boolean} [default]    This should be part of the default transformation settings.
 * @property {string[]} [disables]  Names of specific settings to disable, or whole categories if an `*` is used.
 */

/**
 * @typedef TransformationPresetConfiguration
 * @property {string} icon                         Icon representing this preset on the button.
 * @property {string} label                        Localized label for the preset.
 * @property {TransformationSettingData} settings  Options that will be set for the preset.
 */

/**
 * Settings that configuration how actors are changed when transformation is applied.
 * @typedef {TransformationConfiguration}
 */

DAGGERHEART.transformation = {
    effects: {
        all: {
            label: "DAGGERHEART.TRANSFORM.Setting.Effects.All.label",
            hint: "DAGGERHEART.TRANSFORM.Setting.Effects.All.hint",
            disables: ["effects.*"]
        },
        origin: {
            label: "DAGGERHEART.TRANSFORM.Setting.Effects.Origin.label",
            hint: "DAGGERHEART.TRANSFORM.Setting.Effects.Origin.hint",
            default: true
        },
        background: {
            label: "DAGGERHEART.TRANSFORM.Setting.Effects.Background.label",
            hint: "DAGGERHEART.TRANSFORM.Setting.Effects.Background.hint",
            default: true
        },
        otherOrigin: {
            label: "DAGGERHEART.TRANSFORM.Setting.Effects.OtherOrigin.label",
            hint: "DAGGERHEART.TRANSFORM.Setting.Effects.OtherOrigin.hint",

        },
        class: {
            label: "DAGGERHEART.TRANSFORM.Setting.Effects.Class.label",
            default: true,
        },
        equipment: {
            label: "DAGGERHEART.TRANSFORM.Setting.Effects.Equipment.label",
            default: true
        }
    },
    keep: {
        physical: {
            label: "DAGGERHEART.TRANSFORM.Setting.Keep.Physical.label",
            hint: "DAGGERHEART.TRANSFORM.Setting.Keep.Physical.hint",
        },
        mental: {
            label: "DAGGERHEART.TRANSFORM.Setting.Keep.Mental.label",
            hint: "DAGGERHEART.TRANSFORM.Setting.Keep.Mental.hint",
        },
        class: {
            label: "DAGGERHEART.TRANSFORM.Setting.Keep.Class.label",
        },
        items: {
            label: "DAGGERHEART.TRANSFORM.Setting.Keep.Items.label",
        },
        bio: {
            label: "DAGGERHEART.TRANSFORM.Setting.Keep.Bio.label",
        },
        hp: {
            label: "DAGGERHEART.TRANSFORM.Setting.Keep.Health.label",
        },
            self: {
            label: "DAGGERHEART.TRANSFORM.Setting.Self.label",
            hint: "DAGGERHEART.TRANSFORM.Setting.Self.hint",
            disables: ["keep.*"]
        }
    },
    others: {},
    presets: {
        beastform: {
            icon: '<i class="fas fa-paw"></i>',
            label: "DAGGERHEART.TRANSFORM.Preset.Beastform.label",
            settings: {
                effects: new Set([]),
                keep: new Set([]),
                tempFormula: "@attributes.evasion + @source.attributes.evasion.bonus"
            }
        }
    }
}
preLocalize("transformation.effects", { keys: ["label", "hint"] });
preLocalize("transformation.keep", { keys: ["label", "hint"] });
preLocalize("transformation.other", { keys: ["label", "hint"], sort: true });
preLocalize("transformation.presets", { key: "label", sort: true });

/**
 * The amount of cover provided by an object. In cases where multiple pieces
 * of cover are in play, we take the highest value.
 * @enum {string}
 */
DAGGERHEART.cover = {
  0: "DAGGERHEART.None",
  .5: "DAGGERHEART.CoverHalf",
  .75: "DAGGERHEART.CoverThreeQuarters",
  1: "DAGGERHEART.CoverTotal"
};
preLocalize("cover");

/**
 * A selection of actor and item attributes that are valid targets for item resource consumption.
 * @type {string[]}
 */
DAGGERHEART.consumableResources = [
  // Configured during init.
];

/**
 * @typedef {object} _StatusEffectConfig
 * @property {string} img               Image used to represent the condition on the token.
 * @property {string} [reference]       UUID of a journal entry with details on this condition.
 * @property {string} [special]         Set this condition as a special status effect under this name.
 */

/**
 * Configuration data for system status effects.
 * @typedef {Omit<StatusEffectConfig, "img"> & _StatusEffectConfig} StatusEffectConfig
 */

/**
 * @typedef {object} _ConditionConfiguration
 * @property {string} name         Localized name for the condition.
 */

/**
 * Configuration data for system conditions.
 * @typedef {Omit<StatusEffectConfig, "name"> & _ConditionConfiguration} ConditionConfiguration
 */

/**
 * Conditions that can affect an actor.
 * @enum {ConditionConfiguration}
 */

DAGGERHEART.conditionTypes = {
    hidden: {
        name: "DAGGERHEART.ConHidden",
        img: "systems/dnd5e/icons/svg/statuses/hidden.svg",
        reference: ""
    },
    restrained: {
        name: "DAGGERHEART.ConRestrained",
        img:  "systems/dnd5e/icons/svg/statuses/restrained.svg",
        reference: ""
    },
    vulnerable: {
        name: "DAGGERHEART.ConVunerable",
        img: "systems/dnd5e/icons/svg/statuses/vulnerable.svg",
        reference: ""
    }
};
preLocalize("conditionTypes", { key: "name", sort: true });

/**
 * Extra status effects not specified in `conditionTypes`. If the ID matches a core-provided effect, then this
 * data will be merged into the core data.
 * @enum {Omit<StatusEffectConfig, "img"> & { icon: string }}
 */
DAGGERHEART.statusEffects = {
    coverHalf: {
    name: "EFFECT.DAGGERHEART.StatusHalfCover",
    img: "systems/dnd5e/icons/svg/statuses/cover-half.svg",
    order: 2,
    exclusiveGroup: "cover",
    coverBonus: 2
  },
  coverThreeQuarters: {
    name: "EFFECT.DAGGERHEART.StatusThreeQuartersCover",
    img: "systems/dnd5e/icons/svg/statuses/cover-three-quarters.svg",
    order: 3,
    exclusiveGroup: "cover",
    coverBonus: 5
  },
  coverTotal: {
    name: "EFFECT.DAGGERHEART.StatusTotalCover",
    img: "systems/dnd5e/icons/svg/statuses/cover-total.svg",
    order: 4,
    exclusiveGroup: "cover"
  },
  dead: {
    name: "EFFECT.DAGGERHEART.StatusDead",
    img: "systems/dnd5e/icons/svg/statuses/dead.svg",
    special: "DEFEATED",
    order: 1
  },
  flying: {
    name: "EFFECT.DAGGERHEART.StatusFlying",
    img: "systems/dnd5e/icons/svg/statuses/flying.svg",
    special: "FLY"
  },
  marked: {
    name: "EFFECT.DAGGERHEART.StatusMarked",
    img: "systems/dnd5e/icons/svg/statuses/marked.svg"
  },
};

/* -------------------------------------------- */

/**
 * Configuration for the special bloodied status effect.
 * @type {{ name: string, icon: string, threshold: number }}
 */
DAGGERHEART.bloodied = {
  name: "EFFECT.DAGGERHEART.StatusBloodied",
  img: "systems/dnd5e/icons/svg/statuses/bloodied.svg",
  threshold: .5
};

/**
 * Maximum allowed character level.
 * @type {number}
 */
DAGGERHEART.maxLevel = 10;

/* -------------------------------------------- */

/**
 * Flags allowed on actors. Any flags not in the list may be deleted during a migration.
 * @type {string[]}
 */
DAGGERHEART.allowedActorFlags = ["isBeastForm", "originalActor"].concat(Object.keys(DAGGERHEART.characterFlags));

/* -------------------------------------------- */

/**
 * Different types of actor structures that groups can represent.
 * @enum {object}
 */
DAGGERHEART.groupTypes = {
  party: "DAGGERHEART.Group.TypeParty",
  encounter: "DAGGERHEART.Group.TypeEncounter"
};
preLocalize("groupTypes");

/* -------------------------------------------- */

/**
 * Configuration information for activity types.
 *
 * @typedef {object} ActivityTypeConfiguration
 * @property {typeof Activity} documentClass  The activity's document class.
 * @property {boolean} [configurable=true]    Whether the activity is editable via the UI.
 * @property {boolean} [hidden]               Should this activity type be hidden in the selection dialog?
 */
DAGGERHEART.activityTypes = {
    attack: {
        documentClass: activities.AttackActivity
    },
    cast: {
        documentClass: activities.CastActivity
    },
    damage: {
        documentClass: activities.DamageActivity
    },
    heal: {
        documentClass: activities.HealActivity
    },
    save: {
        documentClass: activities.SaveActivity
    },
    transform: {
        documentClass: activities.TransformActivity
    }
};

/**
 * Configuration information for advancement types.
 *
 * @typedef {object} AdvancementTypeConfiguration
 * @property {typeof Advancement} documentClass  The advancement's document class.
 * @property {Set<string>} validItemTypes        What item types this advancement can be used with.
 * @property {boolean} [hidden]                  Should this advancement type be hidden in the selection dialog?
 */

const _ALL_ITEM_TYPES = ["background", "class", "race", "subclass"];

/**
 * Advancement types that can be added to items.
 * @enum {AdvancementTypeConfiguration}
 */
DAGGERHEART.advancementTypes = {
    SubClass: {
        documentClass: advancement.SubClassAdvancement,
        validItemTypes: new Set(['class'])
    },
    ScaleValue: {
        documentClass: advancement.ScaleValueAdvancement,
        validItemTypes: new Set([_ALL_ITEM_TYPES])
    }
}

/**
 * Default artwork configuration for each Document type and sub-type.
 * @type {Record<string, Record<string, string>>}
 */
DAGGERHEART.defaultArtwork = {
  Item: {
    background: "systems/dnd5e/icons/svg/items/background.svg",
    class: "systems/dnd5e/icons/svg/items/class.svg",
    consumable: "systems/dnd5e/icons/svg/items/consumable.svg",
    container: "systems/dnd5e/icons/svg/items/container.svg",
    equipment: "systems/dnd5e/icons/svg/items/equipment.svg",
    facility: "systems/dnd5e/icons/svg/items/facility.svg",
    feat: "systems/dnd5e/icons/svg/items/feature.svg",
    loot: "systems/dnd5e/icons/svg/items/loot.svg",
    ancestory: "systems/dnd5e/icons/svg/items/race.svg",
    subclass: "systems/dnd5e/icons/svg/items/subclass.svg",
    tool: "systems/dnd5e/icons/svg/items/tool.svg",
    weapon: "systems/dnd5e/icons/svg/items/weapon.svg"
  }
};

/* -------------------------------------------- */
/*  Rules                                       */
/* -------------------------------------------- */

/**
 * Configuration information for rule types.
 *
 * @typedef {object} RuleTypeConfiguration
 * @property {string} label         Localized label for the rule type.
 * @property {string} [references]  Key path for a configuration object that contains reference data.
 */

/**
 * Types of rules that can be used in rule pages and the &Reference enricher.
 * @enum {RuleTypeConfiguration}
 */
DAGGERHEART.ruleTypes = {
    rule: {
        label: "DAGGERHEART.Rule.Type.Rule",
        references: "rules"
    },
    trait: {
        label: "DAGGERHEART.Trait",
        references: "enrichmentLookup.traits"
    },
    areaOfEffect: {
        label: "DAGGERHEART.AreaOfEffect.Label",
        references: "areaTargetTypes"
    },
    condition: {
        label: "DAGGERHEART.Rule.Type.Condition",
        references: "conditionTypes"
    },
    creatureType:{
        label: "DAGGERHEART.CreatureType",
        references: "creatureTypes"
    },
    damage: {
        label: "DAGGERHEART.DamageType",
        references: "damageTypes"
    }
};
preLocalize("ruleTypes", {key: "label"});

/* -------------------------------------------- */
/*  Token Rings Framework                       */
/* -------------------------------------------- */

/**
 * Token Rings configuration data
 *
 * @typedef {object} TokenRingsConfiguration
 * @property {Record<string, string>} effects        Localized names of the configurable ring effects.
 * @property {string} spriteSheet                    The sprite sheet json source.
 * @property {typeof BaseSamplerShader} shaderClass  The shader class definition associated with the token ring.
 */

/**
 * @type {TokenRingsConfiguration}
 */
DAGGERHEART.tokenRings = {
  effects: {
    RING_PULSE: "DAGGERHEART.TokenRings.Effects.RingPulse",
    RING_GRADIENT: "DAGGERHEART.TokenRings.Effects.RingGradient",
    BKG_WAVE: "DAGGERHEART.TokenRings.Effects.BackgroundWave"
  },
  spriteSheet: "systems/dnd5e/tokens/composite/token-rings.json",
  shaderClass: null
};
preLocalize("tokenRings.effects");

/* -------------------------------------------- */
/*  Themes                                      */
/* -------------------------------------------- */

/**
 * Themes that can be set for the system or on sheets.
 * @enum {string}
 */
DAGGERHEART.themes = {
  light: "SHEETS.DAGGERHEART.THEME.Light",
  dark: "SHEETS.DAGGERHEART.THEME.Dark"
};
preLocalize("themes");

/* -------------------------------------------- */
/*  Enrichment                                  */
/* -------------------------------------------- */

let _enrichmentLookup;
Object.defineProperty(DAGGERHEART, "enrichmentLookup", {
  get() {
    const slugify = value => value?.slugify().replaceAll("-", "");
    if ( !_enrichmentLookup ) {
      _enrichmentLookup = {
        traits: foundry.utils.deepClone(DAGGERHEART.traits),
        tools: foundry.utils.deepClone(DAGGERHEART.tools)
      };
      const addFullKeys = key => Object.entries(DAGGERHEART[key]).forEach(([k, v]) =>
        _enrichmentLookup[key][slugify(v.fullKey)] = { ...v, key: k }
      );
      addFullKeys("traits");
    }
    return _enrichmentLookup;
  },
  enumerable: true
});

export default DAGGERHEART;
