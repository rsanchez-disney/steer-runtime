/**
 * Custom Field Alias Registry
 *
 * Maps human-friendly aliases to Jira custom field IDs.
 * Add new aliases here so every tool (get, search, update, create) resolves them automatically.
 *
 * Usage:
 *   - In tool input the user can pass either the alias ("team") or the raw ID ("customfield_22600").
 *   - resolveCustomFieldIds() normalises an array of mixed aliases/IDs into real field IDs.
 */

/** alias → customfield_XXXXX */
export const CUSTOM_FIELD_ALIASES: Record<string, string> = {
    // ── Agile / Planning ─────────────────────────────
    sprint: "customfield_10803",
    storyPoints: "customfield_10003",
    epicLink: "customfield_13912",
    epicName: "customfield_13913",
    epicStatus: "customfield_13914",
    epicColour: "customfield_13915",
    epicGroup: "customfield_18701",
    epicTotalStoryPoints: "customfield_19900",
    rank: "customfield_17403",
    rankObsolete: "customfield_10700",
    flagged: "customfield_10000",
    epicTheme: "customfield_10001",
    parentLink: "customfield_22601",
    parentIssueSummary: "customfield_23701",
    parentSummary: "customfield_19500",
    originalStoryPoints: "customfield_22604",
    targetStart: "customfield_22602",
    targetEnd: "customfield_22603",
    programIncrement: "customfield_24500",
    forcedRank: "customfield_18812",

    // ── Team / Org ───────────────────────────────────
    team: "customfield_22600",
    teams: "customfield_13314",
    studio: "customfield_20001",
    division: "customfield_15207",
    functionalTeam: "customfield_15206",
    projectTeam: "customfield_13601",
    discipline: "customfield_13600",
    businessUnit: "customfield_12719",
    property: "customfield_13321",
    propertyName: "customfield_19519",
    propertyBrand: "customfield_19515",
    businessType: "customfield_19514",
    portfolio: "customfield_24400",

    // ── People / Roles ───────────────────────────────
    projectOwner: "customfield_12804",
    productOwner: "customfield_21202",
    productOwners: "customfield_21801",
    executiveOwner: "customfield_21201",
    projectManager: "customfield_25300",
    productManager: "customfield_18903",
    architect: "customfield_18902",
    bsa: "customfield_18901",
    devAssignee: "customfield_18005",
    qaAssignee: "customfield_18006",
    approver: "customfield_13306",
    executiveApprover: "customfield_13005",
    validatorName: "customfield_21200",
    validator: "customfield_25100",
    hiringManager: "customfield_19508",
    accountManager: "customfield_14500",
    dri: "customfield_18806",
    partner: "customfield_18807",
    technicalPoc: "customfield_26000",
    productionPoc: "customfield_15305",
    developers: "customfield_18415",
    designer: "customfield_25900",
    artist: "customfield_13316",
    requestorName: "customfield_16601",
    assetRequestedBy: "customfield_18000",
    creatorDisplayName: "customfield_18420",
    creatorsEmail: "customfield_18419",
    contactInformation: "customfield_15704",
    userSelector: "customfield_18201",

    // ── Dates ────────────────────────────────────────
    startDate: "customfield_10204",
    oldStartDate: "customfield_21500",
    releaseDate: "customfield_11800",
    liveDate: "customfield_12606",
    endDate: "customfield_12726",
    endDateTime: "customfield_18907",
    startDateTime: "customfield_17302",
    handoverDate: "customfield_12904",
    approvalDueDate: "customfield_14700",
    qaDeliveryDate: "customfield_12908",
    qaSignOffDueDate: "customfield_12909",
    requestedRushDate: "customfield_18200",
    firstDraftDate: "customfield_19403",
    lastDraftDate: "customfield_22300",
    creativeDueDate: "customfield_23802",
    routingDate: "customfield_23803",
    devDueDate: "customfield_25600",
    stageDueDate: "customfield_25701",
    mandatedRemediationDate: "customfield_22400",
    testEndDate: "customfield_20118",
    beginDate: "customfield_20117",
    dateDriver: "customfield_21100",

    // ── Status / Workflow ─────────────────────────────
    qaStatus: "customfield_11034",
    devStatus: "customfield_11037",
    submissionStatus: "customfield_17701",
    approvalStatus: "customfield_19101",
    initiativeStatus: "customfield_15001",
    taskComplete: "customfield_19700",
    taskType: "customfield_21103",
    publishEarly: "customfield_21101",

    // ── QA / Testing ─────────────────────────────────
    qaSeverity: "customfield_11035",
    severity: "customfield_11002",
    bugSeverity: "customfield_26700",
    bugType: "customfield_20900",
    bugDetected: "customfield_26400",
    category: "customfield_11038",
    reproducible: "customfield_11004",
    stepsToReproduce: "customfield_11005",
    expectedResults: "customfield_11006",
    actualResults: "customfield_11007",
    browsersUsed: "customfield_11008",
    serverEnvironment: "customfield_11009",
    operatingSystem: "customfield_11014",
    environmentEncountered: "customfield_11015",
    devicePlatform: "customfield_11039",
    platforms: "customfield_11500",
    mobilePlatform: "customfield_15303",
    testType: "customfield_20100",
    cucumberTestType: "customfield_20101",
    cucumberScenario: "customfield_20102",
    genericTestDefinition: "customfield_20103",
    manualTestSteps: "customfield_20104",
    stepsCount: "customfield_20106",
    testSetsAssociation: "customfield_20107",
    preConds: "customfield_20108",
    testPlansAssociation: "customfield_20109",
    testRunStatus: "customfield_20110",
    testRepositoryPath: "customfield_20111",
    testsAssociationTestSet: "customfield_20112",
    testCount: "customfield_20113",
    testSetStatus: "customfield_20114",
    testsAssociationExecution: "customfield_20115",
    testExecutionDefects: "customfield_20116",
    testExecutionStatus: "customfield_20120",
    preConditionType: "customfield_20121",
    conditions: "customfield_20122",
    requirementStatus: "customfield_20123",
    testsAssociationPreCondition: "customfield_20124",
    testEnvironments: "customfield_20125",
    testsAssociationTestPlan: "customfield_20126",
    testPlan: "customfield_20127",
    testPlanStatus: "customfield_20128",
    testPlanRootFolders: "customfield_20129",
    testPlanTestsFilter: "customfield_23600",
    automationCandidate: "customfield_23001",
    automationStatus: "customfield_23002",
    automationOwner: "customfield_23003",
    automationFramework: "customfield_23004",
    applicationTested: "customfield_23000",
    testingPhase: "customfield_27302",
    qTestDefectCode: "customfield_24000",

    // ── Requirements / Stories ────────────────────────
    userStory: "customfield_20000",
    acceptanceCriteria: "customfield_16400",
    businessRulesApproved: "customfield_21002",
    technicalDesignApproved: "customfield_21003",
    acceptanceCriteriaApproved: "customfield_21004",
    uiUxDesignApproved: "customfield_22200",
    functionalRequirements: "customfield_25400",
    nonFunctionalRequirements: "customfield_25401",
    businessJustification: "customfield_15211",
    overview: "customfield_25000",
    executiveSummary: "customfield_23900",

    // ── Dev / Engineering ────────────────────────────
    development: "customfield_19000",
    pullRequest: "customfield_21707",
    buildNumber: "customfield_19510",
    appVersion: "customfield_15301",
    targetRelease: "customfield_18306",
    releaseVersionHistory: "customfield_10005",
    hotfix: "customfield_16600",
    fixAvailable: "customfield_26001",
    environmentDeployed: "customfield_26100",
    environmentsImpacted: "customfield_27300",
    hosting: "customfield_15700",
    internalUrl: "customfield_21600",
    url: "customfield_12914",

    // ── AI Metrics ───────────────────────────────────
    aiAssistedEffort: "customfield_27200",
    aiUsageLevel: "customfield_27201",
    aiToolsUsed: "customfield_27202",

    // ── Risk / Security ──────────────────────────────
    securityVm: "customfield_23700",
    securityVulnerability: "customfield_21702",
    archerDetail: "customfield_21703",
    archerFinding: "customfield_23301",
    raidType: "customfield_26300",
    scopeImpact: "customfield_20004",
    costImpact: "customfield_20002",
    scheduleImpact: "customfield_20003",
    mitigation: "customfield_20005",
    reason: "customfield_20006",
    businessImpact: "customfield_26701",
    potentialOfOccurrence: "customfield_26800",
    origin: "customfield_26801",
    accessibility: "customfield_27301",
    privacyRegion: "customfield_15304",
    coppaCategory: "customfield_15302",

    // ── Finance / Contracts ──────────────────────────
    costCenter: "customfield_13322",
    budget: "customfield_15702",
    externalSpending: "customfield_11617",
    roi: "customfield_24600",
    revenuePotential: "customfield_25200",
    capitalProject: "customfield_21706",
    myPpmBilling: "customfield_22100",
    highLevelEstimate: "customfield_18904",
    plannedEstimate: "customfield_26500",
    changeInCost: "customfield_26501",
    contractItem: "customfield_24900",
    materialImpactAccrual: "customfield_20411",
    manualAccrualDeal: "customfield_20400",
    dealNumber: "customfield_20404",
    licensee: "customfield_20405",
    pilotProjectId: "customfield_25800",

    // ── SNOW / Change ────────────────────────────────
    changeNumber: "customfield_18905",
    snowTicketCreation: "customfield_20403",
    snowRequestNumber: "customfield_20201",
    changeType: "customfield_26201",
    missedCommitmentReason: "customfield_26202",

    // ── Content / Creative ───────────────────────────
    mediaType: "customfield_18404",
    assetType: "customfield_18600",
    assetDetails: "customfield_23801",
    assetRequest: "customfield_19701",
    contentId: "customfield_12720",
    contentType: "customfield_12714",
    copy: "customfield_12613",
    creativeCopy: "customfield_24300",
    creativeTeam: "customfield_18001",
    buildTeam: "customfield_18002",
    productsToFeature: "customfield_24301",
    socialAssets: "customfield_15009",
    character: "customfield_19607",
    displayPreference: "customfield_24100",

    // ── Campaign / Experimentation ───────────────────
    campaignGoal: "customfield_23100",
    campaignType: "customfield_23205",
    campaignCode: "customfield_25504",
    trafficPercentage: "customfield_23200",
    languageLocale: "customfield_23201",
    geolocation: "customfield_23202",
    hypothesis: "customfield_23203",
    permanentImplementation: "customfield_23204",
    audience: "customfield_18410",
    distributionChannels: "customfield_18418",

    // ── FADEL / Licensing ────────────────────────────
    fadelTicket: "customfield_20500",
    fadelParentTicket: "customfield_20501",
    bappId: "customfield_20502",
    fadelPortalUrl: "customfield_20504",
    fadelRelatedTicket: "customfield_20600",
    fadelRelatedPortalUrl: "customfield_20602",
    fadelParentPortalUrl: "customfield_20601",
    categoryFadel: "customfield_20408",
    auditRestriction: "customfield_20406",
    conversionTicket: "customfield_20410",

    // ── Sustainment / Ops ────────────────────────────
    sustainmentCategory: "customfield_23300",
    rootCauseAnalysis: "customfield_20805",
    resolutionSummary: "customfield_27100",
    monitoring: "customfield_18906",
    daysToResolve: "customfield_18705",
    evidenceOfCompletion: "customfield_20800",
    customer: "customfield_18700",
    customerPriority: "customfield_11003",
    needMoreInfoCounter: "customfield_19401",

    // ── Watchers / Notifications ─────────────────────
    addWatchers: "customfield_22800",
    watchers: "customfield_26600",
    watchersInitialized: "customfield_26601",
    lastComment: "customfield_22801",

    // ── Misc / Other ─────────────────────────────────
    feature: "customfield_17600",
    featureFunction: "customfield_22001",
    initiative: "customfield_22000",
    product: "customfield_14602",
    documentation: "customfield_13100",
    notes: "customfield_13502",
    additionalDetails: "customfield_11708",
    deliveryNotes: "customfield_13309",
    objectives: "customfield_17201",
    kpi: "customfield_23800",
    location: "customfield_20007",
    region: "customfield_12603",
    vendor: "customfield_12614",
    vendorOther: "customfield_13629",
    vendorServicesNeeded: "customfield_12902",
    sourceLocation: "customfield_12901",
    internalNetworkPath: "customfield_19301",
    finalAssetDropPath: "customfield_12611",
    trackingUrls: "customfield_13700",
    guestFacingDescription: "customfield_17305",
    justification: "customfield_20300",
    numberOfPositions: "customfield_20301",
    requisitionNo: "customfield_19502",
    sapPositionNo: "customfield_19511",
    projectDescription: "customfield_11600",
    requestType: "customfield_15202",
    requestedUser: "customfield_15203",
    affectedLanguage: "customfield_11013",
    requiresLocalization: "customfield_12912",
    externalIssueId: "customfield_11100",
    bugsProject: "customfield_19201",
    groupPickerSubmission: "customfield_17804",
    groupPickerSubtask: "customfield_17803",
    group: "customfield_13801",
    options: "customfield_13909",
    financeApproval: "customfield_13406",
    isbn: "customfield_18802",
    finalFiles: "customfield_18803",
    timeSlot: "customfield_18800",
    frequency: "customfield_18004",
    applicationOtherContact: "customfield_18810",
    projectIds: "customfield_18809",
    bappName: "customfield_21701",
    businessApplication: "customfield_21700",
    aid: "customfield_21708",
    issueFunction: "customfield_21709",
    phase: "customfield_12705",
    qaTestingField: "customfield_12601",
    restrictedViewers: "customfield_20803",
    deploymentSupport: "customfield_20409",
    refactorReason: "customfield_23400",
    retirementReason: "customfield_23401",
    notAutomatedReason: "customfield_23402",
    rmCoeCategory: "customfield_24800",
    count: "customfield_22700",
    engine: "customfield_22701",
    database: "customfield_22702",
    server: "customfield_22703",
    instance: "customfield_22704",
    smartChecklist: "customfield_22900",
    checklists: "customfield_22901",
    smartChecklistProgress: "customfield_22902",
    datasetValues: "customfield_22401",
    personaPriority: "customfield_22501",
    persona: "customfield_22500",
    syncIssue: "customfield_25500",
    classification: "customfield_25501",
    messageType: "customfield_25502",
    guestStatus: "customfield_25503",
    ticketType: "customfield_27002",
    numberBuilt: "customfield_26900",
    discovered: "customfield_21300",
    ympPiGoal: "customfield_26200",
};

/** Reverse lookup: customfield_XXXXX → alias (for display) */
const REVERSE_ALIASES: Record<string, string> = Object.fromEntries(
    Object.entries(CUSTOM_FIELD_ALIASES).map(([alias, fieldId]) => [
        fieldId,
        alias,
    ]),
);

/**
 * Resolve an array of aliases / raw field IDs into actual Jira field IDs.
 *
 * Accepts:
 *   - Known alias strings  → resolved via CUSTOM_FIELD_ALIASES
 *   - Raw field IDs        → "customfield_XXXXX" passed through as-is
 *
 * Unknown strings that don't match an alias and don't look like a customfield ID
 * are silently dropped (logged to stderr).
 */
export function resolveCustomFieldIds(input: string[]): string[] {
    const resolved: string[] = [];

    for (const token of input) {
        const lower = token.toLowerCase();

        // 1. Check alias map (case-insensitive)
        const aliasMatch = Object.entries(CUSTOM_FIELD_ALIASES).find(
            ([alias]) => alias.toLowerCase() === lower,
        );
        if (aliasMatch) {
            resolved.push(aliasMatch[1]);
            continue;
        }

        // 2. Already a customfield_XXXXX id
        if (/^customfield_\d+$/i.test(token)) {
            resolved.push(token);
            continue;
        }

        // 3. Unknown – warn and skip
        console.error(
            `[customFields] Unknown alias or field ID: "${token}" – skipping`,
        );
    }

    return [...new Set(resolved)]; // deduplicate
}

/**
 * Return a display-friendly label for a custom field ID.
 * If an alias exists it returns "alias (customfield_XXXXX)", otherwise just the ID.
 */
export function getCustomFieldLabel(fieldId: string): string {
    const alias = REVERSE_ALIASES[fieldId];
    return alias ? `${alias} (${fieldId})` : fieldId;
}

/**
 * Format the value of a custom field for human-readable output.
 * Handles common Jira value shapes (string, object with name/value, arrays, etc.).
 */
export function formatCustomFieldValue(value: unknown): string {
    if (value === null || value === undefined) return "Not set";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean")
        return String(value);

    // Object with name (e.g. sprint, status-like objects)
    if (typeof value === "object" && value !== null) {
        const obj = value as Record<string, unknown>;
        if (obj.name) return String(obj.name);
        if (obj.value) return String(obj.value);
        if (obj.displayName) return String(obj.displayName);

        // Array of objects
        if (Array.isArray(value)) {
            return value.map((v) => formatCustomFieldValue(v)).join(", ");
        }

        // Fallback: compact JSON
        return JSON.stringify(value);
    }

    return String(value);
}
