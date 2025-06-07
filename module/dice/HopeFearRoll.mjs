/**
 * Configuration data for the process of rolling Hope/Fear rolls
 *
 * @typedef {BasicRollProcessConfiguration} HopeFearRollProcessConfiguration
 * @property {boolean} [advantage]    Apply advantage to each roll.
 * @property {boolean} [disadvantage] Apply disadvantage to each roll.
 * @property {HopeFearRollConfiguration[]} rolls Configuration data for individual rolls.
 */

/**
 * HopeFear Roll configuration data
 *
 * @typedef {BasicRollConfiguration} HopeFearRollConfiguration
 * @property {string[]} parts
 * @property {HopeFearRollOptions} options
 */

/**
 * Options that describe a Hope Fear roll
 *
 * @typedef {BasicRollOptions} HopeFearRollOptions
 * @property {boolean} [advantage]  Does this roll potentially have advantage?
 * @property {boolean} [disadvantage] Does this roll potentially have disadvantage?
 * @property {HopeFearRoll.ADV_MODE} [advantageMode]  Final advantage mode
 */

import {BasicRoll} from "./_module.mjs";

/**
 * A type of roll specific to a HopeFear based check, reaction, or attack roll in the Daggerheart system.
 * This roll is the primary roll for Players, for the GM roll see D20Roll
 */
export default class HopeFearRoll extends BasicRoll {
  constructor(formula, data, options){
    super(formula, data, options);
    this.#createHopeFearDie();
    if (!this.options.configured) this.configureModifiers();
  }

  /**
   * Advantage mode of a Daggerheart Hope/Fear roll
   * @enum {number}
   */
  static ADV_MODE = {
    NORMAL: 0,
    ADVANTAGE: 1,
    DISADVANTAGE: -1
  }

  /** @inheritDoc */
  static DefaultConfigurationDialog = HopeFateRollConfigurationDialog;

  /** @inheritDoc */
  static fromConfig(config, process){
    const formula = [new CONFIG.Dice.HopeFearDie().formula].concat(config.parts ?? [] ).join(" + ");
    config.options.criticalSuccess ??= CONFIG.Dice.HopeFearDie.CRITICAL_SUCCESS_TOTAL;
    config.options.target ??= process.target;
    return new this(formula, config.data, config.options);
  }



}
