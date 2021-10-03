/* eslint-disable quote-props */
/* eslint-disable one-var */
/* eslint-disable no-process-env */
require('dotenv').config();

const Airtable = require('airtable');
const uuid4 = require('uuid4');
const print = require('../print/index');


module.exports = async (runError, runSummary, runOptions, publishSummary) => {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
    const tableName = process.env.AIRTABLE_TABLE_NAME;
    const runID = uuid4();

    const analyticsPayload = {
        'Run-uuid': runID,
        'RequestsPassed': runSummary.run.stats.requests.total || -1,
        'RequestsFailed': runSummary.run.stats.requests.failed || -1,
        'RequestsPending': runSummary.run.stats.requests.pending || -1,
        'RunPayloadSize': publishSummary.runPayloadSize || -1,
        'PublishRunIntent': runOptions.publish ? 'true' : 'false',
        'PublishWithoutResponse': runOptions.publishWithoutResponse || 'false',
        'uploadSuccessful': publishSummary.uploadSuccessful || 'false',
        'ResultUrl': publishSummary.resultUrl || '',
        'publishTimeout': runOptions.publishTimeout || -1,
        'uploadError': publishSummary.error || '',
        'totalRuntime': runSummary.run.timings.completed - runSummary.run.timings.started || -1,
        'runError': runError || runSummary.run.error || ( runSummary.run.failures.length ? `Tests failed: ${runSummary.run.failures.length}`  : '' )
    };

    print.lf('Uploading analytics data');

    try {
        const record = await base(tableName).create(analyticsPayload);

        print.lf(`Uploaded analytics - Record Id: ${record.getId()}`);

    } catch(err){
        print.lf(`Couldn't upload the analytics of the run
                  Payload: ${JSON.stringify(analyticsPayload)}
                  Error : ${err}`);
    }
};
