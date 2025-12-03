import prisma from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

/**
 * Leaderboard entry representing a user's aggregated prediction performance
 */
export interface LeaderboardEntry {
  userId: string;
  userName: string | null;
  userEmail: string;

  // Counts & accuracy
  totalCompletedPredictions: number;
  completedBinaryPredictions: number;
  completedContinuousPredictions: number;
  totalPredictions: number; // Legacy field - same as totalCompletedPredictions
  correctPredictions: number;
  incorrectPredictions: number;
  accuracyRate: number | null; // Binary: % correct
  incorrectRate: number | null; // Binary: % incorrect
  avgProbabilityBinary: number | null; // Binary: average confidence/probability
  highCountContinuous: number;
  lowCountContinuous: number;
  perfectCountContinuous: number;
  highPercentContinuous: number | null; // % HIGH
  lowPercentContinuous: number | null; // % LOW
  perfectPercentContinuous: number | null; // % PERFECT

  // Capital & profit roll-ups
  totalEquityInvestment: number | null;
  totalDebtFinancing: number | null;
  totalInvestment: number | null;
  totalNetProfit: number | null;
  fundBalance: number | null; // Starting fund + net profit
  profitFromEquity: number | null;
  profitFromFinancing: number | null;

  // Overall ROI (equity + debt)
  roiReal: number | null; // Net profit / Total investment
  roiAverage: number | null; // Average of per-question ROI %
  roiMedian: number | null; // Median of per-question ROI %
  avgRoiEquityPlusDebtPct: number | null; // Legacy - same as roiAverage

  // Equity returns (ROE)
  roeReal: number | null; // Profit from equity / Total equity invested
  roeAverage: number | null; // Average of per-question ROE %
  roeMedian: number | null; // Median of per-question ROE %
  totalRoe: number | null; // Legacy - same as profitFromEquity
  avgRoePct: number | null; // Legacy - same as roeAverage

  // Financing returns (ROF)
  interestPaymentOnDebt: number | null; // Sum of (-10% × Debt Financing)
  rofReal: number | null; // Profit from financing / Total debt financed
  rofAverage: number | null; // Average of per-question ROF %
  rofMedian: number | null; // Median of per-question ROF %
  totalRof: number | null; // Legacy - same as profitFromFinancing
  avgRofPct: number | null; // Legacy - same as rofAverage

  // Error metrics (continuous only)
  avgActualError: number | null; // Average of absolute actual error %
  medianActualError: number | null; // Median of absolute actual error %
  avgForecastError: number | null; // Average of absolute forecast error %
  medianForecastError: number | null; // Median of absolute forecast error %
  avgAbsoluteError: number | null; // Legacy
  avgAbsoluteActualErrorPct: number | null; // Legacy - same as avgActualError
  avgAbsoluteForecastErrorPct: number | null; // Legacy - same as avgForecastError

  // Time & productivity
  totalForecastTimeMinutes: number | null;
  avgTimePerForecastMinutes: number | null;
  weightedAvgHourlyProfit: number | null; // Net profit / (total time / 60)
  simpleAvgHourlyProfit: number | null; // Average of per-question profit per hour
  avgProfitPerHour: number | null; // Legacy - same as simpleAvgHourlyProfit

  // Legacy fields
  avgBrierScore: number | null;
  avgRoiScore: number | null;
}

/**
 * Raw database result type (before conversion)
 */
type RawLeaderboardEntry = Omit<
  LeaderboardEntry,
  | "accuracyRate"
  | "incorrectRate"
  | "avgProbabilityBinary"
  | "highPercentContinuous"
  | "lowPercentContinuous"
  | "perfectPercentContinuous"
  | "fundBalance"
  | "roiReal"
  | "roiAverage"
  | "roiMedian"
  | "avgRoiEquityPlusDebtPct"
  | "roeReal"
  | "roeAverage"
  | "roeMedian"
  | "avgRoePct"
  | "interestPaymentOnDebt"
  | "rofReal"
  | "rofAverage"
  | "rofMedian"
  | "avgRofPct"
  | "avgActualError"
  | "medianActualError"
  | "avgForecastError"
  | "medianForecastError"
  | "avgAbsoluteActualErrorPct"
  | "avgAbsoluteForecastErrorPct"
  | "weightedAvgHourlyProfit"
  | "simpleAvgHourlyProfit"
  | "avgProfitPerHour"
  | "avgBrierScore"
  | "avgRoiScore"
  | "totalRoe"
  | "totalRof"
  | "totalNetProfit"
  | "totalInvestment"
  | "totalEquityInvestment"
  | "totalDebtFinancing"
  | "profitFromEquity"
  | "profitFromFinancing"
  | "avgAbsoluteError"
  | "totalForecastTimeMinutes"
  | "avgTimePerForecastMinutes"
> & {
  accuracyRate: Decimal | null;
  incorrectRate: Decimal | null;
  avgProbabilityBinary: Decimal | null;
  highPercentContinuous: Decimal | null;
  lowPercentContinuous: Decimal | null;
  perfectPercentContinuous: Decimal | null;
  fundBalance: Decimal | null;
  roiReal: Decimal | null;
  roiAverage: Decimal | null;
  roiMedian: Decimal | null;
  avgRoiEquityPlusDebtPct: Decimal | null;
  roeReal: Decimal | null;
  roeAverage: Decimal | null;
  roeMedian: Decimal | null;
  avgRoePct: Decimal | null;
  interestPaymentOnDebt: Decimal | null;
  rofReal: Decimal | null;
  rofAverage: Decimal | null;
  rofMedian: Decimal | null;
  avgRofPct: Decimal | null;
  avgActualError: Decimal | null;
  medianActualError: Decimal | null;
  avgForecastError: Decimal | null;
  medianForecastError: Decimal | null;
  avgAbsoluteActualErrorPct: Decimal | null;
  avgAbsoluteForecastErrorPct: Decimal | null;
  weightedAvgHourlyProfit: Decimal | null;
  simpleAvgHourlyProfit: Decimal | null;
  avgProfitPerHour: Decimal | null;
  avgBrierScore: Decimal | null;
  avgRoiScore: Decimal | null;
  totalRoe: Decimal | null;
  totalRof: Decimal | null;
  totalNetProfit: Decimal | null;
  totalInvestment: Decimal | null;
  totalEquityInvestment: Decimal | null;
  totalDebtFinancing: Decimal | null;
  profitFromEquity: Decimal | null;
  profitFromFinancing: Decimal | null;
  avgAbsoluteError: Decimal | null;
  totalForecastTimeMinutes: Decimal | null;
  avgTimePerForecastMinutes: Decimal | null;
};

export type GroupLeaderboardEntry = Omit<
  LeaderboardEntry,
  "userId" | "userName" | "userEmail"
> & {
  groupId: string;
  groupName: string;
  memberCount: number;
};

type RawGroupLeaderboardEntry = Omit<
  RawLeaderboardEntry,
  "userId" | "userName" | "userEmail"
> & {
  groupId: string;
  groupName: string;
  memberCount: number;
};

/**
 * Convert Decimal objects to numbers for Client Component compatibility
 */
function convertDecimalsToNumbers(raw: RawLeaderboardEntry): LeaderboardEntry {
  return {
    ...raw,
    accuracyRate: raw.accuracyRate ? Number(raw.accuracyRate) : null,
    incorrectRate: raw.incorrectRate ? Number(raw.incorrectRate) : null,
    avgProbabilityBinary: raw.avgProbabilityBinary
      ? Number(raw.avgProbabilityBinary)
      : null,
    highPercentContinuous: raw.highPercentContinuous
      ? Number(raw.highPercentContinuous)
      : null,
    lowPercentContinuous: raw.lowPercentContinuous
      ? Number(raw.lowPercentContinuous)
      : null,
    perfectPercentContinuous: raw.perfectPercentContinuous
      ? Number(raw.perfectPercentContinuous)
      : null,
    fundBalance: raw.fundBalance ? Number(raw.fundBalance) : null,
    roiReal: raw.roiReal ? Number(raw.roiReal) : null,
    roiAverage: raw.roiAverage ? Number(raw.roiAverage) : null,
    roiMedian: raw.roiMedian ? Number(raw.roiMedian) : null,
    avgRoiEquityPlusDebtPct: raw.avgRoiEquityPlusDebtPct
      ? Number(raw.avgRoiEquityPlusDebtPct)
      : null,
    roeReal: raw.roeReal ? Number(raw.roeReal) : null,
    roeAverage: raw.roeAverage ? Number(raw.roeAverage) : null,
    roeMedian: raw.roeMedian ? Number(raw.roeMedian) : null,
    avgRoePct: raw.avgRoePct ? Number(raw.avgRoePct) : null,
    interestPaymentOnDebt: raw.interestPaymentOnDebt
      ? Number(raw.interestPaymentOnDebt)
      : null,
    rofReal: raw.rofReal ? Number(raw.rofReal) : null,
    rofAverage: raw.rofAverage ? Number(raw.rofAverage) : null,
    rofMedian: raw.rofMedian ? Number(raw.rofMedian) : null,
    avgRofPct: raw.avgRofPct ? Number(raw.avgRofPct) : null,
    avgActualError: raw.avgActualError ? Number(raw.avgActualError) : null,
    medianActualError: raw.medianActualError
      ? Number(raw.medianActualError)
      : null,
    avgForecastError: raw.avgForecastError
      ? Number(raw.avgForecastError)
      : null,
    medianForecastError: raw.medianForecastError
      ? Number(raw.medianForecastError)
      : null,
    avgAbsoluteActualErrorPct: raw.avgAbsoluteActualErrorPct
      ? Number(raw.avgAbsoluteActualErrorPct)
      : null,
    avgAbsoluteForecastErrorPct: raw.avgAbsoluteForecastErrorPct
      ? Number(raw.avgAbsoluteForecastErrorPct)
      : null,
    weightedAvgHourlyProfit: raw.weightedAvgHourlyProfit
      ? Number(raw.weightedAvgHourlyProfit)
      : null,
    simpleAvgHourlyProfit: raw.simpleAvgHourlyProfit
      ? Number(raw.simpleAvgHourlyProfit)
      : null,
    avgProfitPerHour: raw.avgProfitPerHour
      ? Number(raw.avgProfitPerHour)
      : null,
    avgBrierScore: raw.avgBrierScore ? Number(raw.avgBrierScore) : null,
    avgRoiScore: raw.avgRoiScore ? Number(raw.avgRoiScore) : null,
    totalRoe: raw.totalRoe ? Number(raw.totalRoe) : null,
    totalRof: raw.totalRof ? Number(raw.totalRof) : null,
    totalNetProfit: raw.totalNetProfit ? Number(raw.totalNetProfit) : null,
    totalInvestment: raw.totalInvestment ? Number(raw.totalInvestment) : null,
    totalEquityInvestment: raw.totalEquityInvestment
      ? Number(raw.totalEquityInvestment)
      : null,
    totalDebtFinancing: raw.totalDebtFinancing
      ? Number(raw.totalDebtFinancing)
      : null,
    profitFromEquity: raw.profitFromEquity
      ? Number(raw.profitFromEquity)
      : null,
    profitFromFinancing: raw.profitFromFinancing
      ? Number(raw.profitFromFinancing)
      : null,
    avgAbsoluteError: raw.avgAbsoluteError
      ? Number(raw.avgAbsoluteError)
      : null,
    totalForecastTimeMinutes: raw.totalForecastTimeMinutes
      ? Number(raw.totalForecastTimeMinutes)
      : null,
    avgTimePerForecastMinutes: raw.avgTimePerForecastMinutes
      ? Number(raw.avgTimePerForecastMinutes)
      : null,
  };
}

function convertGroupDecimalsToNumbers(
  raw: RawGroupLeaderboardEntry
): GroupLeaderboardEntry {
  const userLike = {
    ...(raw as Omit<RawLeaderboardEntry, "userId" | "userName" | "userEmail">),
    userId: raw.groupId,
    userName: raw.groupName,
    userEmail: "",
  } as RawLeaderboardEntry;

  const converted = convertDecimalsToNumbers(userLike);
  const { userId, userName, userEmail, ...rest } = converted;

  return {
    groupId: raw.groupId,
    groupName: raw.groupName,
    memberCount: Number(raw.memberCount),
    ...rest,
  };
}

/**
 * Get aggregated leaderboard data for an organization
 * Only includes predictions for forecasts that have actual values set
 * Excludes ORG_ADMIN and SUPER_ADMIN users from leaderboard
 */
export async function getOrganizationLeaderboard(
  organizationId: string
): Promise<LeaderboardEntry[]> {
  // Use raw SQL for optimized aggregation
  const result = await prisma.$queryRaw<RawLeaderboardEntry[]>`
    WITH user_predictions AS (
      SELECT 
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        f.type as forecast_type,
        p."isCorrect",
        p."highLow",
        p.confidence,
        p."equityInvestment",
        p."debtFinancing",
        p."totalInvestment",
        p.roe,
        p."roePct",
        p.rof,
        p."rofPct",
        p."debtRepayment",
        p."netProfitEquityPlusDebt",
        p."roiEquityPlusDebtPct",
        p."profitPerHour",
        p."estimatedTime",
        p."absoluteActualErrorPct",
        p."absoluteForecastErrorPct",
        p."absoluteError",
        p."brierScore",
        p."roiScore"
      FROM "User" u
      INNER JOIN "Prediction" p ON p."userId" = u.id
      INNER JOIN "Forecast" f ON f.id = p."forecastId"
      WHERE 
        u."organizationId" = ${organizationId}
        AND f."actualValue" IS NOT NULL
        AND u.role = 'USER'
    ),
    percentile_agg AS (
      SELECT
        user_id,
        percentile_cont(0.5) WITHIN GROUP (ORDER BY "roiEquityPlusDebtPct") as roi_median,
        percentile_cont(0.5) WITHIN GROUP (ORDER BY "roePct") as roe_median,
        percentile_cont(0.5) WITHIN GROUP (ORDER BY "rofPct") as rof_median,
        percentile_cont(0.5) WITHIN GROUP (ORDER BY "absoluteActualErrorPct") as actual_error_median,
        percentile_cont(0.5) WITHIN GROUP (ORDER BY "absoluteForecastErrorPct") as forecast_error_median
      FROM user_predictions
      WHERE "roiEquityPlusDebtPct" IS NOT NULL 
         OR "roePct" IS NOT NULL 
         OR "rofPct" IS NOT NULL
         OR "absoluteActualErrorPct" IS NOT NULL
         OR "absoluteForecastErrorPct" IS NOT NULL
      GROUP BY user_id
    )
    SELECT 
      up.user_id as "userId",
      up.user_name as "userName",
      up.user_email as "userEmail",
      
      -- Counts & accuracy
      COUNT(*)::int as "totalCompletedPredictions",
      COUNT(*)::int as "totalPredictions",
      COUNT(CASE WHEN forecast_type = 'BINARY' AND confidence IS NOT NULL THEN 1 END)::int as "completedBinaryPredictions",
      COUNT(CASE WHEN forecast_type = 'CONTINUOUS' THEN 1 END)::int as "completedContinuousPredictions",
      COUNT(CASE WHEN "isCorrect" = true THEN 1 END)::int as "correctPredictions",
      COUNT(CASE WHEN "isCorrect" = false THEN 1 END)::int as "incorrectPredictions",
      CASE 
        WHEN COUNT(CASE WHEN forecast_type = 'BINARY' THEN 1 END) > 0 THEN 
          (COUNT(CASE WHEN "isCorrect" = true THEN 1 END)::numeric / 
           COUNT(CASE WHEN forecast_type = 'BINARY' THEN 1 END)::numeric)
        ELSE NULL 
      END as "accuracyRate",
      CASE 
        WHEN COUNT(CASE WHEN forecast_type = 'BINARY' THEN 1 END) > 0 THEN 
          (COUNT(CASE WHEN "isCorrect" = false THEN 1 END)::numeric / 
           COUNT(CASE WHEN forecast_type = 'BINARY' THEN 1 END)::numeric)
        ELSE NULL 
      END as "incorrectRate",
      AVG(CASE WHEN forecast_type = 'BINARY' AND confidence IS NOT NULL THEN confidence::numeric / 100 END) as "avgProbabilityBinary",
      COUNT(CASE WHEN "highLow" = 'HIGH' THEN 1 END)::int as "highCountContinuous",
      COUNT(CASE WHEN "highLow" = 'LOW' THEN 1 END)::int as "lowCountContinuous",
      COUNT(CASE WHEN "highLow" = 'PERFECT' THEN 1 END)::int as "perfectCountContinuous",
      CASE 
        WHEN COUNT(CASE WHEN forecast_type = 'CONTINUOUS' THEN 1 END) > 0 THEN 
          (COUNT(CASE WHEN "highLow" = 'HIGH' THEN 1 END)::numeric / 
           COUNT(CASE WHEN forecast_type = 'CONTINUOUS' THEN 1 END)::numeric)
        ELSE NULL 
      END as "highPercentContinuous",
      CASE 
        WHEN COUNT(CASE WHEN forecast_type = 'CONTINUOUS' THEN 1 END) > 0 THEN 
          (COUNT(CASE WHEN "highLow" = 'LOW' THEN 1 END)::numeric / 
           COUNT(CASE WHEN forecast_type = 'CONTINUOUS' THEN 1 END)::numeric)
        ELSE NULL 
      END as "lowPercentContinuous",
      CASE 
        WHEN COUNT(CASE WHEN forecast_type = 'CONTINUOUS' THEN 1 END) > 0 THEN 
          (COUNT(CASE WHEN "highLow" = 'PERFECT' THEN 1 END)::numeric / 
           COUNT(CASE WHEN forecast_type = 'CONTINUOUS' THEN 1 END)::numeric)
        ELSE NULL 
      END as "perfectPercentContinuous",
      
      -- Capital & profit roll-ups
      SUM("equityInvestment") as "totalEquityInvestment",
      SUM("debtFinancing") as "totalDebtFinancing",
      SUM("totalInvestment") as "totalInvestment",
      SUM("netProfitEquityPlusDebt") as "totalNetProfit",
      (1000000000 + SUM("netProfitEquityPlusDebt")) as "fundBalance",
      SUM(roe) as "profitFromEquity",
      SUM(rof) as "profitFromFinancing",
      
      -- Overall ROI (equity + debt)
      CASE 
        WHEN SUM("totalInvestment") > 0 THEN 
          SUM("netProfitEquityPlusDebt") / SUM("totalInvestment")
        ELSE NULL 
      END as "roiReal",
      AVG("roiEquityPlusDebtPct") as "roiAverage",
      pa.roi_median as "roiMedian",
      AVG("roiEquityPlusDebtPct") as "avgRoiEquityPlusDebtPct",
      
      -- Equity returns (ROE)
      CASE 
        WHEN SUM("equityInvestment") > 0 THEN 
          SUM(roe) / SUM("equityInvestment")
        ELSE NULL 
      END as "roeReal",
      AVG("roePct") as "roeAverage",
      pa.roe_median as "roeMedian",
      SUM(roe) as "totalRoe",
      AVG("roePct") as "avgRoePct",
      
      -- Financing returns (ROF)
      SUM("debtRepayment") as "interestPaymentOnDebt",
      CASE 
        WHEN SUM("debtFinancing") > 0 THEN 
          SUM(rof) / SUM("debtFinancing")
        ELSE NULL 
      END as "rofReal",
      AVG("rofPct") as "rofAverage",
      pa.rof_median as "rofMedian",
      SUM(rof) as "totalRof",
      AVG("rofPct") as "avgRofPct",
      
      -- Error metrics (continuous only)
      AVG("absoluteActualErrorPct") as "avgActualError",
      pa.actual_error_median as "medianActualError",
      AVG("absoluteForecastErrorPct") as "avgForecastError",
      pa.forecast_error_median as "medianForecastError",
      AVG("absoluteError") as "avgAbsoluteError",
      AVG("absoluteActualErrorPct") as "avgAbsoluteActualErrorPct",
      AVG("absoluteForecastErrorPct") as "avgAbsoluteForecastErrorPct",
      
      -- Time & productivity
      SUM("estimatedTime") as "totalForecastTimeMinutes",
      AVG("estimatedTime") as "avgTimePerForecastMinutes",
      CASE 
        WHEN SUM("estimatedTime") > 0 THEN 
          SUM("netProfitEquityPlusDebt") / (SUM("estimatedTime") / 60.0)
        ELSE NULL 
      END as "weightedAvgHourlyProfit",
      AVG("profitPerHour") as "simpleAvgHourlyProfit",
      AVG("profitPerHour") as "avgProfitPerHour",
      
      -- Legacy fields
      AVG("brierScore") as "avgBrierScore",
      AVG("roiScore") as "avgRoiScore"
      
    FROM user_predictions up
    LEFT JOIN percentile_agg pa ON pa.user_id = up.user_id
    GROUP BY up.user_id, up.user_name, up.user_email, pa.roi_median, pa.roe_median, pa.rof_median, pa.actual_error_median, pa.forecast_error_median
    ORDER BY "accuracyRate" DESC NULLS LAST, "totalPredictions" DESC
  `;

  return result.map(convertDecimalsToNumbers);
}

/**
 * Get aggregated leaderboard data by group for an organization.
 */
export async function getGroupLeaderboard(organizationId: string) {
  return getGroupLeaderboardWithSort({
    organizationId,
  });
}

/**
 * Get detailed leaderboard with sortable columns and filters
 * This version allows custom sorting and filtering by forecast/category
 */
export async function getOrganizationLeaderboardWithSort({
  organizationId,
  sortBy = "accuracyRate",
  sortOrder = "desc",
  forecastIds,
  categoryIds,
  forecastTypes,
  recentCount,
  minForecasts,
  dateFrom,
  dateTo,
}: {
  organizationId: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  forecastIds?: string; // Comma-separated IDs
  categoryIds?: string; // Comma-separated IDs
  forecastTypes?: string; // Comma-separated types
  recentCount?: number;
  minForecasts?: number;
  dateFrom?: string;
  dateTo?: string;
}): Promise<LeaderboardEntry[]> {
  // Map frontend column names to SQL column aliases (what we SELECT AS)
  const validSortColumns = [
    "userName",
    "userEmail",
    "totalCompletedPredictions",
    "completedBinaryPredictions",
    "completedContinuousPredictions",
    "totalPredictions",
    "correctPredictions",
    "incorrectPredictions",
    "accuracyRate",
    "incorrectRate",
    "avgProbabilityBinary",
    "highPercentContinuous",
    "lowPercentContinuous",
    "perfectPercentContinuous",
    "totalEquityInvestment",
    "totalDebtFinancing",
    "totalInvestment",
    "totalNetProfit",
    "fundBalance",
    "profitFromEquity",
    "profitFromFinancing",
    "roiReal",
    "roiAverage",
    "roiMedian",
    "avgRoiEquityPlusDebtPct",
    "roeReal",
    "roeAverage",
    "roeMedian",
    "totalRoe",
    "avgRoePct",
    "interestPaymentOnDebt",
    "rofReal",
    "rofAverage",
    "rofMedian",
    "totalRof",
    "avgRofPct",
    "avgActualError",
    "medianActualError",
    "avgForecastError",
    "medianForecastError",
    "avgAbsoluteError",
    "avgAbsoluteActualErrorPct",
    "avgAbsoluteForecastErrorPct",
    "totalForecastTimeMinutes",
    "avgTimePerForecastMinutes",
    "weightedAvgHourlyProfit",
    "simpleAvgHourlyProfit",
    "avgProfitPerHour",
    "avgBrierScore",
    "avgRoiScore",
  ];

  // Validate and sanitize sort column
  const sortColumn = validSortColumns.includes(sortBy)
    ? sortBy
    : "accuracyRate";
  const direction = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";
  const nullsPosition = direction === "DESC" ? "NULLS LAST" : "NULLS FIRST";

  // Build WHERE clause conditions
  const conditions = [
    'u."organizationId" = $1',
    'f."actualValue" IS NOT NULL',
    "u.role = 'USER'",
  ];
  const params: (string | number)[] = [organizationId];

  // Filter by forecast IDs
  if (forecastIds) {
    const ids = forecastIds.split(",").filter(Boolean);
    if (ids.length > 0) {
      const placeholders = ids
        .map((_, i) => `$${params.length + i + 1}`)
        .join(", ");
      conditions.push(`f.id IN (${placeholders})`);
      params.push(...ids);
    }
  }

  // Filter by category IDs
  if (categoryIds) {
    const ids = categoryIds.split(",").filter(Boolean);
    if (ids.length > 0) {
      const placeholders = ids
        .map((_, i) => `$${params.length + i + 1}`)
        .join(", ");
      conditions.push(`f."categoryId" IN (${placeholders})`);
      params.push(...ids);
    }
  }

  // Filter by forecast types
  if (forecastTypes) {
    const types = forecastTypes.split(",").filter(Boolean);
    if (types.length > 0) {
      const placeholders = types
        .map((_, i) => `$${params.length + i + 1}::"ForecastType"`)
        .join(", ");
      conditions.push(`f.type IN (${placeholders})`);
      params.push(...types);
    }
  }

  // Filter by date range (dataReleaseDate)
  if (dateFrom) {
    conditions.push(`f."dataReleaseDate" >= $${params.length + 1}::timestamp`);
    params.push(dateFrom);
  }
  if (dateTo) {
    conditions.push(`f."dataReleaseDate" <= $${params.length + 1}::timestamp`);
    params.push(dateTo);
  }

  // Build subquery for recent forecasts filter
  let forecastSubquery = "";
  if (recentCount) {
    forecastSubquery = `
      AND f.id IN (
        SELECT id FROM "Forecast"
        WHERE "organizationId" = $1
        AND "actualValue" IS NOT NULL
        ORDER BY "dataReleaseDate" DESC NULLS LAST
        LIMIT ${recentCount}
      )
    `;
  }

  const whereClause = conditions.join(" AND ") + forecastSubquery;

  // Build HAVING clause for minimum forecasts filter
  let havingClause = "";
  if (minForecasts) {
    havingClause = `HAVING COUNT(*) >= ${minForecasts}`;
  }

  // Use $queryRawUnsafe for dynamic ORDER BY
  const query = `
    WITH user_predictions AS (
      SELECT 
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        f.type as forecast_type,
        p."isCorrect",
        p."highLow",
        p.confidence,
        p."equityInvestment",
        p."debtFinancing",
        p."totalInvestment",
        p.roe,
        p."roePct",
        p.rof,
        p."rofPct",
        p."debtRepayment",
        p."netProfitEquityPlusDebt",
        p."roiEquityPlusDebtPct",
        p."profitPerHour",
        p."estimatedTime",
        p."absoluteActualErrorPct",
        p."absoluteForecastErrorPct",
        p."absoluteError",
        p."brierScore",
        p."roiScore"
      FROM "User" u
      INNER JOIN "Prediction" p ON p."userId" = u.id
      INNER JOIN "Forecast" f ON f.id = p."forecastId"
      WHERE ${whereClause}
    ),
    percentile_agg AS (
      SELECT
        user_id,
        percentile_cont(0.5) WITHIN GROUP (ORDER BY "roiEquityPlusDebtPct") as roi_median,
        percentile_cont(0.5) WITHIN GROUP (ORDER BY "roePct") as roe_median,
        percentile_cont(0.5) WITHIN GROUP (ORDER BY "rofPct") as rof_median,
        percentile_cont(0.5) WITHIN GROUP (ORDER BY "absoluteActualErrorPct") as actual_error_median,
        percentile_cont(0.5) WITHIN GROUP (ORDER BY "absoluteForecastErrorPct") as forecast_error_median
      FROM user_predictions
      WHERE "roiEquityPlusDebtPct" IS NOT NULL 
         OR "roePct" IS NOT NULL 
         OR "rofPct" IS NOT NULL
         OR "absoluteActualErrorPct" IS NOT NULL
         OR "absoluteForecastErrorPct" IS NOT NULL
      GROUP BY user_id
    )
    SELECT 
      up.user_id as "userId",
      up.user_name as "userName",
      up.user_email as "userEmail",
      COUNT(*)::int as "totalCompletedPredictions",
      COUNT(*)::int as "totalPredictions",
      COUNT(CASE WHEN forecast_type = 'BINARY' AND confidence IS NOT NULL THEN 1 END)::int as "completedBinaryPredictions",
      COUNT(CASE WHEN forecast_type = 'CONTINUOUS' THEN 1 END)::int as "completedContinuousPredictions",
      COUNT(CASE WHEN "isCorrect" = true THEN 1 END)::int as "correctPredictions",
      COUNT(CASE WHEN "isCorrect" = false THEN 1 END)::int as "incorrectPredictions",
      CASE 
        WHEN COUNT(CASE WHEN forecast_type = 'BINARY' THEN 1 END) > 0 THEN 
          (COUNT(CASE WHEN "isCorrect" = true THEN 1 END)::numeric / COUNT(CASE WHEN forecast_type = 'BINARY' THEN 1 END)::numeric)
        ELSE NULL 
      END as "accuracyRate",
      CASE 
        WHEN COUNT(CASE WHEN forecast_type = 'BINARY' THEN 1 END) > 0 THEN 
          (COUNT(CASE WHEN "isCorrect" = false THEN 1 END)::numeric / COUNT(CASE WHEN forecast_type = 'BINARY' THEN 1 END)::numeric)
        ELSE NULL 
      END as "incorrectRate",
      AVG(CASE WHEN forecast_type = 'BINARY' AND confidence IS NOT NULL THEN confidence::numeric / 100 END) as "avgProbabilityBinary",
      COUNT(CASE WHEN "highLow" = 'HIGH' THEN 1 END)::int as "highCountContinuous",
      COUNT(CASE WHEN "highLow" = 'LOW' THEN 1 END)::int as "lowCountContinuous",
      COUNT(CASE WHEN "highLow" = 'PERFECT' THEN 1 END)::int as "perfectCountContinuous",
      CASE 
        WHEN COUNT(CASE WHEN forecast_type = 'CONTINUOUS' THEN 1 END) > 0 THEN 
          (COUNT(CASE WHEN "highLow" = 'HIGH' THEN 1 END)::numeric / COUNT(CASE WHEN forecast_type = 'CONTINUOUS' THEN 1 END)::numeric)
        ELSE NULL 
      END as "highPercentContinuous",
      CASE 
        WHEN COUNT(CASE WHEN forecast_type = 'CONTINUOUS' THEN 1 END) > 0 THEN 
          (COUNT(CASE WHEN "highLow" = 'LOW' THEN 1 END)::numeric / COUNT(CASE WHEN forecast_type = 'CONTINUOUS' THEN 1 END)::numeric)
        ELSE NULL 
      END as "lowPercentContinuous",
      CASE 
        WHEN COUNT(CASE WHEN forecast_type = 'CONTINUOUS' THEN 1 END) > 0 THEN 
          (COUNT(CASE WHEN "highLow" = 'PERFECT' THEN 1 END)::numeric / COUNT(CASE WHEN forecast_type = 'CONTINUOUS' THEN 1 END)::numeric)
        ELSE NULL 
      END as "perfectPercentContinuous",
      SUM("equityInvestment") as "totalEquityInvestment",
      SUM("debtFinancing") as "totalDebtFinancing",
      SUM("totalInvestment") as "totalInvestment",
      SUM("netProfitEquityPlusDebt") as "totalNetProfit",
      (1000000000 + SUM("netProfitEquityPlusDebt")) as "fundBalance",
      SUM(roe) as "profitFromEquity",
      SUM(rof) as "profitFromFinancing",
      CASE WHEN SUM("totalInvestment") > 0 THEN SUM("netProfitEquityPlusDebt") / SUM("totalInvestment") ELSE NULL END as "roiReal",
      AVG("roiEquityPlusDebtPct") as "roiAverage",
      pa.roi_median as "roiMedian",
      AVG("roiEquityPlusDebtPct") as "avgRoiEquityPlusDebtPct",
      CASE WHEN SUM("equityInvestment") > 0 THEN SUM(roe) / SUM("equityInvestment") ELSE NULL END as "roeReal",
      AVG("roePct") as "roeAverage",
      pa.roe_median as "roeMedian",
      SUM(roe) as "totalRoe",
      AVG("roePct") as "avgRoePct",
      SUM("debtRepayment") as "interestPaymentOnDebt",
      CASE WHEN SUM("debtFinancing") > 0 THEN SUM(rof) / SUM("debtFinancing") ELSE NULL END as "rofReal",
      AVG("rofPct") as "rofAverage",
      pa.rof_median as "rofMedian",
      SUM(rof) as "totalRof",
      AVG("rofPct") as "avgRofPct",
      AVG("absoluteActualErrorPct") as "avgActualError",
      pa.actual_error_median as "medianActualError",
      AVG("absoluteForecastErrorPct") as "avgForecastError",
      pa.forecast_error_median as "medianForecastError",
      AVG("absoluteError") as "avgAbsoluteError",
      AVG("absoluteActualErrorPct") as "avgAbsoluteActualErrorPct",
      AVG("absoluteForecastErrorPct") as "avgAbsoluteForecastErrorPct",
      SUM("estimatedTime") as "totalForecastTimeMinutes",
      AVG("estimatedTime") as "avgTimePerForecastMinutes",
      CASE WHEN SUM("estimatedTime") > 0 THEN SUM("netProfitEquityPlusDebt") / (SUM("estimatedTime") / 60.0) ELSE NULL END as "weightedAvgHourlyProfit",
      AVG("profitPerHour") as "simpleAvgHourlyProfit",
      AVG("profitPerHour") as "avgProfitPerHour",
      AVG("brierScore") as "avgBrierScore",
      AVG("roiScore") as "avgRoiScore"
    FROM user_predictions up
    LEFT JOIN percentile_agg pa ON pa.user_id = up.user_id
    GROUP BY up.user_id, up.user_name, up.user_email, pa.roi_median, pa.roe_median, pa.rof_median, pa.actual_error_median, pa.forecast_error_median
    ${havingClause}
    ORDER BY "${sortColumn}" ${direction} ${nullsPosition}
  `;

  const result = await prisma.$queryRawUnsafe<RawLeaderboardEntry[]>(
    query,
    ...params
  );

  return result.map(convertDecimalsToNumbers);
}

/**
 * Group-level leaderboard with filters and sorting.
 */
export async function getGroupLeaderboardWithSort({
  organizationId,
  sortBy = "accuracyRate",
  sortOrder = "desc",
  forecastIds,
  categoryIds,
  forecastTypes,
  recentCount,
  minForecasts,
  dateFrom,
  dateTo,
}: {
  organizationId: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  forecastIds?: string;
  categoryIds?: string;
  forecastTypes?: string;
  recentCount?: number;
  minForecasts?: number;
  dateFrom?: string;
  dateTo?: string;
}): Promise<GroupLeaderboardEntry[]> {
  const validSortColumns = [
    "groupName",
    "memberCount",
    "totalCompletedPredictions",
    "completedBinaryPredictions",
    "completedContinuousPredictions",
    "totalPredictions",
    "correctPredictions",
    "incorrectPredictions",
    "accuracyRate",
    "incorrectRate",
    "avgProbabilityBinary",
    "highPercentContinuous",
    "lowPercentContinuous",
    "perfectPercentContinuous",
    "totalEquityInvestment",
    "totalDebtFinancing",
    "totalInvestment",
    "totalNetProfit",
    "fundBalance",
    "profitFromEquity",
    "profitFromFinancing",
    "roiReal",
    "roiAverage",
    "roiMedian",
    "avgRoiEquityPlusDebtPct",
    "roeReal",
    "roeAverage",
    "roeMedian",
    "totalRoe",
    "avgRoePct",
    "interestPaymentOnDebt",
    "rofReal",
    "rofAverage",
    "rofMedian",
    "totalRof",
    "avgRofPct",
    "avgActualError",
    "medianActualError",
    "avgForecastError",
    "medianForecastError",
    "avgAbsoluteError",
    "avgAbsoluteActualErrorPct",
    "avgAbsoluteForecastErrorPct",
    "totalForecastTimeMinutes",
    "avgTimePerForecastMinutes",
    "weightedAvgHourlyProfit",
    "simpleAvgHourlyProfit",
    "avgProfitPerHour",
    "avgBrierScore",
    "avgRoiScore",
  ];

  const sortColumn = validSortColumns.includes(sortBy)
    ? sortBy
    : "accuracyRate";
  const direction = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";
  const nullsPosition = direction === "DESC" ? "NULLS LAST" : "NULLS FIRST";

  const conditions = [
    'g."organizationId" = $1',
    'f."actualValue" IS NOT NULL',
    'p."groupId" IS NOT NULL',
  ];
  const params: (string | number)[] = [organizationId];

  if (forecastIds) {
    const ids = forecastIds.split(",").filter(Boolean);
    if (ids.length > 0) {
      const placeholders = ids
        .map((_, i) => `$${params.length + i + 1}`)
        .join(", ");
      conditions.push(`f.id IN (${placeholders})`);
      params.push(...ids);
    }
  }

  if (categoryIds) {
    const ids = categoryIds.split(",").filter(Boolean);
    if (ids.length > 0) {
      const placeholders = ids
        .map((_, i) => `$${params.length + i + 1}`)
        .join(", ");
      conditions.push(`f."categoryId" IN (${placeholders})`);
      params.push(...ids);
    }
  }

  if (forecastTypes) {
    const types = forecastTypes.split(",").filter(Boolean);
    if (types.length > 0) {
      const placeholders = types
        .map((_, i) => `$${params.length + i + 1}::"ForecastType"`)
        .join(", ");
      conditions.push(`f.type IN (${placeholders})`);
      params.push(...types);
    }
  }

  if (dateFrom) {
    conditions.push(`f."dataReleaseDate" >= $${params.length + 1}::timestamp`);
    params.push(dateFrom);
  }

  if (dateTo) {
    conditions.push(`f."dataReleaseDate" <= $${params.length + 1}::timestamp`);
    params.push(dateTo);
  }

  let forecastSubquery = "";
  if (recentCount) {
    forecastSubquery = `
      AND f.id IN (
        SELECT id FROM "Forecast"
        WHERE "organizationId" = $1
        AND "actualValue" IS NOT NULL
        ORDER BY "dataReleaseDate" DESC NULLS LAST
        LIMIT ${recentCount}
      )
    `;
  }

  const whereClause = conditions.join(" AND ") + forecastSubquery;

  let havingClause = "";
  if (minForecasts) {
    havingClause = `HAVING COUNT(p.id) >= ${minForecasts}`;
  }

  const query = `
    WITH group_member_counts AS (
      SELECT "groupId" as group_id, COUNT(*)::int as member_count
      FROM "GroupMember"
      GROUP BY "groupId"
    ),
    group_predictions AS (
      SELECT 
        g.id as group_id,
        g.name as group_name,
        COALESCE(gmc.member_count, 0) as member_count,
        f.type as forecast_type,
        p."isCorrect",
        p."highLow",
        p.confidence,
        p."equityInvestment",
        p."debtFinancing",
        p."totalInvestment",
        p.roe,
        p."roePct",
        p.rof,
        p."rofPct",
        p."debtRepayment",
        p."netProfitEquityPlusDebt",
        p."roiEquityPlusDebtPct",
        p."profitPerHour",
        p."estimatedTime",
        p."absoluteActualErrorPct",
        p."absoluteForecastErrorPct",
        p."absoluteError",
        p."brierScore",
        p."roiScore"
      FROM "Group" g
      INNER JOIN "Prediction" p ON p."groupId" = g.id
      INNER JOIN "Forecast" f ON f.id = p."forecastId"
      LEFT JOIN group_member_counts gmc ON gmc.group_id = g.id
      WHERE ${whereClause}
    ),
    percentile_agg AS (
      SELECT
        group_id,
        percentile_cont(0.5) WITHIN GROUP (ORDER BY "roiEquityPlusDebtPct") as roi_median,
        percentile_cont(0.5) WITHIN GROUP (ORDER BY "roePct") as roe_median,
        percentile_cont(0.5) WITHIN GROUP (ORDER BY "rofPct") as rof_median,
        percentile_cont(0.5) WITHIN GROUP (ORDER BY "absoluteActualErrorPct") as actual_error_median,
        percentile_cont(0.5) WITHIN GROUP (ORDER BY "absoluteForecastErrorPct") as forecast_error_median
      FROM group_predictions
      WHERE "roiEquityPlusDebtPct" IS NOT NULL 
         OR "roePct" IS NOT NULL 
         OR "rofPct" IS NOT NULL
         OR "absoluteActualErrorPct" IS NOT NULL
         OR "absoluteForecastErrorPct" IS NOT NULL
      GROUP BY group_id
    )
    SELECT 
      gp.group_id as "groupId",
      gp.group_name as "groupName",
      MAX(gp.member_count)::int as "memberCount",
      COUNT(*)::int as "totalCompletedPredictions",
      COUNT(*)::int as "totalPredictions",
      COUNT(CASE WHEN forecast_type = 'BINARY' AND confidence IS NOT NULL THEN 1 END)::int as "completedBinaryPredictions",
      COUNT(CASE WHEN forecast_type = 'CONTINUOUS' THEN 1 END)::int as "completedContinuousPredictions",
      COUNT(CASE WHEN "isCorrect" = true THEN 1 END)::int as "correctPredictions",
      COUNT(CASE WHEN "isCorrect" = false THEN 1 END)::int as "incorrectPredictions",
      CASE 
        WHEN COUNT(CASE WHEN forecast_type = 'BINARY' THEN 1 END) > 0 THEN 
          (COUNT(CASE WHEN "isCorrect" = true THEN 1 END)::numeric / COUNT(CASE WHEN forecast_type = 'BINARY' THEN 1 END)::numeric)
        ELSE NULL 
      END as "accuracyRate",
      CASE 
        WHEN COUNT(CASE WHEN forecast_type = 'BINARY' THEN 1 END) > 0 THEN 
          (COUNT(CASE WHEN "isCorrect" = false THEN 1 END)::numeric / COUNT(CASE WHEN forecast_type = 'BINARY' THEN 1 END)::numeric)
        ELSE NULL 
      END as "incorrectRate",
      AVG(CASE WHEN forecast_type = 'BINARY' AND confidence IS NOT NULL THEN confidence::numeric / 100 END) as "avgProbabilityBinary",
      COUNT(CASE WHEN "highLow" = 'HIGH' THEN 1 END)::int as "highCountContinuous",
      COUNT(CASE WHEN "highLow" = 'LOW' THEN 1 END)::int as "lowCountContinuous",
      COUNT(CASE WHEN "highLow" = 'PERFECT' THEN 1 END)::int as "perfectCountContinuous",
      CASE 
        WHEN COUNT(CASE WHEN forecast_type = 'CONTINUOUS' THEN 1 END) > 0 THEN 
          (COUNT(CASE WHEN "highLow" = 'HIGH' THEN 1 END)::numeric / COUNT(CASE WHEN forecast_type = 'CONTINUOUS' THEN 1 END)::numeric)
        ELSE NULL 
      END as "highPercentContinuous",
      CASE 
        WHEN COUNT(CASE WHEN forecast_type = 'CONTINUOUS' THEN 1 END) > 0 THEN 
          (COUNT(CASE WHEN "highLow" = 'LOW' THEN 1 END)::numeric / COUNT(CASE WHEN forecast_type = 'CONTINUOUS' THEN 1 END)::numeric)
        ELSE NULL 
      END as "lowPercentContinuous",
      CASE 
        WHEN COUNT(CASE WHEN forecast_type = 'CONTINUOUS' THEN 1 END) > 0 THEN 
          (COUNT(CASE WHEN "highLow" = 'PERFECT' THEN 1 END)::numeric / COUNT(CASE WHEN forecast_type = 'CONTINUOUS' THEN 1 END)::numeric)
        ELSE NULL 
      END as "perfectPercentContinuous",
      SUM("equityInvestment") as "totalEquityInvestment",
      SUM("debtFinancing") as "totalDebtFinancing",
      SUM("totalInvestment") as "totalInvestment",
      SUM("netProfitEquityPlusDebt") as "totalNetProfit",
      (1000000000 + SUM("netProfitEquityPlusDebt")) as "fundBalance",
      SUM(roe) as "profitFromEquity",
      SUM(rof) as "profitFromFinancing",
      CASE WHEN SUM("totalInvestment") > 0 THEN SUM("netProfitEquityPlusDebt") / SUM("totalInvestment") ELSE NULL END as "roiReal",
      AVG("roiEquityPlusDebtPct") as "roiAverage",
      pa.roi_median as "roiMedian",
      AVG("roiEquityPlusDebtPct") as "avgRoiEquityPlusDebtPct",
      CASE WHEN SUM("equityInvestment") > 0 THEN SUM(roe) / SUM("equityInvestment") ELSE NULL END as "roeReal",
      AVG("roePct") as "roeAverage",
      pa.roe_median as "roeMedian",
      SUM(roe) as "totalRoe",
      AVG("roePct") as "avgRoePct",
      SUM("debtRepayment") as "interestPaymentOnDebt",
      CASE WHEN SUM("debtFinancing") > 0 THEN SUM(rof) / SUM("debtFinancing") ELSE NULL END as "rofReal",
      AVG("rofPct") as "rofAverage",
      pa.rof_median as "rofMedian",
      SUM(rof) as "totalRof",
      AVG("rofPct") as "avgRofPct",
      AVG("absoluteActualErrorPct") as "avgActualError",
      pa.actual_error_median as "medianActualError",
      AVG("absoluteForecastErrorPct") as "avgForecastError",
      pa.forecast_error_median as "medianForecastError",
      AVG("absoluteError") as "avgAbsoluteError",
      AVG("absoluteActualErrorPct") as "avgAbsoluteActualErrorPct",
      AVG("absoluteForecastErrorPct") as "avgAbsoluteForecastErrorPct",
      SUM("estimatedTime") as "totalForecastTimeMinutes",
      AVG("estimatedTime") as "avgTimePerForecastMinutes",
      CASE WHEN SUM("estimatedTime") > 0 THEN SUM("netProfitEquityPlusDebt") / (SUM("estimatedTime") / 60.0) ELSE NULL END as "weightedAvgHourlyProfit",
      AVG("profitPerHour") as "simpleAvgHourlyProfit",
      AVG("profitPerHour") as "avgProfitPerHour",
      AVG("brierScore") as "avgBrierScore",
      AVG("roiScore") as "avgRoiScore"
    FROM group_predictions gp
    LEFT JOIN percentile_agg pa ON pa.group_id = gp.group_id
    GROUP BY gp.group_id, gp.group_name, pa.roi_median, pa.roe_median, pa.rof_median, pa.actual_error_median, pa.forecast_error_median
    ${havingClause}
    ORDER BY "${sortColumn}" ${direction} ${nullsPosition}
  `;

  const result = await prisma.$queryRawUnsafe<RawGroupLeaderboardEntry[]>(
    query,
    ...params
  );

  return result.map(convertGroupDecimalsToNumbers);
}

/**
 * Get leaderboard entry for a specific user
 */
export async function getUserLeaderboardEntry(
  userId: string,
  organizationId: string
): Promise<LeaderboardEntry | null> {
  const result = await prisma.$queryRaw<RawLeaderboardEntry[]>`
    WITH user_predictions AS (
      SELECT 
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        f.type as forecast_type,
        p."isCorrect",
        p."highLow",
        p.confidence,
        p."equityInvestment",
        p."debtFinancing",
        p."totalInvestment",
        p.roe,
        p."roePct",
        p.rof,
        p."rofPct",
        p."debtRepayment",
        p."netProfitEquityPlusDebt",
        p."roiEquityPlusDebtPct",
        p."profitPerHour",
        p."estimatedTime",
        p."absoluteActualErrorPct",
        p."absoluteForecastErrorPct",
        p."absoluteError",
        p."brierScore",
        p."roiScore"
      FROM "User" u
      INNER JOIN "Prediction" p ON p."userId" = u.id
      INNER JOIN "Forecast" f ON f.id = p."forecastId"
      WHERE 
        u.id = ${userId}
        AND u."organizationId" = ${organizationId}
        AND f."actualValue" IS NOT NULL
    ),
    percentile_agg AS (
      SELECT
        user_id,
        percentile_cont(0.5) WITHIN GROUP (ORDER BY "roiEquityPlusDebtPct") as roi_median,
        percentile_cont(0.5) WITHIN GROUP (ORDER BY "roePct") as roe_median,
        percentile_cont(0.5) WITHIN GROUP (ORDER BY "rofPct") as rof_median,
        percentile_cont(0.5) WITHIN GROUP (ORDER BY "absoluteActualErrorPct") as actual_error_median,
        percentile_cont(0.5) WITHIN GROUP (ORDER BY "absoluteForecastErrorPct") as forecast_error_median
      FROM user_predictions
      WHERE "roiEquityPlusDebtPct" IS NOT NULL 
         OR "roePct" IS NOT NULL 
         OR "rofPct" IS NOT NULL
         OR "absoluteActualErrorPct" IS NOT NULL
         OR "absoluteForecastErrorPct" IS NOT NULL
      GROUP BY user_id
    )
    SELECT 
      up.user_id as "userId",
      up.user_name as "userName",
      up.user_email as "userEmail",
      COUNT(*)::int as "totalCompletedPredictions",
      COUNT(*)::int as "totalPredictions",
      COUNT(CASE WHEN forecast_type = 'BINARY' AND confidence IS NOT NULL THEN 1 END)::int as "completedBinaryPredictions",
      COUNT(CASE WHEN forecast_type = 'CONTINUOUS' THEN 1 END)::int as "completedContinuousPredictions",
      COUNT(CASE WHEN "isCorrect" = true THEN 1 END)::int as "correctPredictions",
      COUNT(CASE WHEN "isCorrect" = false THEN 1 END)::int as "incorrectPredictions",
      CASE 
        WHEN COUNT(CASE WHEN forecast_type = 'BINARY' THEN 1 END) > 0 THEN 
          (COUNT(CASE WHEN "isCorrect" = true THEN 1 END)::numeric / COUNT(CASE WHEN forecast_type = 'BINARY' THEN 1 END)::numeric)
        ELSE NULL 
      END as "accuracyRate",
      CASE 
        WHEN COUNT(CASE WHEN forecast_type = 'BINARY' THEN 1 END) > 0 THEN 
          (COUNT(CASE WHEN "isCorrect" = false THEN 1 END)::numeric / COUNT(CASE WHEN forecast_type = 'BINARY' THEN 1 END)::numeric)
        ELSE NULL 
      END as "incorrectRate",
      AVG(CASE WHEN forecast_type = 'BINARY' AND confidence IS NOT NULL THEN confidence::numeric / 100 END) as "avgProbabilityBinary",
      COUNT(CASE WHEN "highLow" = 'HIGH' THEN 1 END)::int as "highCountContinuous",
      COUNT(CASE WHEN "highLow" = 'LOW' THEN 1 END)::int as "lowCountContinuous",
      COUNT(CASE WHEN "highLow" = 'PERFECT' THEN 1 END)::int as "perfectCountContinuous",
      CASE 
        WHEN COUNT(CASE WHEN forecast_type = 'CONTINUOUS' THEN 1 END) > 0 THEN 
          (COUNT(CASE WHEN "highLow" = 'HIGH' THEN 1 END)::numeric / COUNT(CASE WHEN forecast_type = 'CONTINUOUS' THEN 1 END)::numeric)
        ELSE NULL 
      END as "highPercentContinuous",
      CASE 
        WHEN COUNT(CASE WHEN forecast_type = 'CONTINUOUS' THEN 1 END) > 0 THEN 
          (COUNT(CASE WHEN "highLow" = 'LOW' THEN 1 END)::numeric / COUNT(CASE WHEN forecast_type = 'CONTINUOUS' THEN 1 END)::numeric)
        ELSE NULL 
      END as "lowPercentContinuous",
      CASE 
        WHEN COUNT(CASE WHEN forecast_type = 'CONTINUOUS' THEN 1 END) > 0 THEN 
          (COUNT(CASE WHEN "highLow" = 'PERFECT' THEN 1 END)::numeric / COUNT(CASE WHEN forecast_type = 'CONTINUOUS' THEN 1 END)::numeric)
        ELSE NULL 
      END as "perfectPercentContinuous",
      SUM("equityInvestment") as "totalEquityInvestment",
      SUM("debtFinancing") as "totalDebtFinancing",
      SUM("totalInvestment") as "totalInvestment",
      SUM("netProfitEquityPlusDebt") as "totalNetProfit",
      (1000000000 + SUM("netProfitEquityPlusDebt")) as "fundBalance",
      SUM(roe) as "profitFromEquity",
      SUM(rof) as "profitFromFinancing",
      CASE WHEN SUM("totalInvestment") > 0 THEN SUM("netProfitEquityPlusDebt") / SUM("totalInvestment") ELSE NULL END as "roiReal",
      AVG("roiEquityPlusDebtPct") as "roiAverage",
      pa.roi_median as "roiMedian",
      AVG("roiEquityPlusDebtPct") as "avgRoiEquityPlusDebtPct",
      CASE WHEN SUM("equityInvestment") > 0 THEN SUM(roe) / SUM("equityInvestment") ELSE NULL END as "roeReal",
      AVG("roePct") as "roeAverage",
      pa.roe_median as "roeMedian",
      SUM(roe) as "totalRoe",
      AVG("roePct") as "avgRoePct",
      SUM("debtRepayment") as "interestPaymentOnDebt",
      CASE WHEN SUM("debtFinancing") > 0 THEN SUM(rof) / SUM("debtFinancing") ELSE NULL END as "rofReal",
      AVG("rofPct") as "rofAverage",
      pa.rof_median as "rofMedian",
      SUM(rof) as "totalRof",
      AVG("rofPct") as "avgRofPct",
      AVG("absoluteActualErrorPct") as "avgActualError",
      pa.actual_error_median as "medianActualError",
      AVG("absoluteForecastErrorPct") as "avgForecastError",
      pa.forecast_error_median as "medianForecastError",
      AVG("absoluteError") as "avgAbsoluteError",
      AVG("absoluteActualErrorPct") as "avgAbsoluteActualErrorPct",
      AVG("absoluteForecastErrorPct") as "avgAbsoluteForecastErrorPct",
      SUM("estimatedTime") as "totalForecastTimeMinutes",
      AVG("estimatedTime") as "avgTimePerForecastMinutes",
      CASE WHEN SUM("estimatedTime") > 0 THEN SUM("netProfitEquityPlusDebt") / (SUM("estimatedTime") / 60.0) ELSE NULL END as "weightedAvgHourlyProfit",
      AVG("profitPerHour") as "simpleAvgHourlyProfit",
      AVG("profitPerHour") as "avgProfitPerHour",
      AVG("brierScore") as "avgBrierScore",
      AVG("roiScore") as "avgRoiScore"
    FROM user_predictions up
    LEFT JOIN percentile_agg pa ON pa.user_id = up.user_id
    GROUP BY up.user_id, up.user_name, up.user_email, pa.roi_median, pa.roe_median, pa.rof_median, pa.actual_error_median, pa.forecast_error_median
  `;

  const rawEntry = result[0];
  return rawEntry ? convertDecimalsToNumbers(rawEntry) : null;
}

/**
 * Get count of users with predictions in the organization
 * Only counts USER role (excludes ORG_ADMIN and SUPER_ADMIN)
 */
export async function getLeaderboardParticipantCount(
  organizationId: string
): Promise<number> {
  const result = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(DISTINCT u.id) as count
    FROM "User" u
    INNER JOIN "Prediction" p ON p."userId" = u.id
    INNER JOIN "Forecast" f ON f.id = p."forecastId"
    WHERE 
      u."organizationId" = ${organizationId}
      AND f."actualValue" IS NOT NULL
      AND u.role = 'USER'
  `;

  return Number(result[0].count);
}

/**
 * Prediction/Forecast leaderboard entry
 */
export interface PredictionLeaderboardEntry {
  forecastId: string;
  forecastTitle: string;
  forecastType: string;
  categoryName: string | null;

  // Participation metrics
  totalParticipants: number;
  participantsCompleted: number;

  // Accuracy metrics (for binary)
  correctPredictions: number;
  incorrectPredictions: number;
  accuracyRate: number | null;
  avgProbability: number | null;

  // Continuous performance
  highCount: number;
  lowCount: number;
  perfectCount: number;
  avgActualError: number | null;
  avgForecastError: number | null;

  // Financial aggregates
  totalInvestment: number | null;
  totalNetProfit: number | null;
  avgRoi: number | null;
  totalEquityInvestment: number | null;
  totalDebtFinancing: number | null;

  // Time metrics
  avgTimePerPrediction: number | null;
  totalTimeSpent: number | null;
}

type RawPredictionLeaderboardEntry = Omit<
  PredictionLeaderboardEntry,
  | "accuracyRate"
  | "avgProbability"
  | "avgActualError"
  | "avgForecastError"
  | "totalInvestment"
  | "totalNetProfit"
  | "avgRoi"
  | "totalEquityInvestment"
  | "totalDebtFinancing"
  | "avgTimePerPrediction"
  | "totalTimeSpent"
> & {
  accuracyRate: Decimal | null;
  avgProbability: Decimal | null;
  avgActualError: Decimal | null;
  avgForecastError: Decimal | null;
  totalInvestment: Decimal | null;
  totalNetProfit: Decimal | null;
  avgRoi: Decimal | null;
  totalEquityInvestment: Decimal | null;
  totalDebtFinancing: Decimal | null;
  avgTimePerPrediction: Decimal | null;
  totalTimeSpent: Decimal | null;
};

/**
 * Get leaderboard aggregated by prediction/forecast
 */
export async function getOrganizationPredictionLeaderboard({
  organizationId,
  sortBy = "totalParticipants",
  sortOrder = "desc",
  forecastIds,
  categoryIds,
  forecastTypes,
  dateFrom,
  dateTo,
}: {
  organizationId: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  forecastIds?: string;
  categoryIds?: string;
  forecastTypes?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<PredictionLeaderboardEntry[]> {
  const validSortColumns = [
    "forecastTitle",
    "totalParticipants",
    "participantsCompleted",
    "accuracyRate",
    "avgRoi",
    "totalNetProfit",
    "avgTimePerPrediction",
  ];

  const sortColumn = validSortColumns.includes(sortBy)
    ? sortBy
    : "totalParticipants";
  const direction = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";
  const nullsPosition = direction === "DESC" ? "NULLS LAST" : "NULLS FIRST";

  const conditions = ['f."organizationId" = $1', 'f."actualValue" IS NOT NULL'];
  const params: (string | number)[] = [organizationId];

  if (forecastIds) {
    const ids = forecastIds.split(",").filter(Boolean);
    if (ids.length > 0) {
      const placeholders = ids
        .map((_, i) => `$${params.length + i + 1}`)
        .join(", ");
      conditions.push(`f.id IN (${placeholders})`);
      params.push(...ids);
    }
  }

  if (categoryIds) {
    const ids = categoryIds.split(",").filter(Boolean);
    if (ids.length > 0) {
      const placeholders = ids
        .map((_, i) => `$${params.length + i + 1}`)
        .join(", ");
      conditions.push(`f."categoryId" IN (${placeholders})`);
      params.push(...ids);
    }
  }

  if (forecastTypes) {
    const types = forecastTypes.split(",").filter(Boolean);
    if (types.length > 0) {
      const placeholders = types
        .map((_, i) => `$${params.length + i + 1}::"ForecastType"`)
        .join(", ");
      conditions.push(`f.type IN (${placeholders})`);
      params.push(...types);
    }
  }

  if (dateFrom) {
    conditions.push(`f."dataReleaseDate" >= $${params.length + 1}::timestamp`);
    params.push(dateFrom);
  }

  if (dateTo) {
    conditions.push(`f."dataReleaseDate" <= $${params.length + 1}::timestamp`);
    params.push(dateTo);
  }

  const whereClause = conditions.join(" AND ");

  const query = `
    SELECT
      f.id as "forecastId",
      f.title as "forecastTitle",
      f.type::text as "forecastType",
      fc.name as "categoryName",
      
      COUNT(DISTINCT p."userId")::int as "totalParticipants",
      COUNT(DISTINCT p.id)::int as "participantsCompleted",
      
      COUNT(CASE WHEN p."isCorrect" = true THEN 1 END)::int as "correctPredictions",
      COUNT(CASE WHEN p."isCorrect" = false THEN 1 END)::int as "incorrectPredictions",
      CASE 
        WHEN COUNT(CASE WHEN f.type = 'BINARY' THEN 1 END) > 0 THEN
          (COUNT(CASE WHEN p."isCorrect" = true THEN 1 END)::numeric / COUNT(CASE WHEN f.type = 'BINARY' THEN 1 END)::numeric)
        ELSE NULL
      END as "accuracyRate",
      AVG(CASE WHEN f.type = 'BINARY' AND p.confidence IS NOT NULL THEN p.confidence::numeric / 100 END) as "avgProbability",
      
      COUNT(CASE WHEN p."highLow" = 'HIGH' THEN 1 END)::int as "highCount",
      COUNT(CASE WHEN p."highLow" = 'LOW' THEN 1 END)::int as "lowCount",
      COUNT(CASE WHEN p."highLow" = 'PERFECT' THEN 1 END)::int as "perfectCount",
      AVG(p."absoluteActualErrorPct") as "avgActualError",
      AVG(p."absoluteForecastErrorPct") as "avgForecastError",
      
      SUM(p."totalInvestment") as "totalInvestment",
      SUM(p."netProfitEquityPlusDebt") as "totalNetProfit",
      AVG(p."roiEquityPlusDebtPct") as "avgRoi",
      SUM(p."equityInvestment") as "totalEquityInvestment",
      SUM(p."debtFinancing") as "totalDebtFinancing",
      
      AVG(p."estimatedTime") as "avgTimePerPrediction",
      SUM(p."estimatedTime") as "totalTimeSpent"
      
    FROM "Forecast" f
    LEFT JOIN "ForecastCategory" fc ON fc.id = f."categoryId"
    LEFT JOIN "Prediction" p ON p."forecastId" = f.id
    LEFT JOIN "User" u ON u.id = p."userId" AND u.role = 'USER'
    WHERE ${whereClause}
    GROUP BY f.id, f.title, f.type, fc.name
    ORDER BY "${sortColumn}" ${direction} ${nullsPosition}
  `;

  const result = await prisma.$queryRawUnsafe<RawPredictionLeaderboardEntry[]>(
    query,
    ...params
  );

  return result.map((row) => ({
    ...row,
    accuracyRate: row.accuracyRate ? Number(row.accuracyRate) : null,
    avgProbability: row.avgProbability ? Number(row.avgProbability) : null,
    avgActualError: row.avgActualError ? Number(row.avgActualError) : null,
    avgForecastError: row.avgForecastError
      ? Number(row.avgForecastError)
      : null,
    totalInvestment: row.totalInvestment ? Number(row.totalInvestment) : null,
    totalNetProfit: row.totalNetProfit ? Number(row.totalNetProfit) : null,
    avgRoi: row.avgRoi ? Number(row.avgRoi) : null,
    totalEquityInvestment: row.totalEquityInvestment
      ? Number(row.totalEquityInvestment)
      : null,
    totalDebtFinancing: row.totalDebtFinancing
      ? Number(row.totalDebtFinancing)
      : null,
    avgTimePerPrediction: row.avgTimePerPrediction
      ? Number(row.avgTimePerPrediction)
      : null,
    totalTimeSpent: row.totalTimeSpent ? Number(row.totalTimeSpent) : null,
  }));
}

/**
 * Category leaderboard entry
 */
export interface CategoryLeaderboardEntry {
  categoryId: string;
  categoryName: string;
  categoryDescription: string | null;

  // Forecast metrics
  totalForecasts: number;
  completedForecasts: number;

  // Participation
  totalParticipants: number;
  totalPredictions: number;
  avgPredictionsPerForecast: number | null;

  // Accuracy
  correctPredictions: number;
  accuracyRate: number | null;

  // Financial
  totalInvestment: number | null;
  totalNetProfit: number | null;
  avgRoi: number | null;

  // Time
  totalTimeSpent: number | null;
  avgTimePerPrediction: number | null;
}

type RawCategoryLeaderboardEntry = Omit<
  CategoryLeaderboardEntry,
  | "avgPredictionsPerForecast"
  | "accuracyRate"
  | "totalInvestment"
  | "totalNetProfit"
  | "avgRoi"
  | "totalTimeSpent"
  | "avgTimePerPrediction"
> & {
  avgPredictionsPerForecast: Decimal | null;
  accuracyRate: Decimal | null;
  totalInvestment: Decimal | null;
  totalNetProfit: Decimal | null;
  avgRoi: Decimal | null;
  totalTimeSpent: Decimal | null;
  avgTimePerPrediction: Decimal | null;
};

/**
 * Get leaderboard aggregated by category
 */
export async function getOrganizationCategoryLeaderboard({
  organizationId,
  sortBy = "totalForecasts",
  sortOrder = "desc",
  categoryIds,
  forecastTypes,
  dateFrom,
  dateTo,
}: {
  organizationId: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  categoryIds?: string;
  forecastTypes?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<CategoryLeaderboardEntry[]> {
  const validSortColumns = [
    "categoryName",
    "totalForecasts",
    "totalParticipants",
    "accuracyRate",
    "totalNetProfit",
    "avgRoi",
  ];

  const sortColumn = validSortColumns.includes(sortBy)
    ? sortBy
    : "totalForecasts";
  const direction = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";
  const nullsPosition = direction === "DESC" ? "NULLS LAST" : "NULLS FIRST";

  const conditions = ['fc."organizationId" = $1'];
  const params: (string | number)[] = [organizationId];

  if (categoryIds) {
    const ids = categoryIds.split(",").filter(Boolean);
    if (ids.length > 0) {
      const placeholders = ids
        .map((_, i) => `$${params.length + i + 1}`)
        .join(", ");
      conditions.push(`fc.id IN (${placeholders})`);
      params.push(...ids);
    }
  }

  const whereClause = conditions.join(" AND ");

  const query = `
    SELECT
      fc.id as "categoryId",
      fc.name as "categoryName",
      fc.description as "categoryDescription",
      
      COUNT(DISTINCT f.id)::int as "totalForecasts",
      COUNT(DISTINCT CASE WHEN f."actualValue" IS NOT NULL THEN f.id END)::int as "completedForecasts",
      
      COUNT(DISTINCT p."userId")::int as "totalParticipants",
      COUNT(p.id)::int as "totalPredictions",
      CASE 
        WHEN COUNT(DISTINCT f.id) > 0 THEN
          COUNT(p.id)::numeric / COUNT(DISTINCT f.id)::numeric
        ELSE NULL
      END as "avgPredictionsPerForecast",
      
      COUNT(CASE WHEN p."isCorrect" = true THEN 1 END)::int as "correctPredictions",
      CASE 
        WHEN COUNT(p.id) > 0 THEN
          (COUNT(CASE WHEN p."isCorrect" = true THEN 1 END)::numeric / COUNT(p.id)::numeric)
        ELSE NULL
      END as "accuracyRate",
      
      SUM(p."totalInvestment") as "totalInvestment",
      SUM(p."netProfitEquityPlusDebt") as "totalNetProfit",
      AVG(p."roiEquityPlusDebtPct") as "avgRoi",
      
      SUM(p."estimatedTime") as "totalTimeSpent",
      AVG(p."estimatedTime") as "avgTimePerPrediction"
      
    FROM "ForecastCategory" fc
    LEFT JOIN "Forecast" f ON f."categoryId" = fc.id
    LEFT JOIN "Prediction" p ON p."forecastId" = f.id
    LEFT JOIN "User" u ON u.id = p."userId" AND u.role = 'USER'
    WHERE ${whereClause}
    GROUP BY fc.id, fc.name, fc.description
    ORDER BY "${sortColumn}" ${direction} ${nullsPosition}
  `;

  const result = await prisma.$queryRawUnsafe<RawCategoryLeaderboardEntry[]>(
    query,
    ...params
  );

  return result.map((row) => ({
    ...row,
    avgPredictionsPerForecast: row.avgPredictionsPerForecast
      ? Number(row.avgPredictionsPerForecast)
      : null,
    accuracyRate: row.accuracyRate ? Number(row.accuracyRate) : null,
    totalInvestment: row.totalInvestment ? Number(row.totalInvestment) : null,
    totalNetProfit: row.totalNetProfit ? Number(row.totalNetProfit) : null,
    avgRoi: row.avgRoi ? Number(row.avgRoi) : null,
    totalTimeSpent: row.totalTimeSpent ? Number(row.totalTimeSpent) : null,
    avgTimePerPrediction: row.avgTimePerPrediction
      ? Number(row.avgTimePerPrediction)
      : null,
  }));
}
