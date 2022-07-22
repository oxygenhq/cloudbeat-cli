import fs from 'fs';
import { CloudBeatService } from '../lib/CloudBeatService';
import * as DEFAULTS from '../lib/const/defaults';
import * as helper from '../lib/helper';
import { IReporterOptions } from '../types/IReporterOptions';

export default async function(testId: string, testType: string, apiKey: string, {
    host = undefined,
    cwd = process.cwd(),
    format = DEFAULTS.TEST_REPORT_FORMAT,
    folder = undefined,
    failOnErrors = true,
}) {
    if (!testId) {
        console.error('"testId" argument must be specified.');
        helper.finishCLI(failOnErrors);
    }
    else if (!testType) {
        console.error('"testType" argument must be specified.');
        helper.finishCLI(failOnErrors);
    }
    if (!apiKey) {
        console.error('"apiKey" argument must be specified.');
        helper.finishCLI(failOnErrors);
    }
    const cb = new CloudBeatService({
        host: host,
        apiKey: apiKey,
    });

    try {
        let result = null;

        if (testType === 'case') {
            result = await cb.runCase(testId);
        }
        else if (testType === 'monitor') {
            result = await cb.runMonitor(testId);
        }
        else {
            result = await cb.runSuite(testId);
        }

        if (result) {
            // set reporter settings
            const reporterOpt: IReporterOptions = {
                method: 'saveTestRunResults',
                targetFolder: 'results',
                cwd: undefined,
            };

            if (folder) {
                if (fs.existsSync(folder)) {
                    reporterOpt.targetFolder = folder;
                    reporterOpt.cwd = folder;
                }
                else {
                    console.error(`Folder "${folder}" does not exist`); // eslint-disable-line @typescript-eslint/restrict-template-expressions
                    helper.finishCLI(failOnErrors);
                }
            }
            else {
                reporterOpt.targetFolder = cwd;
                reporterOpt.cwd = cwd;
            }

            const reporter = helper.getReporterInstance(format, reporterOpt);
            const resultData = result?.data?.data;
            if (resultData) {
                const reportFilePath = reporter.generate(result.data.data);
                console.log(`The report is ready: ${reportFilePath}`);
            }
            else {
                console.log('No results received from the server');
            }            
            helper.finishCLI(failOnErrors, resultData);
        }
    }
    catch (e: any) {
        let msg = 'Test execution failed:';
        if (e && e.message){
            msg += ` ${  e.message}`;
        }
        console.error(msg);
        console.error(e);
        helper.finishCLI(failOnErrors);
    }
}
