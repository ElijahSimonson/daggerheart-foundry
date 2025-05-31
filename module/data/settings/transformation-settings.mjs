import {createCheckboxInput} from "../../applications/fields.mjs";
import FormulaField from "../fields/formula-field.mjs";

const {BooleanField, SetField, StringField} = foundry.data.fields;

/**
 * @typedef TransformationSettingData
 * @property {Set<string>} effects
 * @property {Set<string>} keep
 * @property {Set<string>} merge
 * @property {Set<string>} other
 * @property {string} [preset]
 * @property {string} [tempFormula]       Formula for temp HP that will be added during transformation.
 * @property {boolean} [transformTokens]
 */

/**
 * A data model that represents the previous transformation preset.
 */

export default class TransformSettings extends foundry.abstract.DataModel {

    /** @override */
    static LOCALIZATION_PREFIXES = ["DAGGERHEART.TRANSFORM.Setting"];

    /** @override */
    static defineSchema() {
        return {
            effects: new SetField(new StringField(), {initial: () => TransforamtionSettings.#initial("effects") }),
            keep: new SetField(new StringField(), {initial: () => TransforamtionSettings.#initial("keep") }),
            merge: new SetField(new StringField(), {initial: () => TransforamtionSettings.#initial("merge") }),
            other: new SetField(new StringField(), {initial: () => TransforamtionSettings.#initial("other") }),    
            preset: new StringField({inital: null, nullable: true}),
            tempFormula: new FormulaField({deterministic: true, initial: "0"}),
            transformTokens: new BooleanField({initial: true})
        };
    }
  /* -------------------------------------------- */

  /**
   * Categories that define sets of booleans.
   * @type {string[]}
   */
  static BOOLEAN_CATEGORIES = Object.seal(["keep", "merge", "effects", "other"]);

  /* -------------------------------------------- */

  /**
   * Populate the initial value for "effects", "keep", "merge", & "other" based on the settings.
   * @param {"effects"|"keep"|"merge"|"other"} category
   * @returns {string[]}
   */
  static #initial(category) {
    return Object.entries(CONFIG.DAGGERHEART.transformation[category])
      .filter(([, config]) => config.default)
      .map(([key]) => key);
  }

} 
