import UserSystemFlags from "../data/user/user-system-flags.mjs";
import SystemFlagsMixin from "./mixins/flags.mjs";

/**
 * Extend the basic User implementation.
 * @extends {User}
 */
export default class UserDH extends SystemFlagsMixin(User) {
  /** @inheritDoc */
  get _systemFlagsDataModel() {
    return UserSystemFlags;
  }
}
