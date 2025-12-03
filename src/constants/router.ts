class Router {
  static HOME = "/";
  static SIGN_IN = "/signin";
  static UNAUTHORIZED = "/unauthorized";

  // Legal
  static TERMS = "/terms";
  static PRIVACY = "/privacy";

  // Organizations
  static ORGANIZATIONS = "/orgs";
  static CREATE_ORGANIZATION = `${Router.ORGANIZATIONS}/create`;
  static organizationDetail = (id: string) => `${Router.ORGANIZATIONS}/${id}`;
  static organizationForecasts = (id: string) =>
    `${Router.ORGANIZATIONS}/${id}/forecasts`;
  static forecastDetail = (orgId: string, forecastId: string) =>
    `${Router.ORGANIZATIONS}/${orgId}/forecasts/${forecastId}`;

  // Settings
  static SETTINGS = "/settings";
  static SETTINGS_OVERVIEW = "/settings";
  static SETTINGS_USERS = "/settings/users";

  // Org Admin
  static ORG_ADMIN_USERS = "/users";
  static ORG_ADMIN_FORECASTS = "/forecasts";
  static orgAdminForecastDetail = (id: string) =>
    `${Router.ORG_ADMIN_FORECASTS}/${id}`;
  static ORG_ADMIN_GROUPS = "/groups";
  static ORG_ADMIN_GROUP_DETAIL = (groupId: string) =>
    `${Router.ORG_ADMIN_GROUPS}/${groupId}`;
  static ORG_ADMIN_GROUP_EDIT = (groupId: string) =>
    `${Router.ORG_ADMIN_GROUPS}/${groupId}/edit`;

  // Org Admin Leaderboard
  static LEADERBOARD = "/leaderboard";
  static LEADERBOARD_USERS = "/leaderboard/users";
  static LEADERBOARD_PREDICTIONS = "/leaderboard/predictions";
  static LEADERBOARD_CATEGORIES = "/leaderboard/categories";
  static LEADERBOARD_GROUPS = "/leaderboard/groups";

  // Forecasts
  static FORECASTS = "/forecasts";
  static forecastDetailById = (id: string) => `${Router.FORECASTS}/${id}`;

  // User
  static USER_FORECASTS = "/f";
  static USER_FORECASTS_PENDING = "/"; // Upcoming forecasts (pending predictions)
  static USER_FORECASTS_SUBMITTED = "/submitted"; // Forecasts with predictions submitted
  static USER_FORECASTS_COMPLETED = "/completed"; // Past forecasts (completed)
  static USER_FORECASTS_ALL = "/all"; // All forecasts
  static USER_FORECASTS_PAST = Router.USER_FORECASTS_COMPLETED; // Legacy - redirect to completed
  static USER_FORECAST_DETAIL = (id: string) => `/f/${id}`;
  static FORECAST_LEADERBOARD = (id: string) => `/f/${id}/leaderboard`; // public leaderboard, super-admin leader, org-admin, player

  static SUMMARY = "/summary";
  static USER_GROUP = "/my-group";
}

export default Router;
