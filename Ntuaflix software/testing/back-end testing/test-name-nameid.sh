#!/bin/bash
echo "The following will be several tests upon the functionality of /name/:nameid enpoint"

echo "Case: Valid title id,should return valid result"
curl --location 'http://localhost:9876/ntuaflix_api/name/nm0000019'

#change line
echo -e "\n"

echo "Case: Different Valid title id,should return valid result"
curl --location 'http://localhost:9876/ntuaflix_api/name/nm0000099'

echo -e "\n"

echo "Case: Non-valid title id,should return empty response"
curl --location 'http://localhost:9876/ntuaflix_api/title/tt1111111'

