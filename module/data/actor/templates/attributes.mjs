/**
 * @typedef {object} ArmorData
 * @property {string} calc
 * @property {object} flat
 * @property {string} flat.major
 * @property {string} flat.severe
 * @property {number} flat.score
 * @property
 * @property {object} formula
 * @property {string} formula.major
 * @property {string} formula.severe
 */

/**
 * Shared contents of the attributes between characters, NPCs, and Vehicles
 */
export default class AttributeFields {
    /**
     * Armor threshold fields shared between characters, NPCs, and Vehicles
     * @type {ArmorData}
     */
    static get armorThreshold() {
        return {
            calc: new StringField({initial: "default", label: "DAGGERHEART.ArmorThresholdCalc"}),
            flat: new SchemaField({
                major: new StringField({initial: "@attributes.level", label: "DAGGERHEART.ArmorThresholdFlatMaj", min: 1}),
                severe: new StringField({initial: "@attributes.level * 2", label: "DAGGERHEART.ArmorThresholdFlatSev", min: 2}),
                label: "DAGGERHEART.ArmorThresholdFlat"
            }),
            formula: new SchemaField({
                major: new StringField({initial: "@attributes.level", label: "DAGGERHEART.ArmorThresholdFlatMaj", min: 1}),
                severe: new StringField({initial: "@attributes.level * 2", label: "DAGGERHEART.ArmorThresholdFlatSev", min: 2}),
                label: "DAGGERHEART.ArmorThresholdFlat"
            })
        }
    }

}