#!/bin/bash
echo "The following will be several tests upon the functionality of /bygenre enpoint"

echo "Case: Valid parameters,should return valid result"
curl -X POST http://localhost:9876/ntuaflix_api/bygenre \
    -H "Content-Type: application/json"\
    -d '{"qgenre" : "Drama","minrating" : 8.3}'

#change line
echo -e "\n"

echo "Case: Different Valid parameters,should return valid result"
curl -X POST http://localhost:9876/ntuaflix_api/bygenre \
    -H "Content-Type: application/json"\
    -d '{"qgenre" : "Drama","minrating" : 8.3,"yrFROM": 1992,"yrTO" : 2005}'

echo -e "\n"

echo "Case: Non-valid year parameters,should return empty response"
curl -X POST http://localhost:9876/ntuaflix_api/bygenre \
    -H "Content-Type: application/json"\
    -d '{"qgenre" : "Drama","minrating" : 8.3,"yrFROM": 2100,"yrTO" : 2005}'

echo -e "\n"

echo "Case: Non-valid genre parameters,should return empty response"
curl -X POST http://localhost:9876/ntuaflix_api/bygenre \
    -H "Content-Type: application/json"\
    -d '{"qgenre" : "A little bit of drama","minrating" : 8.3,"yrFROM": 1992,"yrTO" : 2005}'

echo -e "\n"

echo "Case: wrong syntax where yrFROM is declared but not yrTo,should omit yrFROM parameter"
curl -X POST http://localhost:9876/ntuaflix_api/bygenre \
    -H "Content-Type: application/json"\
    -d '{"qgenre" : "drama","minrating" : 8.3,"yrFROM": 1992}'

echo -e "\n"

echo "Case: wrong syntax,should show proper syntax"
curl -X POST http://localhost:9876/ntuaflix_api/bygenre \
    -H "Content-Type: application/json"\
    -d '{"genre to search for" : "drama","minrating" : 8.3,"yrFROM": 1992}'