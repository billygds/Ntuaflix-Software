#!/bin/bash
echo "The following will be several tests upon the functionality of /searchname enpoint"

echo "Case: Valid parameters,should return valid result"
curl -X POST http://localhost:9876/ntuaflix_api/searchname \
    -H "Content-Type: application/json"\
    -d '{"namepart" : "Claude"}'

#change line
echo -e "\n"

echo "Case: Different Valid parameters,should return valid result"
curl -X POST http://localhost:9876/ntuaflix_api/searchname \
    -H "Content-Type: application/json"\
    -d '{"namepart" : "jason"}'

echo -e "\n"

echo "Case: Non-valid parameters,should return empty response"
curl -X POST http://localhost:9876/ntuaflix_api/searchname \
    -H "Content-Type: application/json"\
    -d '{"namepart" : "asadasdadsdasdadasd"}'

echo -e "\n"

echo "Case: wrong syntax,should show proper syntax"
curl -X POST http://localhost:9876/ntuaflix_api/searchname \
    -H "Content-Type: application/json"\
    -d '{"part of title" : "work"}'

echo -e "\n"