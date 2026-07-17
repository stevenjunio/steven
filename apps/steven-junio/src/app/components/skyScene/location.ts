export const PORTFOLIO_LOCATION = {
  city: "San Jose, CA",
  latitude: 37.3382,
  longitude: -121.8863,
  timeZone: "America/Los_Angeles",
} as const;

export const PORTFOLIO_COORDINATES =
  `${PORTFOLIO_LOCATION.latitude},${PORTFOLIO_LOCATION.longitude}` as const;
