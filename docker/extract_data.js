const fs = require('fs')
const data  = fs.readFileSync('./temp_data.txt').toString();
const allPodData  = fs.readFileSync('./all_pods.txt').toString();
const resourceUsage = data.split('Allocated resources:')[1].split('Events:')[0];
const podsRunning = data.split('Non-terminated Pods:')[1].split('Allocated resources:')[0];
const allPod = allPodData.split('AGE')[1];
let cpu = null;
let memory = null;
let rawdata = fs.readFileSync('final_data.json');
let finalObj = JSON.parse(rawdata);
let podTimes = {}
allPod.split('\n').forEach((value, index) => {
    const valueSplit = value.split(' ').filter((a) => a);
    if(valueSplit.length > 0) {
        podTimes[valueSplit[0]] = valueSplit[valueSplit.length - 1];
    }
});
resourceUsage.split('\n').forEach((value, index) => {
    if (value.indexOf('cpu') > -1) {
        cpu = value
    }
    if (value.indexOf('memory') > -1) {
        memory = value
    }
});
const cpuSplit = cpu.split(' ').filter((a) => a);
const memorySplit = memory.split(' ').filter((a) => a);
finalObj[process.argv[2]] = {
    cpu: {raw: {'Requests': cpuSplit[1], 'Limits': cpuSplit[3]}, percent: {'Requests': cpuSplit[2], 'Limits': cpuSplit[4]}},
    memory: {raw: {'Requests': memorySplit[1], 'Limits': memorySplit[3]}, percent: {'Requests': memorySplit[2], 'Limits': memorySplit[4]}}
}

if (Object.keys(finalObj[process.argv[2]]).indexOf('pods') < 0) {
    finalObj[process.argv[2]]['pods'] = {};
}

podsRunning.split('\n').forEach((value, index) => {
    if (value.indexOf('compute-prod') > -1) {
        const newVal = value.split(' ').filter((a) => a);
        const podObj = {
            cpu: {raw: {'Requests': newVal[2], 'Limits': newVal[4]}, percent: {'Requests': newVal[3], 'Limits': newVal[5]}},
            memory: {raw: {'Requests': newVal[6], 'Limits': newVal[8]}, percent: {'Requests': newVal[7], 'Limits': newVal[9]}},
            time: podTimes[newVal[1]]
        }
        finalObj[process.argv[2]]['pods'][newVal[1]] = podObj;
    }
});
fs.writeFileSync('./final_data.json', JSON.stringify(finalObj, null, '  '));
