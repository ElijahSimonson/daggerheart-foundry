

const {
    ArrayField, BooleanField, HTMLField, IntegerSortField, SchemaField, SetField, StringField
} = foundry.data.fields;

/**
 * @import {SimpleTraitData} from "./fields/simple-trait.mjs";
 */

/**
 * @typedef {Object} ActorFavoritesDH
 * @property {"activity"|"effect"|"item"|"slots"|"tool"} type - The type of favorite.
 * @property {string} id - The document UUID, skill, or tool identifier.
 * 
 * @property {number} [sort] - The sort value. 
 */

/**
 * System data definition for Characters
 * 
 * @property {object} attributes
 * @property {object} attributes.hp
 * @property {number} attributes.hp.value - The current hit points.
 * @property {number} attributes.hp.max - The maximum hit points.
 * @property {object} attributes.hp.bonuses
 * @property {string} attributes.hp.bonuses.level - Bonus formula applied for each class level.
 * @property {string} attributes.hp.bonuses.overall - Bonus formula applied to total HP.
 * @property {object} 
 */