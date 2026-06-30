export interface NotificationPreferences {
  channels: { inApp: boolean; email: boolean; push: boolean };
  events: {
    proofVerified: boolean;
    proofRevoked: boolean;
    watchedAddressActivity: boolean;
    circuitRegistered: boolean;
    systemAnnouncements: boolean;
  };
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  channels: { inApp: true, email: false, push: false },
  events: {
    proofVerified: true,
    proofRevoked: true,
    watchedAddressActivity: true,
    circuitRegistered: false,
    systemAnnouncements: true,
  },
};

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

/** Merge a stored prefs blob + a patch onto the defaults (pure — unit tested). */
export function mergePreferences(
  stored: unknown,
  patch: DeepPartial<NotificationPreferences> = {},
): NotificationPreferences {
  const s = (stored ?? {}) as DeepPartial<NotificationPreferences>;
  return {
    channels: { ...DEFAULT_PREFERENCES.channels, ...s.channels, ...patch.channels },
    events: { ...DEFAULT_PREFERENCES.events, ...s.events, ...patch.events },
  };
}

/** Does the user want this event on this channel? */
export function wants(
  prefs: NotificationPreferences,
  event: keyof NotificationPreferences["events"],
  channel: keyof NotificationPreferences["channels"],
): boolean {
  return prefs.channels[channel] && prefs.events[event];
}
