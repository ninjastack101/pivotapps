'use strict';

const appInsights = require('applicationinsights');
appInsights
    .setup()
    .setAutoDependencyCorrelation(process.env.APP_INSIGHTS_DEPENDENCY_CORRELATION || true)
    .setAutoCollectRequests(process.env.APP_INSIGHTS_COLLECT_REQUESTS || true)
    .setAutoCollectPerformance(process.env.APP_INSIGHTS_COLLECT_PERFORMANCE || true)
    .setAutoCollectExceptions(process.env.APP_INSIGHTS_COLLECT_EXCEPTIONS || true)
    .setAutoCollectDependencies(process.env.APP_INSIGHTS_COLLECT_DEPENDENCIES || true)
    .setAutoCollectConsole(process.env.APP_INSIGHTS_COLLECT_CONSOLE || true, true)
    .setUseDiskRetryCaching(true);

module.exports = appInsights;