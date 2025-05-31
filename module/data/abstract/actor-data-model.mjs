import SystemDataModel  from "./system-data-model.mjs";
import Config from "../../config.mjs";

/**
 * Variant of the SystemDataModel with some extra actor-specific handling.
 */
export default class ActorDataModel extends SystemDataModel {

    /**
     * @typedef {SystemDataModel} ActorDataModelMetadata
     * @property {boolean} supportsAdvancement
     */

    /**@type {ActorDataModelMetadata} */
    static metadata = Object.freeze(foundry.mergeObject(super.metadata, {supportsAdvancement: false}, {inplace: false}));

    /* -------------------------------------------- */
    /*  Properties                                  */
    /* -------------------------------------------- */

    /** @override */
    get embeddedDescriptionKeyPath() {
        return "details.biography.value";
    }

    /**
     * Other actors that are available for currency transfers from this actor
     * @type {ActorDaggerheart[]}
     */
    get transferDestinations() {
        const primaryParty = game.settings.get("daggerheart", "primaryParty")?.actor;
        if (!primaryParty?.system.members.ids.has(this.parent.id)) return [];
        const destinations = primaryParty.system.members.map(m => m.actor).filter(a => a.isOwner && a !== this.parent);
        if (primaryParty.isOwner) destinations.unshift(primaryParty);
        return destinations;
    }

    /* -------------------------------------------- */
    /*  Data Preparation                            */
    /* -------------------------------------------- */

    /**
     * Data preparation steps to perform after item data has been prepared, but before active effects are applied.
     */
    prepareEmbeddedData() {
        this._prepareScaleValues();
    }

    /* -------------------------------------------- */

    /**
     * Derive any values that have been scaled by the Advancement system.
     * Mutates the value of the `system.scale` object.
     * @protected
     */
    _prepareScaleValues() {
        this.scale = this.parent.items.reduce((scale, item) => {
            if (CONFIG.DAGGERHEART.advancementTypes.ScaleValue.validItemTypes.has(item.type)){
                scale[item.identifier] = item.scaleValues;
            }
            return scale;
        }, {});
    }

    /* -------------------------------------------- */
    /*  Helpers                                     */
    /* -------------------------------------------- */

    /**
     * Prepare a data object which defines the data schema used by dice roll commands against this Actor.
     * @param {object} [options]
     * @param {boolean} [options.deterministic] Whether to force deterministic values for data properties that could be
     *                                          either a die term or a flat term.
     * @returns {object}
     */
    getRollData({ deterministic=false }={}) {
        const data = { ...this };
        return data;
    }

    /* -------------------------------------------- */

    /**
     * Reset combat-related uses.
     * @param {string[]} periods               Which recovery periods should be considered.
     * @param {CombatRecoveryResults} results  Updates to perform on the actor and containing items.
     */
    async recoverCombatUses(periods, results) {}
}