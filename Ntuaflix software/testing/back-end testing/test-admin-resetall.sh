#!/bin/bash
echo "The following will be several tests upon the functionality of /resetall enpoint.No parameters are allowed."

echo "Case: DB presumably full of data.Should return valid result"
curl -X POST http://localhost:9876/ntuaflix_api/admin/resetall

echo -e "\n"

echo "Case: Running on empty db.Should return valid result"
curl -X POST http://localhost:9876/ntuaflix_api/admin/resetall