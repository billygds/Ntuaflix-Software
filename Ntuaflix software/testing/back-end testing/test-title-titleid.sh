#!/bin/bash
echo "The following will be several tests upon the functionality of /title/:titleid enpoint"

echo "Case: Valid title id,should return valid result"
curl --location 'http://localhost:9876/ntuaflix_api/title/tt0015414'

#change line
echo -e "\n"

echo "Case: Different Valid title id,should return valid result"
curl --location 'http://localhost:9876/ntuaflix_api/title/tt0059900'

echo -e "\n"

echo "Case: Non-valid title id,should return empty response"
curl --location 'http://localhost:9876/ntuaflix_api/title/tt1111111'

