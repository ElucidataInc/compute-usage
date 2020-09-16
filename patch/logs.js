import { pollyError } from './message.js';
const axios = require('axios');
const pollyEnv = require('./env.json');
const pollyHeader = require('./pollyheaders');

async function getJobLog(projectId, jobId, nextToken = null) {
  try {
    const logUrl = `${pollyEnv.baseV2Api}/projects/${projectId}/jobs/${jobId}/logs${ nextToken ? '?next_token=' + nextToken : ''}`
    let logReturn = await axios.get(logUrl, await pollyHeader.getV2Headers());
    if(!logReturn.data) {
      process.exit(0)
    }
    logReturn = logReturn.data.data[0].attributes;
    return logReturn
  } catch (error) {
    pollyError("Not able to get the logs")
  }
}

async function getAppLog(projectId, runId, logId, nextToken = null) {
  try {
    const logUrl = `${pollyEnv.baseV2Api}/workspaces/${projectId}/runs/${runId}/compute-app-sessions/logs/${logId}${ nextToken ? '?next_token=' + nextToken : ''}`;
    let logReturn = await axios.get(logUrl, await pollyHeader.getV2Headers());
    if(!logReturn.data) {
      process.exit(0)
    }
    logReturn = logReturn.data.data.attributes;
    return logReturn
  } catch (error) {
    pollyError("Not able to get the logs")
  }
}

export async function getAppLogs(projectId, runId, logId, mode = 'all') {
  let returnData = [];
  if (mode == 'latest') {
    returnData.push(await getAppLog(projectId, runId, logId, nextToken));
  } else if (mode  == 'all') {
    let nextToken = null; 
    do {
      const tempLog = await getAppLog(projectId, runId, logId, nextToken);
      returnData.push(tempLog);
      nextToken = tempLog.next_token;
    } while (nextToken);
  }
  for (let logData of returnData) {
    let tempLogData = await axios.get(logData.log_signed_url);
    tempLogData = tempLogData.data
    console.log(tempLogData)
  }
  return returnData;
}

export async function getJobLogs(projectId, jobId, mode = 'all') {
  let returndata = [];
  if (mode == 'latest') {
    returndata.push(await getJobLog(projectId, jobId));
  } else if (mode  == 'all') {
    let nextToken = null; 
    do {
      const templog = await getJobLog(projectId, jobId, nextToken);
      returndata.push(templog);
      nextToken = templog.next_token;
    } while (nextToken);
  }

  let config = {
    responseType: 'arraybuffer'
  };
  
  for (let logData of returndata) {
    let templogData = await axios.get(logData.log_signed_url, config);
    templogData = templogData.data
    console.log(templogData.toString())
  }
  return returndata;
}