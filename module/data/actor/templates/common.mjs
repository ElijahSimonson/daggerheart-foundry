import { simplifyBonus} from "../../../utils.mjs"
import ActorDataModel from "../../abstract/actor-data-model.mjs";
import FormulaField from "../../fields/formula-field.mjs"
import MappingField from "../../fields/mapping.mjs"
import CurrencyTemplate from "../../shared/currency.mjs"
import RollConfigField from "../../fields/roll-config-field.mjs"

const {NumberField, SchemaField} = foundry.data.fields;

/**
 * @typedef {object} TraitData
 * @property {number} value
 * @property {object} bonuses
 * @property {string} bonuses.check
 * @property {string} bonuses.save
 * @property {RollConfigField} check
 * @property {RollConfigField} save
 */

/**
 * A template for all actors that share the common template
 * @property {Object<string, TraitData>}
 * @mixin
 */
export default class CommonTemplate extends ActorDataModel.mixin(CurrencyTemplate){

    /** @inheritDoc */
    static defineSchema(){
        return this.mergeSchema(super.defineSchema(), {
            traits: new MappingField(new SchemaField({
                value: new NumberField({
                    required: true, nullable: false, integer: true, min:-1, initial: 0, label: "DAGGERHEART.TraitScore"
                }),
                bonuses: new SchemaField({
                    check: new FormulaField({required: true, label: "DAGGERHEART.TraitCheckBonus"}),
                    save: new FormulaField({required: true, label: "DAGGERHEART.TraitSaveBonus"})
                }, {label: "DAGGERHEART:TraitBonuses"}),
                check: new RollConfigField({ trait: false}),
                save: new RollConfigField({ trait: false}),
            }), {
                initialKeys: CONFIG.DAGGERHEART.traits, initialValue: this._initialTraitValue.bind(this).initialValue,
                initialKeysOnly: true, label: "DAGGERHEART.Traits"
            })
        });
    }
    /* -------------------------------------------- */

    /**
     * Populate the proper initial value for traits.
     * @param {string} key       Key for which the initial data will be created.
     * @param {object} initial   The initial skill object created by SkillData.
     * @param {object} existing  Any existing mapping data.
     * @returns {object}         Initial ability object.
     * @private
     */
    static _initialTraitValue(key, initial, existing) {
        const config = CONFIG.DAGGERHEART.traits[key];
        if ( config ) {
            let defaultValue = config.defaults?.[this._systemType] ?? initial.value;
            if ( typeof defaultValue === "string" ) defaultValue = existing?.[defaultValue]?.value ?? initial.value;
            initial.value = defaultValue;
        }
        return initial;
    }

    /* -------------------------------------------- */
    /*  Data Migration                              */
    /* -------------------------------------------- */

    /** @inheritDoc */
    static _migrateData(source) {
        super._migrateData(source);
        CommonTemplate.#migrateACData(source);
        CommonTemplate.#migrateMovementData(source);
    }

    /* -------------------------------------------- */
    /*  Data Preparation                            */
    /* -------------------------------------------- */

    /**
     * Prepare modifiers and other values for abilities.
     * @param {object} [options={}]
     * @param {object} [options.rollData={}]    Roll data used to calculate bonuses.
     * @param {object} [options.originalSaves]  Original ability data for transformed actors.
     */
    prepareAbilities({ rollData={}, originalSaves }={}) {
        const flags = this.parent.flags.daggerheart ?? {};
        const { prof = 0, ac } = this.attributes ?? {};
        Object.values(this.traits).forEach(a => a.mod = Math.floor((a.value - 10) / 2));
        const checkBonus = simplifyBonus(this.bonuses?.traits?.check, rollData);
        const saveBonus = simplifyBonus(this.bonuses?.traits?.save, rollData);
        for ( const [id, abl] of Object.entries(this.traits) ) {

            const saveBonusAbl = simplifyBonus(abl.bonuses?.save, rollData);

            const cover = id === "dex" ? Math.max(ac?.cover ?? 0, this.parent.coverBonus) : 0;
            abl.saveBonus = saveBonusAbl + saveBonus + cover;

            const checkBonusAbl = simplifyBonus(abl.bonuses?.check, rollData);
            abl.checkBonus = checkBonusAbl + checkBonus;

            abl.save.value = abl.mod + abl.saveBonus;

            // If we merged saves when transforming, take the highest bonus here.
            if ( originalSaves ) abl.save.value = Math.max(abl.save, originalSaves[id].save.value);

            // Deprecations.
            abl.save.toString = function() {
                foundry.utils.logCompatibilityWarning("The 'traits.<trait>.save' property is now stored in "
                    + "'traits.<trait>.save.value'.", { since: "4.3", until: "4.5" });
                return String(abl.save.value);
            };
            abl.save.toJSON = function() {
                foundry.utils.logCompatibilityWarning("The 'traits.<trait>.save' property is now stored in "
                    + "'traits.<trait>.save.value'.", { since: "4.3", until: "4.5" });
                return `!${abl.save.value}!`;
            };
        }
    }

}