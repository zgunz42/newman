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
            'Requests': runSummary.run.stats.requests || -1,
            'RunPayloadSize': publishSummary.runPayloadSize || -1,
            'PublishRunIntent': runOptions.publish || false,
            'PublishWithoutResponse': runOptions.publishWithoutResponse || false,
            'uploadSuccessful': publishSummary.uploadSuccessful,
            'ResultUrl': publishSummary.resultUrl,
            'publishTimeout': runOptions.publishTimeout,
            'uploadError': publishSummary.error || '',
            'totalRuntime': runSummary.run.timings.completed - runSummary.run.timings.started,
            'runError': runError || runSummary.run.error || runSummary.run.failures.length  || ''
        };

    try {
        const record = await base(tableName).create(JSON.stringify(analyticsPayload));

        print.lf(`Uploaded analytics -
                Record Id: ${record.getId()}`);

    } catch(err){
        print.lf(`Couldn't upload the analytics of the run
                            Payload: ${analyticsPayload}
                            Error : ${err}`);
    }

};
