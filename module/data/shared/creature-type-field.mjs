const { StringField } = foundry.data.fields;

/**
 * Field for storing creature type data.
 */
export default class CreatureTypeField extends foundry.data.fields.SchemaField {
    constructor(fields={}, options={}) {
        fields = {
            value: new StringField({ blank: true, label: "DAGGERHEART.CreatureType" }),
            subtype: new StringField({ label: "DAGGERHEART.CreatureTypeSelectorSubtype" }),
            swarm: new StringField({ blank: true, label: "DAGGERHEART.CreatureSwarmSize" }),
            custom: new StringField({ label: "DAGGERHEART.CreatureTypeSelectorCustom" }),
            ...fields
        };
        Object.entries(fields).forEach(([k, v]) => !v ? delete fields[k] : null);
        super(fields, { label: "DAGGERHEART.CreatureType", ...options });
    }

    /* -------------------------------------------- */

    /** @inheritDoc */
    initialize(value, model, options={}) {
        const obj = super.initialize(value, model, options);

        Object.defineProperty(obj, "label", {
            get() {
                return daggerheart.documents.ActorDH.formatCreatureType(this);
            },
            enumerable: false
        });
        Object.defineProperty(obj, "config", {
            get() {
                return CONFIG.DAGGERHEART.creatureTypes[this.value];
            },
            enumerable: false
        });

        return obj;
    }
}