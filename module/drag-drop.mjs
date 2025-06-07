/**
 * Valid `dropEffect` value (see https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/dropEffect).
 * @typedef {"copy"|"move"|"link"|"none"} DropEffectValue
 */

/**
 * Extension of core's DragDrop class to provide additional information used by the system. Will replace core's
 * version in the global namespace.
 */
export default class DragDropDH extends foundry.applications.ux.DragDrop {

  /**
   * Drop effect used for current drag operation.
   * @type {DropEffectValue|null}
   */
  static dropEffect = null;

  /* -------------------------------------------- */

  /**
   * Stored drag event payload.
   * @type {{ data: any, event: DragEvent }|null}
   */
  static #payload = null;

  /* -------------------------------------------- */

  /** @override */
  async _handleDragStart(event) {
    await this.callback(event, "dragstart");
    if ( event.dataTransfer.items.length ) {
      event.stopPropagation();
      let data = event.dataTransfer.getData("application/json") || event.dataTransfer.getData("text/plain");
      try { data = JSON.parse(data); } catch(err) {}
      DragDropDH.#payload = data ? { event, data } : null;
    } else {
      DragDropDH.#payload = null;
    }
  }

  /* -------------------------------------------- */

  /** @override */
  async _handleDragEnd(event) {
    await this.callback(event, "dragend");
    DragDropDH.dropEffect = null;
    DragDropDH.#payload = null;
  }

  /* -------------------------------------------- */

  /**
   * Get the data payload for the current drag event.
   * @param {DragEvent} event
   * @returns {any}
   */
  static getPayload(event) {
    if ( !DragDropDH.#payload?.data ) return null;
    return DragDropDH.#payload.data;
  }
}
