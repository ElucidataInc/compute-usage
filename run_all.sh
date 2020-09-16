#!/bin/bash
# Starting a Polly job
# And this adds the output to a file called startme.txt
mkdir -p ./output/
polly jobs submit --workspace-id 5803 --job-file $(pwd)/pollyjobs.json > startme.txt
# Seeing the status
cat startme.txt
# checking if the job is been successfully submited ot not
# If error in submission exit with status 1
# If submitted successfully check the status of the job in regular intervals
SUCCESS_ERROR_INSTART=$(cat startme.txt | grep "Success:")
if [ "$SUCCESS_ERROR_INSTART" == "" ]; then
    echo "Error occured while starting the job"
    exit 1
else
    echo "JOB launched"
fi

# Checking the status of the job at regular intervals
while [ true ]
do
    # Getting the status command from the list of the commands that is given by the status
    STATUS=$(cat startme.txt | grep "status" | cut -d : -f 2)
    # excuting the command to check the status
    $STATUS > status.txt
    # showing the status
    # checking if the status is success or error
    POLLY_SUCC=$(cat status.txt | grep "SUCCESS" || true)
    POLLY_ERR=$(cat status.txt | grep "ERROR" || true)
    #If not error showing message as running else exit with status 1
    if [ "$POLLY_ERR" == "" ]; then
        echo "RUNNING"
    else
        echo "Error occured while running the job"
        rm ./startme.txt
        rm ./status.txt
        exit 1
    fi
    # If success exiting with status 0
    if [ "$POLLY_SUCC" == "" ]; then
        echo "RUNNING"
    else
        # On exit showing the logs
        POLLY_LOGS=$(cat startme.txt | grep "logs" | cut -d : -f 2)
        POD_LOGS=$($POLLY_LOGS)
        echo $POD_LOGS
        while [ "$POD_LOGS" == "" ]
        do 
            echo "Collecting logs"
            sleep 10
            POD_LOGS=$($POLLY_LOGS)
        done
        sleep 10
        FILE_NAME=$(date +%s%N | cut -b1-13)
        POLLY_LOGS_FINAL=$($POLLY_LOGS > ./output/${FILE_NAME}.json)
        cat ./output/${FILE_NAME}.json
        echo -e "$(cat ./template1)\n var completeData = $(cat ./output/${FILE_NAME}.json)\n$(cat ./template2)" > ./output/$FILE_NAME.html
        echo "SUCCESS"
        rm ./startme.txt
        rm ./status.txt
        exit 0
    fi
    # If the job is running waiting for 10 seconds before next status check
    sleep 10
done