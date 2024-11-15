#!/bin/bash
echo "The following will be several tests upon the functionality of /searchtitle enpoint"

echo "Case: Valid parameters,should return valid result"
curl -X POST http://localhost:9876/ntuaflix_api/searchtitle \
    -H "Content-Type: application/json"\
    -d '{"titlepart" : "part"}'

#change line
echo -e "\n"

echo "Case: Different Valid parameters,should return valid result"
curl -X POST http://localhost:9876/ntuaflix_api/searchtitle \
    -H "Content-Type: application/json"\
    -d '{"titlepart" : "work"}'

echo -e "\n"

echo "Case: Non-valid parameters,should return empty response"
curl -X POST http://localhost:9876/ntuaflix_api/searchtitle \
    -H "Content-Type: application/json"\
    -d '{"titlepart" : "asadasdadsdasdadasd"}'

echo -e "\n"

echo "Case: wrong syntax,should show proper syntax"
curl -X POST http://localhost:9876/ntuaflix_api/searchtitle \
    -H "Content-Type: application/json"\
    -d '{"part of title" : "work"}'

echo -e "\n"

echo "Case: wrong syntax,should show proper syntax"
curl -X POST http://localhost:9876/ntuaflix_api/searchtitle \
    -H "Content-Type: application/json"\
    -d '{"titlepart " : "work"}'