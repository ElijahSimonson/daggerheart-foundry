import FormulaField from "../data/fields/formula-field.mjs";
import MappingField from "../data/fields/mapping-field.mjs";
import { parseOrString, staticID } from "../utils.mjs";


const TextEditor = foundry.applications.ux.TextEditor.implementation;
const { ObjectField, SchemaField, SetField, StringField } = foundry.data.fields;

/**
 * Extend the base ActiveEffect class to implement system-specific logic.
 */
export default class ActiveEffectDH extends ActiveEffect {

  /**
   * Key paths to properties added during base data preperation that should be treated as formula fields.
   * @type{Set<String>}
   */
  static FOMULA_FIELDS = new Set([]);

  /* -------------------------------------------- */

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "DAGGERHEART.ACTIVEEFFECT"];

  /* -------------------------------------------- */

  /**
   * Is this effect an enchantment on an item that accepts enchantment?
   * @type {boolean}
   */
  get isAppliedEnchantment() {
    return (this.type === "enchantment") && !!this.origin && (this.origin !== this.parent.uuid);
  }

  /* -------------------------------------------- */

  /**
   * Should this status effect be hidden from the current user?
   * @type {boolean}
   */
  get isConcealed() {
    if ( this.target?.testUserPermission(game.user, "OBSERVER") ) return false;
    return false;
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  get isSuppressed() {
    if ( super.isSuppressed ) return true;
    if ( this.type === "enchantment" ) return false;
    if ( this.parent instanceof daggerheart.documents.ItemDH ) return this.parent.areEffectsSuppressed;
    return false;
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  get isTemporary() {
    return super.isTemporary && !this.isConcealed;
  }

  /* -------------------------------------------- */

  /**
   * Retrieve the source Actor or Item, or null if it could not be determined.
   * @returns {Promise<ActorDH|ItemDH|null>}
   */
  async getSource() {
    if ( (this.target instanceof daggerheart.documents.ActorDH) && (this.parent instanceof daggerheart.documents.ItemDH) ) {
      return this.parent;
    }
    return fromUuid(this.origin);
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  static async _fromStatusEffect(statusId, { reference, ...effectData }, options) {
    if ( !("description" in effectData) && reference ) effectData.description = `@Embed[${reference} inline]`;
    return super._fromStatusEffect?.(statusId, effectData, options) ?? new this(effectData, options);
  }

  /* -------------------------------------------- */
  /*  Data Migration                              */
  /* -------------------------------------------- */

  /** @inheritDoc */
  _initializeSource(data, options={}) {
    if ( data instanceof foundry.abstract.DataModel ) data = data.toObject();

    if ( data.flags?.daggerheart?.type === "enchantment" ) {
      data.type = "enchantment";
      delete data.flags.daggerheart.type;
      foundry.utils.setProperty(data, "flags.daggerheart.persistSourceMigration", true);
    }

    return super._initializeSource(data, options);
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  static migrateData(data) {
    data = super.migrateData(data);
    return data;
  }

  /* -------------------------------------------- */
  /*  Effect Application                          */
  /* -------------------------------------------- */

  /** @inheritDoc */
  apply(doc, change) {
    // Ensure changes targeting flags use the proper types
    if ( change.key.startsWith("flags.daggerheart.") ) change = this._prepareFlagChange(doc, change);

    // Properly handle formulas that don't exist as part of the data model
    if ( ActiveEffectDH.FORMULA_FIELDS.has(change.key) ) {
      const field = new FormulaField({ deterministic: true });
      return { [change.key]: this.constructor.applyField(doc, change, field) };
    }

    // Handle activity-targeted changes
    if ( (change.key.startsWith("activities[") || change.key.startsWith("system.activities."))
      && (doc instanceof Item) ) return this.applyActivity(doc, change);

    return super.apply(doc, change);
  }

  /* -------------------------------------------- */

  /**
   * Apply a change to activities on this item.
   * @param {ItemDH} item              The Item to whom this change should be applied.
   * @param {EffectChangeData} change  The change data being applied.
   * @returns {Record<string, *>}      An object of property paths and their updated values.
   */
  applyActivity(item, change) {
    const changes = {};
    const apply = (activity, key) => {
      const c = this.apply(activity, { ...change, key });
      Object.entries(c).forEach(([k, v]) => changes[`system.activities.${activity.id}.${k}`] = v);
    };
    if ( change.key.startsWith("system.activities.") ) {
      const [, , id, ...keyPath] = change.key.split(".");
      const activity = item.system.activities?.get(id);
      if ( activity ) apply(activity, keyPath.join("."));
    } else {
      const { type, key } = change.key.match(/activities\[(?<type>[^\]]+)]\.(?<key>.+)/)?.groups ?? {};
      item.system.activities?.getByType(type)?.forEach(activity => apply(activity, key));
    }
    return changes;
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  static applyField(model, change, field) {
    field ??= model.schema.getField(change.key);
    change = foundry.utils.deepClone(change);
    const current = foundry.utils.getProperty(model, change.key);
    const modes = CONST.ACTIVE_EFFECT_MODES;

    // Replace value when using string interpolation syntax
    if ( (field instanceof StringField) && (change.mode === modes.OVERRIDE) && change.value.includes("{}") ) {
      change.value = change.value.replace("{}", current ?? "");
    }

    // If current value is `null`, UPGRADE & DOWNGRADE should always just set the value
    if ( (current === null) && [modes.UPGRADE, modes.DOWNGRADE].includes(change.mode) ) change.mode = modes.OVERRIDE;

    // Handle removing entries from sets
    if ( (field instanceof SetField) && (change.mode === modes.ADD) && (foundry.utils.getType(current) === "Set") ) {
      for ( const value of field._castChangeDelta(change.value) ) {
        const neg = value.replace(/^\s*-\s*/, "");
        if ( neg !== value ) current.delete(neg);
        else current.add(value);
      }
      return current;
    }

    // If attempting to apply active effect to empty MappingField entry, create it
    if ( (current === undefined) && change.key.startsWith("system.") ) {
      let keyPath = change.key;
      let mappingField = field;
      while ( !(mappingField instanceof MappingField) && mappingField ) {
        if ( mappingField.name ) keyPath = keyPath.substring(0, keyPath.length - mappingField.name.length - 1);
        mappingField = mappingField.parent;
      }
      if ( mappingField && (foundry.utils.getProperty(model, keyPath) === undefined) ) {
        const created = mappingField.model.initialize(mappingField.model.getInitialValue(), mappingField);
        foundry.utils.setProperty(model, keyPath, created);
      }
    }

    // Parse any JSON provided when targeting an object
    if ( (field instanceof ObjectField) || (field instanceof SchemaField) ) {
      change = { ...change, value: parseOrString(change.value) };
    }

    return super.applyField(model, change, field);
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  _applyAdd(actor, change, current, delta, changes) {
    if ( current instanceof Set ) {
      const handle = v => {
        const neg = v.replace(/^\s*-\s*/, "");
        if ( neg !== v ) current.delete(neg);
        else current.add(v);
      };
      if ( Array.isArray(delta) ) delta.forEach(item => handle(item));
      else handle(delta);
      return;
    }
    super._applyAdd(actor, change, current, delta, changes);
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  _applyLegacy(actor, change, changes) {
    if ( this.system._applyLegacy?.(actor, change, changes) === false ) return;
    super._applyLegacy(actor, change, changes);
  }

  /* --------------------------------------------- */

  /** @inheritDoc */
  _applyUpgrade(actor, change, current, delta, changes) {
    if ( current === null ) return this._applyOverride(actor, change, current, delta, changes);
    return super._applyUpgrade(actor, change, current, delta, changes);
  }

  /* --------------------------------------------- */

  /**
   * Transform the data type of the change to match the type expected for flags.
   * @param {ActorDH} actor            The Actor to whom this effect should be applied.
   * @param {EffectChangeData} change  The change being applied.
   * @returns {EffectChangeData}       The change with altered types if necessary.
   */
  _prepareFlagChange(actor, change) {
    const { key, value } = change;
    const data = CONFIG.DAGGERHEART.characterFlags[key.replace("flags.daggerheart.", "")];
    if ( !data ) return change;

    // Set flag to initial value if it isn't present
    const current = foundry.utils.getProperty(actor, key) ?? null;
    if ( current === null ) {
      let initialValue = null;
      if ( data.placeholder ) initialValue = data.placeholder;
      else if ( data.type === Boolean ) initialValue = false;
      else if ( data.type === Number ) initialValue = 0;
      foundry.utils.setProperty(actor, key, initialValue);
    }

    // Coerce change data into the correct type
    if ( data.type === Boolean ) {
      if ( value === "false" ) change.value = false;
      else change.value = Boolean(value);
    }
    return change;
  }

  /* -------------------------------------------- */
  /*  Lifecycle                                   */
  /* -------------------------------------------- */

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    if ( this.isAppliedEnchantment ) daggerheart.registry.enchantments.track(this.origin, this.uuid);
  }

  /* -------------------------------------------- */

  /**
   * Prepare effect favorite data.
   * @returns {Promise<FavoriteDataDH>}
   */
  async getFavoriteData() {
    return {
      img: this.img,
      title: this.name,
      subtitle: this.duration.remaining ? this.duration.label : "",
      toggle: !this.disabled,
      suppressed: this.isSuppressed
    };
  }

  /* -------------------------------------------- */

  /**
   * Create conditions that are applied separately from an effect.
   * @returns {Promise<ActiveEffectDH[]>}      Created rider effects.
   */
  async createRiderConditions() {
    const riders = new Set();

    for ( const status of this.getFlag("daggerheart", "riders.statuses") ?? [] ) {
      riders.add(status);
    }

    for ( const status of this.statuses ) {
      const r = CONFIG.statusEffects.find(e => e.id === status)?.riders ?? [];
      for ( const p of r ) riders.add(p);
    }

    if ( !riders.size ) return [];

    const createRider = async id => {
      const existing = this.parent.effects.get(staticID(`daggerheart${id}`));
      if ( existing ) return;
      const effect = await ActiveEffectDH.fromStatusEffect(id);
      return effect.toObject();
    };

    const effectData = await Promise.all(Array.from(riders).map(createRider));
    return ActiveEffectDH.createDocuments(effectData.filter(_ => _), { keepId: true, parent: this.parent });
  }

  /* -------------------------------------------- */

  /**
   * Create additional activities, effects, and items that are applied separately from an enchantment.
   * @param {object} options  Options passed to the effect creation.
   */
  async createRiderEnchantments(options={}) {
    let item;
    let profile;
    const { chatMessageOrigin } = options;
    const { enchantmentProfile, activityId } = options.daggerheart ?? {};

    if ( chatMessageOrigin ) {
      const message = game.messages.get(options?.chatMessageOrigin);
      item = message?.getAssociatedItem();
      const activity = message?.getAssociatedActivity();
      profile = activity?.effects.find(e => e._id === message?.getFlag("daggerheart", "use.enchantmentProfile"));
    } else if ( enchantmentProfile && activityId ) {
      let activity;
      const origin = await fromUuid(this.origin);
      if ( origin instanceof daggerheart.documents.activity.EnchantActivity ) {
        activity = origin;
        item = activity.item;
      } else if ( origin instanceof Item ) {
        item = origin;
        activity = item.system.activities?.get(activityId);
      }
      profile = activity?.effects.find(e => e._id === enchantmentProfile);
    }

    if ( !profile || !item ) return;

    // Create Activities
    const riderActivities = {};
    let riderEffects = [];
    for ( const id of profile.riders.activity ) {
      const activityData = item.system.activities.get(id)?.toObject();
      if ( !activityData ) continue;
      activityData._id = foundry.utils.randomID();
      riderActivities[activityData._id] = activityData;
    }
    let createdActivities = [];
    if ( !foundry.utils.isEmpty(riderActivities) ) {
      await this.parent.update({ "system.activities": riderActivities });
      createdActivities = Object.keys(riderActivities).map(id => this.parent.system.activities?.get(id));
      createdActivities.forEach(a => a.effects?.forEach(e => {
        if ( !this.parent.effects.has(e._id) ) riderEffects.push(item.effects.get(e._id)?.toObject());
      }));
    }

    // Create Effects
    riderEffects.push(...profile.riders.effect.map(id => {
      const effectData = item.effects.get(id)?.toObject();
      if ( effectData ) {
        delete effectData._id;
        delete effectData.flags?.daggerheart?.rider;
        effectData.origin = this.origin;
      }
      return effectData;
    }));
    riderEffects = riderEffects.filter(_ => _);
    const createdEffects = await this.parent.createEmbeddedDocuments("ActiveEffect", riderEffects, { keepId: true });

    // Create Items
    let createdItems = [];
    if ( this.parent.isEmbedded ) {
      const riderItems = await Promise.all(profile.riders.item.map(async uuid => {
        const itemData = (await fromUuid(uuid))?.toObject();
        if ( itemData ) {
          delete itemData._id;
          foundry.utils.setProperty(itemData, "flags.daggerheart.enchantment", { origin: this.uuid });
        }
        return itemData;
      }));
      createdItems = await this.parent.actor.createEmbeddedDocuments("Item", riderItems.filter(i => i));
    }

    if ( createdActivities.length || createdEffects.length || createdItems.length ) {
      this.addDependent(...createdActivities, ...createdEffects, ...createdItems);
    }
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  toDragData() {
    const data = super.toDragData();
    const activity = this.parent?.system.activities?.getByType("enchant").find(a => {
      return a.effects.some(e => e._id === this.id);
    });
    if ( activity ) data.activityId = activity.id;
    return data;
  }

  /* -------------------------------------------- */
  /*  Socket Event Handlers                       */
  /* -------------------------------------------- */

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    if ( await super._preCreate(data, options, user) === false ) return false;
    if ( options.keepOrigin === false ) this.updateSource({ origin: this.parent.uuid });

    // Enchantments cannot be added directly to actors
    if ( (this.type === "enchantment") && (this.parent instanceof Actor) ) {
      ui.notifications.error("DAGGERHEART.ENCHANTMENT.Warning.NotOnActor", { localize: true });
      return false;
    }

    if ( this.isAppliedEnchantment ) {
      const origin = await fromUuid(this.origin);
      const errors = origin?.canEnchant?.(this.parent);
      if ( errors?.length ) {
        errors.forEach(err => console.error(err));
        return false;
      }
      this.updateSource({ disabled: false });
    }
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async _onCreate(data, options, userId) {
    super._onCreate(data, options, userId);
    if ( userId === game.userId ) {
      if ( this.active && (this.parent instanceof Actor) ) await this.createRiderConditions();
      if ( this.isAppliedEnchantment ) await this.createRiderEnchantments(options);
    }
    if ( options.chatMessageOrigin ) {
      document.body.querySelectorAll(`[data-message-id="${options.chatMessageOrigin}"] enchantment-application`)
        .forEach(element => element.buildItemList());
    }
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async _preDelete(options, user) {
    const dependents = this.getDependents();
    if ( dependents.length && !game.users.activeGM ) {
      return false;
    }
    return super._preDelete(options, user);
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  _onDelete(options, userId) {
    super._onDelete(options, userId);
    if ( game.user === game.users.activeGM ) this.getDependents().forEach(e => e.delete());
    if ( this.isAppliedEnchantment ) daggerheart.registry.enchantments.untrack(this.origin, this.uuid);
    document.body.querySelectorAll(`enchantment-application:has([data-enchantment-uuid="${this.uuid}"]`)
      .forEach(element => element.buildItemList());
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  _displayScrollingStatus(enabled) {
    if ( this.isConcealed ) return;
    super._displayScrollingStatus(enabled);
  }

  /* -------------------------------------------- */

  /**
   * Register listeners for custom handling in the TokenHUD.
   */
  static registerHUDListeners() {
    Hooks.on("renderTokenHUD", this.onTokenHUDRender);
    document.addEventListener("click", this.onClickTokenHUD.bind(this), { capture: true });
    document.addEventListener("contextmenu", this.onClickTokenHUD.bind(this), { capture: true });
  }

  /* -------------------------------------------- */

  /**
   * Add modifications to the core ActiveEffect config.
   * @param {ActiveEffectConfig} app   The ActiveEffect config.
   * @param {jQuery|HTMLElement} html  The ActiveEffect config element.
   */
  static onRenderActiveEffectConfig(app, html) {
    const element = new foundry.data.fields.SetField(new foundry.data.fields.StringField(), {}).toFormGroup({
      label: game.i18n.localize("DAGGERHEART.CONDITIONS.RiderConditions.label"),
      hint: game.i18n.localize("DAGGERHEART.CONDITIONS.RiderConditions.hint")
    }, {
      name: "flags.daggerheart.riders.statuses",
      value: app.document.getFlag("daggerheart", "riders.statuses") ?? [],
      options: CONFIG.statusEffects.map(se => ({ value: se.id, label: se.name }))
    });
    html.querySelector("[data-tab=details] > .form-group:has([name=statuses])")?.after(element);
  }

  /* -------------------------------------------- */

  /**
   * Implement custom behavior for select conditions on the token HUD.
   * @param {PointerEvent} event        The triggering event.
   */
  static onClickTokenHUD(event) {
    const { target } = event;
    if ( !target.classList?.contains("effect-control") ) return;

  }
  /* -------------------------------------------- */

  /**
   * Record another effect as a dependent of this one.
   * @param {...ActiveEffectDH} dependent  One or more dependent effects.
   * @returns {Promise<ActiveEffectDH>}
   */
  addDependent(...dependent) {
    const dependents = this.getFlag("daggerheart", "dependents") ?? [];
    dependents.push(...dependent.map(d => ({ uuid: d.uuid })));
    return this.setFlag("daggerheart", "dependents", dependents);
  }

  /* -------------------------------------------- */

  /**
   * Retrieve a list of dependent effects.
   * @returns {Array<ActiveEffectDH|ItemDH>}
   */
  getDependents() {
    return (this.getFlag("daggerheart", "dependents") || []).reduce((arr, { uuid }) => {
      let effect;
      // TODO: Remove this special casing once https://github.com/foundryvtt/foundryvtt/issues/11214 is resolved
      if ( this.parent.pack && uuid.includes(this.parent.uuid) ) {
        const [, embeddedName, id] = uuid.replace(this.parent.uuid, "").split(".");
        effect = this.parent.getEmbeddedDocument(embeddedName, id);
      }
      else effect = fromUuidSync(uuid, { strict: false });
      if ( effect ) arr.push(effect);
      return arr;
    }, []);
  }

  /* -------------------------------------------- */
  /*  Helpers                                     */
  /* -------------------------------------------- */

  /**
   * Helper method to add choices that have been overridden by an active effect. Used to determine what fields might
   * need to be disabled because they are overridden by an active effect in a way not easily determined by looking at
   * the `Document#overrides` data structure.
   * @param {ActorDH|ItemDH} doc  Document from which to determine the overrides.
   * @param {string} prefix       The initial form prefix under which the choices are grouped.
   * @param {string} path         Path in document data.
   * @param {string[]} overrides  The list of fields that are currently modified by Active Effects. *Will be mutated.*
   */
  static addOverriddenChoices(doc, prefix, path, overrides) {
    const source = new Set(foundry.utils.getProperty(doc._source, path) ?? []);
    const current = foundry.utils.getProperty(doc, path) ?? new Set();
    const delta = current.symmetricDifference(source);
    for ( const choice of delta ) overrides.push(`${prefix}.${choice}`);
  }

  /* -------------------------------------------- */

  /**
   * Render a rich tooltip for this effect.
   * @param {EnrichmentOptions} [enrichmentOptions={}]  Options for text enrichment.
   * @returns {Promise<{content: string, classes: string[]}>}
   */
  async richTooltip(enrichmentOptions={}) {
    const properties = [];
    if ( this.isSuppressed ) properties.push("DAGGERHEART.EffectType.Unavailable");
    else if ( this.disabled ) properties.push("DAGGERHEART.EffectType.Inactive");
    else if ( this.isTemporary ) properties.push("DAGGERHEART.EffectType.Temporary");
    else properties.push("DAGGERHEART.EffectType.Passive");
    if ( this.type === "enchantment" ) properties.push("DAGGERHEART.ENCHANTMENT.Label");

    return {
      content: await foundry.applications.handlebars.renderTemplate(
        "systems/daggerheart/templates/effects/parts/effect-tooltip.hbs", {
          effect: this,
          description: await TextEditor.enrichHTML(this.description ?? "", { relativeTo: this, ...enrichmentOptions }),
          durationParts: this.duration.remaining ? this.duration.label.split(", ") : [],
          properties: properties.map(p => game.i18n.localize(p))
        }
      ),
      classes: ["daggerheart2", "daggerheart-tooltip", "effect-tooltip"]
    };
  }

  /* -------------------------------------------- */

  /** @override */
  async deleteDialog(dialogOptions={}, operation={}) {
    const type = game.i18n.localize(this.constructor.metadata.label);
    return foundry.applications.api.DialogV2.confirm(foundry.utils.mergeObject({
      window: { title: `${game.i18n.format("DOCUMENT.Delete", { type })}: ${this.name}` },
      position: { width: 400 },
      content: `
        <p>
            <strong>${game.i18n.localize("AreYouSure")}</strong> ${game.i18n.format("SIDEBAR.DeleteWarning", { type })}
        </p>
      `,
      yes: { callback: () => this.delete(operation) }
    }, dialogOptions));
  }
}
