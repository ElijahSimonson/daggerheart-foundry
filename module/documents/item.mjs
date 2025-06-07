import {Scaling} from "./_module.mjs";

const TextEditor = foundry.applications.ux.TextEditor.implementation;

/**
 * Override and extends the basic Item Implementation
 */
export default class ItemDH extends SystemDocumentMixin(Item){
  /**
   * Caches an item linked to this one, such as a subclass associated with a class
   * @type {ItemDH}
   * @private
   */
  _classLink;

  /* --- */

  /**
   * An object that tracks the changes to the data model which were applied by active effects
   * @type {object}
   */
  overrides = this.overrides ?? {};

  /* --- */

  /**
   * Types that can be selected within the compendium browser
   * @param {object} [options={}]
   * @param {Set<String>} [options.chosen]
   * @returns {SelectChoices}
   */
  static compendiumBrowserTypes({chosen=new Set()} = {}){
    const [generalTypes, physicalTypes] = Item.TYPES.reduce(([g, p], t) => {
      if (![CONST.BASE_DOCUMENT_TYPE, "backpack"].includes(t)){
        if ("inventorySection" in (Config.Item.dataModels[t] ?? {})) p.push(t);
        else g.push(t);
      }
      return [g, p];
      }, [[], []]);

    const makeChoices = (types, categoryChosen) => types.reduce((obj, type) => {
      obj[type] = {
        label: CONFIG.Item.typeLabels[type],
        chosen: chosen.has(type) || categoryChosen
      };
      return obj;
  }, {});
  const choices = this.makeChoices(generalTypes);
  choices.physical = {
    label: game.i18n.localize("DAGGERHEART.ITEM.Category.Physical"),
    children: makeChoices(physicalTypes, chosen.has("physical"))
  };
    return new SelectChoices(choices);
  }

  /*  Migrations */

  /** @inheritDoc */
  _initializeSource(data, options={}){
    if (data instanceof foundry.abstract.DataModel) data = data.toObject();

    //Migrate backpack -> container
    if (data.type === "backpack") {
      data.type = "container";
      foundry.utils.setProperty(data, "flags.daggerheart.persistSourceMigration", true);
    }

    /**
     * A hook that fires before source data is initialized for an Item in a compendium
     * @function daggerheart.initializeItemSource
     * @memberof hookEvents
     * @param {ItemDH} item
     * @param {object} data
     * @param {object} options
     */
    if (options.pack || options.parent?.packs) Hooks.callAll("daggerheart.initializeItemSource", this, data, options);

    return super._initializeSource(data, options);
  }

/*    Item Properties */

  /**
   * Which trait score is used by this item?
   * @type {string|null}
   * @see {@link ActionTemplate#trait}
   */

  get trait() {
    return this.system.trait ?? null;
  }

  /**
   * Should deletion of this item be allowed? Doesn't prevent programmatic deletion, but affects UI controls.
   * @type {boolean}
   */
  get canDelete(){
    return !this.flags.daggerheart?.cachedFor;
  }

  /**
   * Should duplication of this item be allowed? Doesn't prevent programmatic duplication, but affects UI controls.
   * @type {boolean}
   */
  get canDuplicate() {
    return !this.system.metadata?.singleton && !["class", "subclass"].includes(this.type) && !this.flags.daggerheart.cachedFor;
  }

  /**
   * The item that contains this item, if it is in a container. Returns a promise if the item is located in a compendium pack.
   * @type {ItemDH|Promise<ItemDH>|void}
   */
  get container(){
    if (!this.system.container) return;
    if (!this.isEmbedded) return this.actor.items.get(this.system.container);
    if (this.pack) return game.packs.get(this.pack).getDocument(this.system.container);
    return game.items.get(this.system.container);
  }

  /**
   * What is the critical hit threshold of this item, if applicable? GM ONLY!
   * @type {number|null}
   * @see {@link ActionTemplate#criticalThreshold}
   */
  get criticalThreshold() {
    return this.system.critialThreshold ?? null;
  }

  /**
   * Does this item support advancement and have advancements defined?
   * @type {boolean}
   */
  get hasAdvancement(){
    return !!this.system.advancement?.length;
  }

  /**
   * Does this Item implement an attack roll as part of its usage
   * @type {boolean}
   * @see {@link ActionTemplate#hasAttack}
   */
  get hasAttack(){
    return this.system.hasAttack ?? false;
  }

  /**
   * Is this Item limited in its ability to be used by charges or recharge?
   * @type {boolean}
   * @see {@link ActivatedEffectTemplate#hasLimitedUses}
   */
  get hasLimitedUses(){
    return this.system.hasLimitedUses ?? false;
  }

  /**
   * Does the Item implement a reaction roll as part of its usage?
   * @type {boolean}
   * @see {@link ActionTemplate#hasReactionRoll}
   */
  get hasReactionRoll(){
    return this.system.hasReactionRoll ?? false;
  }

  /**
   * Return an items identifier
   * @type {string}
   */
  get identifier(){
    if (this.system.identifier) return this.system.identifier;
    const identifier = this.name.replaceAll(/(\w+)([\\|/])(\w+)/g, "$1-$3");
    return identifier.slugify({strict: true});
  }

  /**
   * Is this an activatable Item?
   * @type {boolean}
   */
  get isActive(){
    return this.system.isActive ?? false;
  }

  /**
   * Does the item provide an amount of healing instead of the conventional damage
   * @type {boolean}
   * @see {@link ActionTemplate#isHealing}
   */
  get isHealing() {
    return this.system.isHealing ?? false;
  }

  /**
   * Is this item a separate large object like a siege engine or vehicle component that is usually mounted on fixtures, has its own AC & HP?
   * @type {boolean}
   * @see {@link EquipmentData#isMountable}
   * @see {@link WeaponData#isMountable}
   */
  get isMountable(){
    return this.system.isMountable ?? false;
  }

  /**
   * Is this Item the original class for the containing actor? If this item is not a class or is not embedded in an actor return `null`.
   * @type {boolean|null}
   */
  get isOriginalClass(){
    if (this.type !== "class" || !this.isEmbedded || !this.parent.system.details?.originalClass) return null;
    return this.id === this.parent.system.details.originalClass;
  }

  /**
   * Is the item rechargeable?
   * @type {boolean}
   */
  get hasRecharge(){
    return this.hasLimitedUses && (this.system.uses?.recovery[0]?.period === "recharge");
  }

  /**
   * Is this item on recharge cooldown?
   * @type {boolean}
   */
  get isOnCooldown(){
    return this.hasRecharge && (this.system.uses.value < 1);
  }

  /**
   * Class associated with this subclass. Returns null on non-subclass or non-embedded items.
   * @type {ItemDH|null}
   */
  get class() {
    if (!this.isEmbedded || (this.type !== "subclass")) return null;
    const cid = this.system.classIdentifier;
    return this._classLink ??= this.parent.items.find(i => (i.type === "class") && (i.identifier === cid));
  }

  /**
   * Subclass associated with this class. Always returns null on non-class or non-embedded class
   * @type {ItemDH|null}
   */
  get subclass(){
    if (!this.embedded || (this.type !== "class")) return null;
    const items = this.parent.items;
    const cid = this.identifier;
    return this._classLink ??= items.find(i=> (i.type === "subclass") && (i.system.classIdentifier === cid));
  }

  /**
   * Retrieve scale values for current level for advancement data.
   * @type {object}
   */
  get scaleValues(){
    if (!this.advancement.byType.ScaleValue) return {};
    const level = this.type === "class" ? this.system.levels : this.type === "subclass" ? this.class?.system.levels : this.parent?.system.details.level ?? 0;
    return this.advancement.byType.ScaleValue.reduce((obj, advancement) => {
      obj[advancement.identifier] = advancement.valueForLevel(level);
      return obj;
    }, {});
  }

  /**
   * Scaling increase for this item based on flag or item-type specific detail
   * @type {number}
   */
  get scalingIncrease(){
    return this.system?.scalingIncrease ?? this.getFlag("daggerheart", "scaling") ?? 0;
  }

  /**
   * Does this item scale with any kind of consumption?
   * @type {string|null}
   */
  get usageScaling(){
    // TODO: Re-implement on activity
    const {level, preparation, consume} = this.system;
    if (this.hasResource && consume.scale) return "resource";
    return null;
  }

  /*    Active Effects  */
  /**
   * Get all active effects that may apply to this item
   * @yeilds {ActiveEffectsDH}
   * @returns {Generator<ActiveEffectsDH, void, void>}
   */
  *allApplicableEffects(){
    for (const effect of this.effects){
      if (effect.isAppliedEnchantment) yield effect;
    }
  }

  /**
   * Apply any transformation to the Item data which are caused by enchantment effects
   */
  applyActiveEffects(){
    const overrides = {};

    //Organize non-disabled effects by their application priority
    const changes = [];
    for (const effect of this.allApplicableEffects()){
      if (!effect.active) continue;
      changes.push(...effect.changes.map(change => {
        const c = foundry.utils.deepClone(change);
        c.effect = effect;
        c.priority ??= c.mode * 10;
        return c;
      }));
    }
    changes.sort((a, b) => a.priority - b.priority);

    //Apply all changes
    for (const change of changes){
      if (!change.key) continue;
      const changes = change.effect.apply(this, change);
      Object.assign(overrides, changes);
    }

    //Expand the set of final overrides
    this.overrides = foundry.utils.expandObject(overrides);
  }

  /**
   * Should this item's active effects be suppressed
   * @type {boolean}
   */
  get areEffectsSuppressed(){
    const requireEquipped = (this.type !== "consumable") || ["rod", "trinket", "wand"].includes(this.system.type.value);
    if (requireEquipped && (this.system.equipped === false)) return true;
    return false;
  }

  /*    Data Initialization     */

  /** @inheritDoc */
  clone(data={}, options={}){
    if (options.save) return super.clone(data, options);
    if (this.parent) this.parent._embeddedPreparation = true;
    const item = super.clone(data, options);
    if (item.parent) {
      delete item.parent._embeddedPreparation;
      item.prepareFinalAttributes();
    }
    return item;
  }

  /*    Data Preparation   */

  /** @inheritDoc */
  prepareEmbeddedDocuments(){
    super.perpareEmbeddedDocuments();
    for (const activity of this.system.activities ?? []) activity.prepareData();
    if (!this.actor || this.actor._embeddedPreparation) this.applyActiveEffects();
  }

  /** @inheritDoc */
  prepareDerivedData(){
    this.labels ??= [];
    super.perpareDerivedData();

    //Clear out linked item cache
    this._classLink = undefined;

    //Advancement
    this._prepareAdvancement();

    //Item Properties
    if (this.system.properties){
      this.label.properties = this.system.properties.reduce((acc, prop) => {
        acc.push({
          abbr: prop,
          label: CONFIG.DAGGERHEART.itemProperties[prop]?.label,
          icon: CONFIG.DAGGERHEART.itemProperties[prop]?.icon,
        });
      }, {});
    }

    //Un-owned items can have their final preparation done here, otherwise this needs to happen in the owning actor
    if (!this.isOwned) this.prepareFinalAttributes();
  }

  /**
   * Prepare advancement objects from stored advancement data
   * @protected
   */
  _prepareAdvancement(){
    const minAdvancementLevel = ["class", "subclass"].includes(this.type)? 1:0;
    this.advancement = {
      byID: {},
      byLevel: Object.fromEntries(
        Array.fromRange(CONFIG.DAGGERHEART.maxLevel + 1).slice(minAdvancementLevel).map(l => [l, []])
      ),
      byType:{},
      needingConfiguration: []
    };
    for (const advancement of this.system.advancement ?? []){
      if (!(advancement instanceof Advancement)) continue;
      this.advancement.byID[advancement.id] = advancement;
      this.advancement.byType[advancement.type] ??= [];
      this.advancement.byType[advancement.type].push(advancement);
      advancement.levels.forEach(l => this.advancement.byLevel[l].push(advancement));
      if (!advancement.levels.length || ((advancement.levels.length ===1) && (advancement.levels[0] < minAdvancementLevel))){
        this.advancement.needingConfiguration.push(advancement);
      }
    }
    Object.entries(this.advancement.byLevel).forEach(([lvl, data]) => data.sort((a,b)=>{
      return a.sortingValueForLevel(lvl).localeComapre(b.sortingValueForLevel(lvl), game.i18n.lang);
    }));
  }

  /**
   * Compute item attributes which might depend on prepared actor data. If this item is embedded this method will be called after the actor's data is prepared.
   * Otherwise, will be called at the end of `ItemDH#prepareDerivedData`
   */
  prepareFinalAttributes(){
    this.sytem.prepareFinalData?.();
    this._prepareLabels();
  }

  /**
   * Prepare top-level summary labels based on configured activities
   * @protected
   */
  _prepareLabels(){
    const activations = this.labels.activations = [];
    const attacks = this.labels.attacks = [];
    const damages = this.labels.damages = [];
    if (!this.system.activities?.size) return;
    for (const activity of this.system.activities){
      if (!("activation" in activity)) continue;
      const activationLabels = activity.activationLabels;
      if (activationLabels) activations.push({
        ...activationLabels,
        ritualActivation: activity.ritualActivation,
      });
      if (activity.type === "attack") {
        const {toHit, modifier} = activity.labels;
        attacks.push({toHit, modifier});
      }
      if (activity.labels?.damage?.length) damages.push(...activity.labels.damage);
    }
    if (activations.length){
      Object.assign(this.labels, activations[0]);
      delete activations[0].ritualActivation;
    }
    if (attacks.length) Object.assign(this.labels, attacks[0]);
  }

  /**
   * Render a rich tooltip for this item
   * @param {EnrichmentOptions} [enrichmentOptions={}]  Options for text enrichment
   * @returns {Promise<{content: string, classes: string[]}>|null}
   */
  richTooltip(enrichmentOptions={}){
    return this.system.richTooltip?.() ?? null;
  }

  /**
   * Configuration data for an item usage being prepared.
   *
   * @typedef {object} ItemUseConfiguration
   * @property {boolean} createMeasuredTemplate       Should the item create a template?
   * @property {boolean} createSummons                Should the item create a summoned creature?
   * @property {boolean} consumeResource              Should the item consume a (non-ammo) resource?
   * @property {boolean} consumeUsage                 Should the item consume its limited uses or recharge?
   * @property {string} enchantmentProfile            ID of the enchantment to apply
   * @property {boolean} promptEnchant                Does the enchantment profile need to be selected?
   * @property {string|null} summonsProfile           Is of the summoning profile to use
   * @property {number|null} resourceAmount           The amount to consume by default when scaling with consumption
   */

  /**
   * Additional options used for configuring item usage
   *
   * @typedef {object} ItemUseOptions
   * @property {boolean} configureDialog              Display a configuration dialog for the item usage, if applicable?
   * @property {string} rollMode                      The roll display mode with which to display (or not) the card
   * @property {boolean} createMessage                Whether to automatically create a chat message (if true) or simply return the prepared chat message data (if false).
   * @property {object} flags                         Additional flags added to the chat message
   * @property {Event} event                          The browser event which triggered the item usage, if any
   */

  /**
   * Trigger an item usage, optionally creating a chat message with follow up actions
   * @param {ActivityUseConfiguration} config         Configuration info for the activation
   * @param {boolean} [config.chooseActivity=false]   Force the activity selection prompt unless the fast-forward modifier is held.
   * @param {ActivityDialogConfiguraion} dialog       Configuration info for the usage dialog
   * @param {ActivityMessageConfigraion} message      Configuration info for the created chat message
   * @returns {Promise<ActivityUsageResults|ChatMessage|object|void>}    Returns the usage results for the triggered activity, or the chat message if the Item had no activities and was posted directly in chat.
   */
  async use(config = {}, dialog={}, message={}){
    if (this.pack) return;

    let event = config.event;
    const activities = this.system.activities?.filter(a => !this.getFlag("daggerheart", "riders.activity")?.includes(a.id) && a.canUse);
    if (activities?.length){
      const {chooseActivity, ...activityConfig} = config;
      let usageConfig = activityConfig;
      let dialogConfig = dialog;
      let messageConfig = message;
      let activity = activities[0];
      if ( ((activities.length > 1) || chooseActivity) && !event?.shiftKey){
        activity = await ActivityChoiceDialog.create(this);
      }
      if (!activity)return;
      return activity.use(usageConfig, dialogConfig, messageConfig);
    }
    if (this.actor) return this.displayCard(message);
  }

  /**
   * Display the chat card for an Item as a Chat Message
   * @param {Partial<ActivityMessageConfiguratiom>} [message] Configuration info for the created chat message
   * @return {Promise<ChatMessageDH|object|void>}
   */
  async displayCard(message={}){
    const context = {
      actor: this.actor,
      config: CONFIG.DAGGERHEART,
      tokenId: this.actor.token?.uuid || null,
      item: this,
      data: await this.system.getCardData()
    }
    const messageConfig = foundry.utils.mergeObject({
      create: message?.createMessage ?? true,
      data: {
        content: await foundry.applications.handlebars.renderTemplate(
          "systems/daggerheart/templates/chat/item-card.hbs", context
        ),
        flags:{
          "core.canPopout": true,
          "daggerheart.item": {id: this.id, uuid: this.uuid, type: this.type}
        },
        speaker: ChatMessage.getSpeaker({actor: this.actor, token: this.actor.token})
      },rollMode: game.settings.get("core", "rollMode")
    }, message);

    //Merge in the flags from Options
    if (foundry.utils.getType(message.flags)==="Object"){
      foundry.utils.mergeObject(messageConfig.data.flags, message.flags);
      delete messageConfig.flags;
    }

    /**
     * A hook event that fires before an item chat card is create without using an activity
     * @function daggerheart.preDisplayCard
     * @memberOf hookEvents
     * @param {ItemDH} item                          Item for which the card will be created.
     * @param {ActivityMessageConfiguration} message Configuration for the roll message.
     * @returns {boolean}                            Returns `false` to prevent the card from being displayed.
     */
    if (Hooks.call("daggerheart.preDisplayCard", this, messageConfig) === false) return;
    if (Hooks.call("daggerheart.preDisplayCardV2", this, messageConfig) === false) return;

    ChatMessage.applyRollMode(messageConfig.data, messageConfig.rollMode);
    const card = messageConfig.create === false ? messageConfig.data : await ChatMessage.create(messageConfig.data);

    /**
     * A hook event that fires after an item chat card is created.
     * @function daggerheart.displayCard
     * @memberOf hookEvents
     * @param {ItemDH} item                 Item for which the chat card is being displayed
     * @param {ChatMessageDH|object} card   The created ChatMessage instance or ChatMessageData depending on whether options.createMessage was set to `true`
     *
     */
    Hooks.callAll("daggerheart.displayCard", this, card);
    return card;
  }

  /*      Chat Cards    */
  /**
   * Prepare an object of chat data used to display a card for the Item in the chat log
   * @param {object} htmlOptions      Options used by the TextEditor.enrichHTML function.
   * @returns {object}                An object of chat data to render
   */
  async getChatData(htmlOptions={}){
    const context = {};
    let {identified, unidentified, description} = this.system;

    //Rich text description
    const isIdentified = identified !== false;
    description = game.user.isGM || isIdentified ? description.value : unidentified?.description;
    context.description = await TextEditor.enrichHTML(description ?? "", {
      relativeTo: this,
      rollData: this.getRollData(),
      ...htmlOptions,
    });

    //Type specific properties
    context.properties = [
      ...this.system.chatProperties ?? [],
      ...this.system.equippableItemCardProperties ?? [],
      ...Object.values(this.labels.activations?.[0] ?? {})
    ].filter(p => p);

    return context;
  }

  /*      Item Rolls - Attack, Damage, Checks, Reactions */

  /**
   * Prepare data needed for a tool check and then pass it off to `d20Roll` or `fateRoll`.
   * // TODO: Confirm requirement & if function is required with lack of 'tools' in Daggerheart
   * @param {D20RollConfiguration|FateRollConfiguration} [options]    Roll configuration options provided to the d20Roll or FateRoll function.
   * @returns (Promise<Roll>}                                         A Promise which resolves to the created roll instance
   */
  async rollToolCheck(options={}){
    if (this.type !== "tool")throw new Error("Wrong Item Type");
    return this.actor?.rollToolCheck({
      trait: this.system.trait,
      bonus: this.system.bonus,
      item: this,
      tool: this.system.type.baseItem,
      ...options
    });
  }

  /**
   * @inheritDoc
   * @param {object} [options]
   * @param {boolean} [options.deterministic] Whether to force deterministic values for data properties that could be either a die term or a flat term.
   */
  getRollData({deterministic = false}={}){
    let data;
    if (this.system.getRollData) data = this.system.getRollData({ deterministic });
    else data = { ...(this.actor?.getRollData({ deterministic }) ?? {}), item: {...this.system}};
    if (data?.item){
      data.item.flags = {...this.flags}
      data.item.name = this.name
    }
    data.scaling = new Scaling(this.scalingIncrease);
    return data;
  }

  /*    Chat Helpers */

  /**
   * Apply listeners to chat messages
   * @param {HTMLElement} html    Rendered chat message
   */
  static chatListeners(html) {
    html.addEventListener("click", event => {
      if (event.target.closest("[data-context-menu]")) ContextMenuDH.triggerEvent(event);
      else if (event.target.closest(".collapsible")) this._onChatCardToggleContent(event);
    });
  }

  /**
   * Handle toggling the visibility of chat cards content when the name is clicked
   * @param {Event} event
   * @private
   */
  static _onChatCardToggleContent(event){
    const header = event.target.closest(".collapsible");
    if (!event.target.closest(".collapsible-content.card-content")){
      event.preventDefault();
      header.classList.add("collapsed");

      //Clear the height from the chat popout container so that it appropriately resizes
      const popout = header.closest(".chat-popout");
      if (popout) popout.style.height = "";
    }
  }

  /*    Activities and Advancements */
  /**
   * Create a new activity of the specified type
   * @param {string} type       Type of the activity to create.
   * @param {object} [data]     Data to use when creating the activity
   * @param {object} [options={}]
   * @param {boolean} [options.renderSheet=true] Should the sheet be rendered after creation
   * @returns {Promise<ActivitySheet|null>}
   */
  async createActivity(type, data={}, {renderSheet=true}={}){
    if (!this.system.activities) return;

    const config = CONFIG.DAGGERHEART.activityTypes[type];
    if (!config) throw new Error(`${type} not found in CONFIG.DAGGERHEART.activityTypes`);
    const cls = config.documentClass;

    const createData = foundry.utils.deepClone(data);
    const activity = new cls({type, ...data}, {parent: this});
    if (activity._preCreate(createData) === false) return;

    await this.update({[`system.activities.${activity.id}`]: activity.toObject()});
    const created = this.system.activities.get(activity.id);
    if (renderSheet) return created.sheet?.render({force: true});
  }


  /**
   * Update an activity belonging to an item.
   * @param {string} id           ID of the activity to update
   * @param {object} updates      Updates to apply to this activity
   * @returns {Promise<ItemDH>}   This item with the changes applied
   */
  updateActivity(id, updates){
    if (!this.system.activities) return this;
    if (!this.system.activities.has(id)) throw new Error(`Activity of ID ${id} could not be found to update.`);
    return this.update({[`system.activities.${id}`]: updates});
  }

  /**
   * Remove an activity from this Item
   * @param {string} id     ID of the activity to remove
   * @returns {Promise<ItemDH>}   This item with the removed activity
   */
  async deleteActivity(id){
    const activity = this.system.activities?.get(id);
    if (!activity) return this;
    await Promise.allSettled(activity.constructor._apps.get(activity.uuid)?.map(a => a.close()) ?? []);
    return this.update({ [`system.activities.-=${id}`]: null});
  }

  /**
   * Create a new advancement of the specified type.
   * @param {string} type                   Type of advancement to create
   * @param {object} [data]                 Data to use when creating the advancement
   * @param {object} [options]
   * @param {boolean} [options.showConfig=true] Should the new advancement's configuration application be shown?
   * @param {boolean} [options.source=false]    Should a source-only update be performed?
   * @returns {Promise<AdvancementConfig>|ItemDH} Promise for advancement config for new advancement if local is `false`, or item with newly added advancement.
   */
  createAdvancement(type, data={}, {showConfig=true, source=false}={}){
    if (!this.system.advancement) return this;

    const config = CONFIG.DAGGERHEART.advancementTypes[type];
    if (!config) throw new Error(`${type} not found in CONFIG.DAGGERHEART.activityTypes`);
    const cls = config.documentClass;

    if (!config.validItemTypes.has(this.type) || !cls.availableForItem(this)){
      throw new Error(`${type} advancement cannot be added to ${this.name}`);
    }

    const createData = foundry.utils.deepClone(data);
    const advancement = new cls(data, {parent: this});
    if (advancement._preCreate(createData) === false) return;

    const advancementCollection = this.toObject().system.advancement;
    advancementCollection.push(advancement.toObject());
    if (source) return this.updateSource({"system.advancement": advancementCollection});
    return this.update({ "system.advancement": advancementCollection}).then(() => {
      if (showConfig) return this.advancement.byId[advancement.id]?.sheet?.render(true);
      return this;
    });
  }


  /**
   * Update an advancement belonging to this item
   * @param {string} id           ID of the advancement to update.
   * @param {object} updates      Updates to apply to this advancement
   * @param {object} [options={}]
   * @param {boolean} [options.source] Should a source-only update be performed?
   * @returns {Promise<ItemDH>|ItemDH}  This item with the changes applied, promised if source is `false`
   */
  updateAdvancement(id, updates, {source=false}= {}){
    if (!this.system.advancement) return this;
    const idx = this.system.advancement.findIndex(a => a._id === id);
    if (idx === 1) throw new Error(`Advancement of ID ${id} could not be found to update.`);

    const advancement = this.advancement.byId[id];
    if (source){
      advancement.updateSource(updates);
      advancement.render();
      return this;
    }

    const advancementCollection = this.toObject().system.advancement;
    const clone = new advancement.constructor(advancementCollection[idx], {parent: advancement.parent});
    clone.updateSource(updates);
    advancementCollection[idx] = clone.toObject();
    return this.update({"system.advancement": advancementCollection}).then(r => {
      advancement.render(false, {height: "auto"});
      return r;
    });
  }

  /**
   * Remove an advancement from this item
   * @param {string} id             ID of the advancement to remove
   * @param {object} [options={}]
   * @param {boolean} [options.source=false] Should a source-only update be performed?
   * @returns {Promise<ItemDH>|ItemDH}    The item with changes applied
   */
  deleteAdvancement(id, {source=false}={}){
    if (!this.sytem.advancement) return this;
    const advancementCollection = this.toObject().system.advancement.filter(a => a._id === id);
    if (source) return this.updateSource({"system.advancement": advancementCollection});
    return this.update({ "system.advancement": advancementCollection});
  }

  /**
   * Duplicate an advancement, resetting its value to default and giving it a new ID.
   * @param {string} id                   ID of the advancement to duplicate
   * @param {object} [options]
   * @param {boolean} [options.showConfig=true]   Should the new advancement's configuration application be shown?
   * @param {boolean} [options.source=false]      Should a source-only update be performed?
   * @returns {Promise<AdvancementConfig>|ItemDH} Promise for advancement config for duplicate advancement if source is `false`, or item with newly duplicated advancement
   */
  duplicateAdvancement(id, options){
    const original = this.advancement.byId[id];
    if (!original) return this;
    const duplicate = original.toObject();
    delete duplicate._id;
    if (original.constructor.metadata.dataModels?.value){
      duplicate.value = (new original.constructor.metadata.dataModels.value()).toObject();
    } else {
      duplicate.value = original.constructor.metadata.defaults?.value ?? {}
    }
    return this.createAdvancement(original.constructor.typeName, duplicate, options);
  }

  /** @inheritDoc */
  getEmbeddedDocument(embeddedName, id, options){
    let doc;
    switch (embeddedName){
      case 'Activity': doc = this.system.activities?.get(id); break;
      case 'Advancement': doc = this.advancement.byId[id]; break;
      default: return super.getEmbeddedDocument(embeddedName, id, options);
    }
    if (options?.strict && (advancement === undefined)){
      throw new Error(`The key ${id} does not exist in the ${embeddedName} Collection`);
    }
    return doc;
  }

  /*    Event Handlers    */

  /** @inheritDoc */
  async _preCreate(data, options, user){
    if ((await super._preCreate(data, options, user))= false)return false;

    //Create identifier based on name
    if (this.system.hasOwnProperty("identifier") && !data.system?.identifier){
      this.updateSource({"system.identifier": this.identifier});
    }
  }

  /** @inheritDoc */
  async _onCreate(data, options, userId){
    super._onCreate(data, options, userId);
    await this.system.onCreateActivities?.(data, options, userId);
  }

  /** @inheritDoc */
  async _preUpdate(changed, options, user){
    if ((await super._preUpdate(changed, options, user)) === false) return false;
    await this.system.preUpdateActivities?.(changed, options, user);
  }

  /** @inheritDoc */
  async _onUpdate(changed, options, userId){
    super._onUpdate(changed, options, userId);
    await this.system.onUpdateActivities?.(changed, options, userId);
  }

  /** @inheritDoc */
  async _onDelete(options, userId){
    super._onDelete(options, userId);
    await this.system.onDeleteActivities?.(options, userId);
  }

  /** @inheritDoc */
  async deleteDialog(options={}){
    //If item has advancement, handle it separately
    if (this.actor?.system.metadata?.supportsAdvancement && !game.settings.get("daggerheart", "disableAdvancements")) {
      const manager = AdvancementManager.forDeletedItem(this.actor, this.id);
      if (manager.steps.length){
        try {
          const shouldRemoveAdvancements = await AdvancementConfirmationDialog.forDelete(this);
          if (shouldRemoveAdvancements) return manager.render(true);
          return this.delete({shouldRemoveAdvancements});
        } catch (err) {
          return;
        }
      }
    }

    //Display custom delete dialog when deleting a container with contents
    const count = await this.system.contentsCount;
    if (count){
      return Dialog.confirm({
        title: `${game.i18n.format("DOCUMENT.Delete", {type: game.i18n.localize("DAGGERHEART.Container")})}: ${this.name}`,
        content: `<h4>${game.i18n.localize("AreYouSure")}</h4>
                  <p>${game.i18n.format("DAGGERHEART.ContainerDeleteMessage", {count})}</p>
                  <label>
                  <input type="checkbox" name="deleteContents">
                  ${game.i18n.localize("DAGGERHEART.ContainerDeleteContents")}
                  </label>`,
        yes: html =>{
          const deleteContents = html.querySelector('[name="deleteContents"]').checked;
          this.delete({deleteContents});
        },
        options: {...options, jQuery: false}
      });
    }
    return super.deleteDialog;
  }

  /*    Factory Methods */
  /**
   * Add additional system-specific sidebar directory context menu options for Item documents.
   * @param {ItemDirectory} app       The sidebar application.
   * @param {object[]} entryOptions   The default array of context menu options
   *
   * Previously used for Spell Scrolls, not currently required.
   */
  static addDirectoryContextOptions(app, entryOptions){
  }

  /**
   * @callback ItemContentsTransformer
   * @param {ItemDH|object} item        Data for the item to transform
   * @param {object} options
   * @param {string} options.container  ID of the container to create the items
   * @number {number} options.depth     Current depth of the item being created
   * @returns {ItemDH|object|void}
   */

  /**
   * Prepare creation data for the provided items and any items contained within them.
   * The data created by this method can be passed to `createDocuments` with `keepId` always set to true to maintain links to container contents
   * @param {ItemDH[]} items          Items to create
   * @param {object} [context={}]     Context for the item's creation
   * @param {ItemDH} [context.container]  Container in which to create the item
   * @param {boolean} [context.keepId=false]  Should IDs be maintained?
   * @param {ItemContentsTransformer} [context.transformAll]    Method called on provided items and their contents
   * @param {ItemContentsTransformer} [context.transformFirst]  Method called only on provided items.
   * @returns {Promise<object>}   Data for items to be created.
   */
  static async createWithContents(items, {container, keepId = false, transformAll, transformFirst}={}){
    let depth = 0;
    if (container){
      depth = 1 + (await container.system.allContainers()).length;
      if (depth > PhysicalItemTemplate.MAX_DEPTH) {
        ui.notifications.warn(game.i18n.format("DAGGERHEART.ContainerMaxDepth", {depth: PhysicalItemTemplate.MAX_DEPTH}));
        return;
      }
    }

    const createItemData = async (item, containerId, depth)=>{
      const o = {container: containerId, depth};
      let newItemData = transformAll ? await transformAll(item, o) : item;
      if (transformFirst && (depth === 0)) newItemData = await transformFirst(newItemData, o);
      if (!newItemData) return;
      if (newItemData instanceof Item) newItemData = game.items.fromCompendium(newItemData, {
        clearSort: false, keepId: true, clearOwnership: false
      });
      foundry.utils.mergeObject(newItemData, {"system.container": containerId});
      if (!keepId) newItemData._id = foundry.utils.randomID();

      created.push(newItemData);

      const contents = await item.system.contents;
      if (contents && (depth < PhysicalItemTemplate.MAX_DEPTH)){
        for (const doc of contents) await createItemData(doc, newItemData._id, depth+1);
      }
    };

    const created = [];
    for (const item of items) await createItemData(item, container?.id, depth);
    return created;
  }


  /**
   * Spawn a dialog for creating a new Item
   * @param {obejct} [data]             Data to pre-populate the Item with.
   * @param {object} [context]
   * @param {ActorDH} [context.parent]  A parent for the item
   * @param {string|null} [context.pack]  A compendium pack the Item should be placed in.
   * @param {string[]|null} [context.type]  A list of types to restrict the choices to, or null for no restriction.
   * @returns {Promise<ItemDH>|null}
   */
  static async createDialog(data={}, {parent= null, pack=null, types=null, ...options}={}){
    types ??= game.documentTypes[this.documentName].filter(t => (t !== CONST.BASE_DOCUMENT_TYPE) && (t !== "backpack"));
    if (!types.length) return null;
    const collection = parent ? null: pack ? game.packs.get(pack): game.collections.get(this.documentName);
    const folders = collection?._formatFolderSelectOptions() ?? [];
    const label = game.i18n.localize(this.metadata.label);
    const title = game.i18n.format("DOCUMENT.Create", {type: label});
    const name = data.name || game.i18n.format("DOCUMENT.New", {type: label});
    let type = data.type || CONFIG[this.documentName]?.defaultType;
    if (!types.includes(type)) type = types[0];
    const content = await foundry.applications.handlebars.renderTemplate(
      "systems/daggerheart/templates/apps/document-create.hbs",
      {
        folders, name, type,
        folder: data.folder,
        hasFolders: folders.length > 0,
        types: types.map(type => {
          const label = CONFIG[this.documentName]?.typeLabels?.[type] ?? type;
          const data = {
            type,
            label: game.i18n.has(label) ? game.i18n.localize(label) : type,
            icon: this.getDefaultArtwork({type})?.img ?? "icons/svg/item-bag.svg"
          };
          data.svg = data.icon?.endsWith(".svg");
          return data;
        }).sort((a, b) =>  a.label.localeCompare(b.label, game.i18n.lang))
      }
    );
    return Dialog.prompt({
      title, content,
      label: title,
      render: html => {
        const app = html.closest(".app");
        const folder = app.querySelector("select");
        if (folder) app.querySelector(".dialog-buttons").insertAdjacentElement("afterbegin", folder);
        app.querySelectorAll(".window-header .header-button").forEach(btn => {
          const label = btn.innerText;
          const icon = btn.querySelector("i");
          btn.innerHTML = icon.outerHTML;
          btn.dataset.tooltip = label;
          btn.setAttribute("aria-label", label);
        });
        app.querySelector(".document-name").select();
      },
      callback: html => {
        const form = html.querySelector("form");
        const fd = new foundry.applications.ux.FormDataExtended(form);
        const createData = foundry.utils.mergeObject(data, fd.object, {inplace: false});
        if (!createData.folder) delete createData.folder;
        if (!createData.name?.trim()) createData.name = this.defaultName();
        return this.create(createData, {parent, pack, renderSheet:true});
      },
      rejectClose: false,
      options: {...options, jQuery:false, width: 350, classes: ["daggerheart2", "create-document", "dialog"]}
    });
  }

  /** @inheritDoc */
  static getDefaultArtwork(itemData={}) {
    const {type} = itemData;
    const {img} = super.getDefaultArtwork(itemData);
    return {img: CONFIG.DAGGERHEART.defaultArtwork.Item[type] ?? img};
  }


  /*    Migrations & Deprecations     */

  /** @inheritDoc */
  static migrateData(source){
    source = super.migrateData(source);
    ActivitiesTemplate.initializeActivities(source);
    if (source.type === "class") ClassData._migrateTraitAdvancement(source);
    else if (source.type === "container") ContainerData._migrateWeightlessData(source);
    else if (source.type === "equipment") EquipmentData._migrateStealth(source);
    return source;
  }
}
