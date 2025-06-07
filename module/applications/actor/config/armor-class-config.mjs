import {formatNumber} from "../../utils.mjs"
import BaseConfigSheet from "../api/base-config-sheet.mjs"

/**
 * Configuration application for armor threshold calculation
 */
export default class ArmorThresholdConfig extends BaseConfigSheet {
    /** @override */
    static DEFAULT_OPTIONS = {
        classes: ["armor-score", "armor-threshold", "armor-threshold-major", "armor-threshold-severe"],
        position: {
            width: 420
        }
    };

    /** @override */
    static PARTS = {
        config: {
            template: "systems/daggerheart/templates/actors/config/armor-threshold-config.hbs"
        }
    };

    /** Properties */

    /** @override */
    get title(){
        return game.i18n.localize("DAGGERHEART.ArmorThreshold")
    }

    /**  Rendering */

    /** @inheritDoc */
    async _preparePartContext(partId, context, options){
        context = await super._preparePartContext(partId, context, options);
        context.data = this.document.system.attributes.armorThreshold;
        context.fields = this.document.system.schema.fields.attributes.fields.armorThreshold.fields;
        context.source = this.document.system._source.attributes.armorThreshold;

        context.calculationOptions = Object.entries(CONFIG.DAGGERHEART.armorThresholds).reduce((arr, [value, config]) => {
            if (value === "custom") arr.push({rule: true});
            arr.push({ value, label: config.label});
            if (value === "natural") arr.push({rule: true});
            return arr;
        }, []);

        const config = CONFIG.DAGGERHEART.armorThresholds[context.source.calc];
        context.formula = {
            disabled: context.source.calc !== "custom",
            showFlat: ["flat", "natural"].includes(context.source.calc),
            value: (context.source.calc === "custom" ? context.source.formula : config?.formula) ?? ""
        };
    }
}
