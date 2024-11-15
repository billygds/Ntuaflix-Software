#!/bin/bash
echo "The following will be several tests upon the functionality of /bestofgenre enpoint,which is the endpoint for Use Case 1"
echo -e "\n"
echo "Case: Valid parameters,should return valid result"
curl -X POST http://localhost:9876/ntuaflix_api/bestofgenre \
    -H "Content-Type: application/json"\
    -d '{"qgenre" : "Drama","amount" : 3}'

#change line
echo -e "\n"

echo "Case: Different Valid parameters,should return valid result"
curl -X POST http://localhost:9876/ntuaflix_api/bestofgenre \
    -H "Content-Type: application/json"\
    -d '{"qgenre" : "Comedy","amount" : 5}'

echo -e "\n"

echo "Case: Non-valid parameters,should return empty response"
curl -X POST http://localhost:9876/ntuaflix_api/bestofgenre \
    -H "Content-Type: application/json"\
    -d '{"qgenre" : "Comedy and drama and all i like","amount" : 5}'

echo -e "\n"

echo "Case: wrong syntax,should show proper syntax"
curl -X POST http://localhost:9876/ntuaflix_api/bestofgenre \
    -H "Content-Type: application/json"\
    -d '{"genre to search" : "Comedy","amount" : 5}'