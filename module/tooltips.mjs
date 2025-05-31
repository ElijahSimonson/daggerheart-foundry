const TooltipManager = foundry.helpers.interaction.TooltipManager.implementation;

/**
 * A class responsible for orchestrating tooltips in the system
 */
export default class TooltipsDH {
  /* -------------------------------------------- */
  /*  Properties & Getters                        */
  /* -------------------------------------------- */

  /**
   * The currently registered observer
   * @type {MutationObserver}
   */
  #observer;

  /**
   * The tooltip element
   * @type {HTMLElement}
   */
  get tooltip() {
    return document.getElementById("tooltip");
  }

  /* -------------------------------------------- */
  /*  Methods                                     */
  /* -------------------------------------------- */

  /**
   * Initialize the mutation observer.
   */
  observe() {
    this.#observer?.disconnect();
    this.#observer = new MutationObserver(this._onMutation.bind(this));
    this.#observer.observe(this.tooltip, { attributeFilter: ["class"], attributeOldValue: true });
  }

  /* -------------------------------------------- */

  /**
   * Handle a mutation event.
   * @param {MutationRecord[]} mutationList  The list of changes.
   * @protected
   */
  _onMutation(mutationList) {
    let isActive = false;
    const tooltip = this.tooltip;
    for ( const { type, attributeName, oldValue } of mutationList ) {
      if ( (type === "attributes") && (attributeName === "class") ) {
        const difference = new Set(tooltip.classList).difference(new Set(oldValue?.split(" ")));
        if ( difference.has("active") ) isActive = true;
      }
    }
    if ( isActive ) this._onTooltipActivate();
  }

  /* -------------------------------------------- */

  /**
   * Handle tooltip activation.
   * @protected
   * @returns {Promise}
   */
  async _onTooltipActivate() {
    // General content links
    if ( game.tooltip.element?.classList.contains("content-link") ) {
      const doc = await fromUuid(game.tooltip.element.dataset.uuid);
      return this._onHoverContentLink(doc);
    }

    const loading = this.tooltip.querySelector(".loading");

    // Sheet-specific tooltips
    if ( loading?.dataset.uuid ) {
      const doc = await fromUuid(loading.dataset.uuid);
      if ( doc instanceof dnd5e.documents.Actor5e ) return this._onHoverActor(doc);
      return this._onHoverContentLink(doc);
    }

    // Passive checks
    else if ( loading?.dataset.passive !== undefined ) {
      const { skill, ability, dc } = game.tooltip.element?.dataset ?? {};
      return this._onHoverPassive(skill, ability, dc);
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle hovering some part of an actor's sheet.
   * @param {ActorDH} actor  The actor.
   * @protected
   */
  async _onHoverActor(actor) {
    const { attribution, attributionCaption } = game.tooltip.element.dataset;
    if ( !attribution ) return;
    this.tooltip.innerHTML = await actor.getAttributionData(attribution, { title: attributionCaption });
  }

  /* -------------------------------------------- */

  /**
   * Handle hovering over a content link and showing rich tooltips if possible.
   * @param {Document} doc  The document linked by the content link.
   * @protected
   */
  async _onHoverContentLink(doc) {
    const { content, classes } = await (doc.richTooltip?.() ?? doc.system?.richTooltip?.() ?? {});
    if ( !content ) return;
    this.tooltip.innerHTML = content;
    classes?.forEach(c => this.tooltip.classList.add(c));
    const { tooltipDirection } = game.tooltip.element.dataset;
    requestAnimationFrame(() => this._positionItemTooltip(tooltipDirection));
  }

  /* -------------------------------------------- */

  /**
   * Position a tooltip after rendering.
   * @param {string} [direction]  The direction to position the tooltip.
   * @protected
   */
  _positionItemTooltip(direction) {
    if ( !direction ) {
      direction = TooltipManager.TOOLTIP_DIRECTIONS.LEFT;
      game.tooltip._setAnchor(direction);
    }

    const pos = this.tooltip.getBoundingClientRect();
    const dirs = TooltipManager.TOOLTIP_DIRECTIONS;
    switch ( direction ) {
      case dirs.UP:
        if ( pos.y - TooltipManager.TOOLTIP_MARGIN_PX <= 0 ) direction = dirs.DOWN;
        break;
      case dirs.DOWN:
        if ( pos.y + this.tooltip.offsetHeight > window.innerHeight ) direction = dirs.UP;
        break;
      case dirs.LEFT:
        if ( pos.x - TooltipManager.TOOLTIP_MARGIN_PX <= 0 ) direction = dirs.RIGHT;
        break;
      case dirs.RIGHT:
        if ( pos.x + this.tooltip.offsetWidth > window.innerWith ) direction = dirs.LEFT;
        break;
    }

    game.tooltip._setAnchor(direction);

    // Set overflowing styles for item tooltips.
    if ( tooltip.classList.contains("item-tooltip") ) {
      const description = tooltip.querySelector(".description");
      description?.classList.toggle("overflowing", description.clientHeight < description.scrollHeight);
    }
  }

  /* -------------------------------------------- */
  /*  Static Helpers                              */
  /* -------------------------------------------- */

  /**
   * Intercept middle-click listeners to prevent scrolling behavior inside a locked tooltip when attempting to lock
   * another tooltip.
   */
  static activateListeners() {
    document.addEventListener("pointerdown", event => {
      if ( (event.button === 1) && event.target.closest(".locked-tooltip") ) {
        event.preventDefault();
      }
    }, { capture: true });
  }
}
