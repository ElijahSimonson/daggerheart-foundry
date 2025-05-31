import { simplifyBonus } from "../../../utils.mjs";
import FormulaField from "../../fields/formula-field.mjs";
import MappingField from "../../fields/mapping-field.mjs";
import RollConfigField from "../../shared/roll-config-field.mjs";
import CommonTemplate from "./common.mjs";

const { NumberField, SchemaField } = foundry.data.fields;

/**
 * A template for all actors that are creatures
 *
 * @property {object} bonuses
 * @property {AttackBonusesData} bonuses.mwak        Bonuses to melee weapon attacks.
 * @property {AttackBonusesData} bonuses.rwak        Bonuses to ranged weapon attacks.
 * @property {AttackBonusesData} bonuses.sak        Bonuses to melee spell attacks.
 * @property {object} bonuses.traits              Bonuses to ability scores.
 * @property {string} bonuses.traits.check        Numeric or dice bonus to ability checks.
 * @property {string} bonuses.traits.save         Numeric or dice bonus to ability saves.
 * @property {string} bonuses.traits.skill        Numeric or dice bonus to skill checks.
 * @property {object} bonuses.spell                  Bonuses to spells.
 * @property {string} bonuses.spell.dc               Numeric bonus to spellcasting DC.
*/

export default class CreatureTemplate extends CommonTemplate {
    static defineSchema() {
        return this.mergeSchema(super.defineSchema(), {
            bonuses: new SchemaField({
                mwak: makeAttackBonuses(),
                rwak: makeAttackBonuses(),
                sak: makeAttackBonuses(),
                traits: new SchemaField({
                    check: new FormulaField({required: true}),
                    save: new FormulaField({required: true})
                }),
                spell: new SchemaField({
                    dc: new FormulaField({required: true, deterministic: true})
                })
            })
        })
    }

    /* -------------------------------------------- */
    /*  Helpers                                     */
    /* -------------------------------------------- */

    /** @inheritDoc */
    getRollData({ deterministic=false }={}) {
        const data = super.getRollData({ deterministic });
        data.classes = {};
        data.subclasses = {};
        for ( const [identifier, cls] of Object.entries(this.parent.classes) ) {
            data.classes[identifier] = {...cls.system};
            if ( cls.subclass ) {
                data.classes[identifier].subclass = cls.subclass.system;
                data.subclasses[cls.subclass.identifier] = { levels: cls.system.levels };
            }
        }
        return data;
    }
}

/**
 * @typedef {RollConfigData} SkillData
 * @property {number} value            Proficiency level creature has in this skill.
 * @property {object} bonuses          Bonuses for this skill.
 * @property {string} bonuses.check    Numeric or dice bonus to skill's check.
 * @property {string} bonuses.passive  Numeric bonus to skill's passive check.
 */

/**
 * @typedef {RollConfigData} ToolData
 * @property {number} value            Proficiency level creature has in this tool.
 * @property {object} bonuses          Bonuses for this tool.
 * @property {string} bonuses.check    Numeric or dice bonus to tool's check.
 */

/**
 * Data on configuration of a specific spell slot.
 *
 * @typedef {object} SpellSlotData
 * @property {number} value     Currently available spell slots.
 * @property {number} override  Number to replace auto-calculated max slots.
 */

/* -------------------------------------------- */

/**
 * Data structure for actor's attack bonuses.
 *
 * @typedef {object} AttackBonusesData
 * @property {string} attack  Numeric or dice bonus to attack rolls.
 * @property {string} damage  Numeric or dice bonus to damage rolls.
 */

/**
 * Produce the schema field for a simple trait.
 * @param {object} schemaOptions  Options passed to the outer schema.
 * @returns {AttackBonusesData}
 */
function makeAttackBonuses(schemaOptions={}) {
    return new SchemaField({
        attack: new FormulaField({required: true}),
        damage: new FormulaField({required: true})
    }, schemaOptions);

}