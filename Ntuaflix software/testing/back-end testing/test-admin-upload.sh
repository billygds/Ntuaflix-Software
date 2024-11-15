#!/bin/bash
echo "The following will be several tests upon the functionality of /upload enpoint.For this testing purpose,it is"
echo "presumed that XAMPP is in D drive and tsv files exist within database directory"

echo "Case: upload data from titlebasics tsv file to titlebasics.Should return confirmation from server"
curl -X POST http://localhost:9876/ntuaflix_api/admin/upload/titlebasics/d \
    -H "Content-Type: application/json"\
    -d '{"filename" : "truncated_title.basics.tsv"}'

#change line
echo -e "\n"

echo "Case: upload data from namebasics tsv file to namebasics.Should return confirmation from server"
curl -X POST http://localhost:9876/ntuaflix_api/admin/upload/namebasics/d \
    -H "Content-Type: application/json"\
    -d '{"filename" : "truncated_name.basics.tsv"}'

echo -e "\n"

echo "Case: upload data from tsv file to table.Should return confirmation from server"
curl -X POST http://localhost:9876/ntuaflix_api/admin/upload/titleakas/d \
    -H "Content-Type: application/json"\
    -d '{"filename" : "truncated_title.akas.tsv"}'

echo -e "\n"

echo "Case: upload data from tsv file to table.Should return confirmation from server"
curl -X POST http://localhost:9876/ntuaflix_api/admin/upload/titlecrew/d \
    -H "Content-Type: application/json"\
    -d '{"filename" : "truncated_title.crew.tsv"}'

echo -e "\n"

echo "Case:Wrongfully upload data from titlebasics tsv file to namebasics.Should return error about header of file"
curl -X POST http://localhost:9876/ntuaflix_api/admin/upload/titlebasics/d \
    -H "Content-Type: application/json"\
    -d '{"filename" : "truncated_name.basics.tsv"}'

echo -e "\n"

echo "Case:wrong syntax,should show proper syntax"
curl -X POST http://localhost:9876/ntuaflix_api/admin/upload/titlebasics/d \
    -H "Content-Type: application/json"\
    -d '{"name of file" : "truncated_name.basics.tsv"}'

echo -e "\n"

echo "Case:wrong syntax,should show proper syntax"
curl -X POST http://localhost:9876/ntuaflix_api/admin/upload/titlewithmoviesandseries/d \
    -H "Content-Type: application/json"\
    -d '{"name of file" : "truncated_name.basics.tsv"}'

echo -e "\n"