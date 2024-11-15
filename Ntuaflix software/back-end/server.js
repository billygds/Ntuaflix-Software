const mysql=require("mysql2")
const express = require("express")
const bodyParser = require('body-parser');
const fs = require('fs');
const { table } = require("console");
const readline = require('readline');
const util = require('util');


const app = express()
app.use(bodyParser.json());

const startURL="/ntuaflix_api";
const connection_string={
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ntuaflix',
}

//Seperator between columns is '---',separator between pairs of columns is '___'
function separate_into_list(stringToSeparate) {
    let input=stringToSeparate.split("___")
    //console.log(stringToSeparate)
    for (let i=0;i<input.length;i++) {
        input[i]=input[i].split('---')
    }
    return input
}

function separate_into_list_all_commas(stringToSeparate) {
    let input=stringToSeparate.split(",")
    return input
}

//Will use this to generate unique License for each user
function generateRandomDigits(length) {
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

//These 2 objects will be used in the POST admin/upload urls:
const convert_to_table = {
    "titlebasics" : "media",
    "titleakas" : "titlesaka",
    "namebasics" : "workers",
    "titlecrew" : "crew",
    "titleepisode" : "episodes",
    "titleprincipals" : "principals",
    "titleratings" : "ratings"
}

const check_header_of_files= {
    "titlebasics" : "tconst	titleType	primaryTitle	originalTitle	isAdult	startYear	endYear	runtimeMinutes	genres	img_url_asset",
    "titleakas" : "titleId	ordering	title	region	language	types	attributes	isOriginalTitle",
    "namebasics" : "nconst	primaryName	birthYear	deathYear	primaryProfession	knownForTitles	img_url_asset",
    "titlecrew" : "tconst	directors	writers",
    "titleepisode" : "tconst	parentTconst	seasonNumber	episodeNumber",
    "titleprincipals" : "tconst	ordering	nconst	category	job	characters	img_url_asset",
    "titleratings" : "tconst	averageRating	numVotes"
}

const ntuaflix = mysql.createPool(connection_string)

ntuaflix.getConnection((err,connection) => {
    if (err){
        console.log(err)
        console.log({
            "status":"failed",
            "dataconnection":connection_string
        })
    }
    else{
        console.log("Connected!\n")
        console.log({
            "status":"OK",
            "dataconnection":connection_string
        })
    }
    connection.release()
})


app.get(startURL+"/api",(req,res) => {
    res.json({"users" : ["user1","user2","user3","user4"]})
})

//Need to properly input correct name_basics and add the required name info into result

app.get(startURL+"/title/:titleid",(req,res) => {
    const id = req.params.titleid;

    const format_type=req.query.format;

    //if "format" variable is passed and is csv
    if (format_type && format_type==='csv'){
        //return info as csv
    }
    else {
        //return info as json

        ntuaflix.getConnection((err,connection) => {
            if (err){
                console.log("error connecting to db")
                res.status(500).send()
                connection.release()
                throw err
            }
            console.log("Connected!")
            console.log("titleid to search for: " + id.toString())
            sql=`
            SELECT titleID, TitleType, titlePoster, OriginalTitleName, StartYear, EndYear, Genre, AkasInfo, PersonInfo, rating FROM
            (
                SELECT titleid as temp FROM media where media.titleID = ?
            ) as fetch_search_result
            LEFT JOIN media on fetch_search_result.temp = media.titleid
            LEFT JOIN 
            (
                SELECT titleID as temp, GROUP_CONCAT(titlesaka.title,'---',titlesaka.region SEPARATOR "___") AS AkasInfo FROM titlesaka GROUP BY temp
            ) as fetch_akas_info on fetch_search_result.temp=fetch_akas_info.temp
            LEFT JOIN
            (
                SELECT principals.titleID as temp,GROUP_CONCAT(principals.nameID,'---',workers.PrimaryName,'---',principals.category SEPARATOR '___') as PersonInfo FROM principals
                LEFT JOIN workers on principals.nameID = workers.nameID GROUP BY temp
            ) as fetch_principals_info on fetch_search_result.temp = fetch_principals_info.temp
            LEFT JOIN 
            (
                SELECT titleID as temp, GROUP_CONCAT(Rating,',',votes) as rating FROM ratings GROUP BY temp
            ) as fetch_ratings_of_media on fetch_search_result.temp = fetch_ratings_of_media.temp;`;
            ntuaflix.query(sql,[id.toString()],(err,result) => {
                if (err){
                    console.log(err)
                    res.status(500).send()
                    return connection.release()
                }

                if (result.length === 0){
                    console.log("Got Empty response from Database\nPropably no dummy data available for request")
                    res.status(204).send()
                    return connection.release()
                }
                else {
                    //The query returns an array of JSON objects,but i only have 1 result.
                    //So,i access that first
                    result=result[0]

                    //Separate into list of lists where it is required
                    if (result["Genre"] !== null) {
                        result["Genre"]=separate_into_list_all_commas(result["Genre"])
                        result["Genre"]=result["Genre"].map((nameofGenre) => ({
                            "genreTitle": nameofGenre
                        }))
                    }
                    if (result["AkasInfo"] !== null) {
                        result["AkasInfo"]=separate_into_list(result["AkasInfo"])
                        result["AkasInfo"]=result["AkasInfo"].map(([akaTitle,regionAbbrev]) => ({
                            "akaTitle": akaTitle,
                            "regionAbbrev" : regionAbbrev
                        }))
                    }
                    if (result["PersonInfo"] !== null) {
                        result["PersonInfo"]=separate_into_list(result["PersonInfo"])
                        result["PersonInfo"]=result["PersonInfo"].map(([nameID,name,category]) => ({
                            "nameID": nameID,
                            "name" : name,
                            "category" : category
                        }))
                    }
                    if (result["rating"] !== null) {
                        result["rating"] = separate_into_list_all_commas(result["rating"])

                        //The structure of mapping out different entries into the json object is different
                        //because of the result of separating into lists only by splitting by commas,instead
                        //of the other method of splititng by ___ and then by ---
                        result["rating"]={
                            "avRating": result["rating"][0],
                            "nVotes" : result["rating"][1],
                        }
                    }
                    if (result["titlePoster"] != null){
                        result["titlePoster"]=result["titlePoster"].replace("{width_variable}","w500")
                    }
                    res.send(result);
                    connection.release()
                }
                console.log("The result of the query is:")
                console.log(result)
            })
        })
    }
})

app.post(startURL+"/searchtitle",(req,res) => {
    title_to_search = ""
    error_proper_syntax_string='Input data is incorrect.Try with proper http body syntax:\n{\n    "titlepart" : "title_part_to_search"\n}'
    if (req.body.titlepart === undefined){
        console.log(error_proper_syntax_string)
        return res.status(400).send(error_proper_syntax_string)
    }
    else {
        title_to_search = req.body.titlepart.toString()
        if (title_to_search == ""){
            console.log(error_proper_syntax_string)
            return res.status(400).send(error_proper_syntax_string)
        }
    }
    const format_type=req.query.format;

    //if "format" variable is passed and is csv
    if (format_type && format_type==='csv'){
        //return info as csv
    }
    else {
        //return info as json

        ntuaflix.getConnection((err,connection) => {
            if (err){
                console.log("error connecting to db")
                res.status(500).send()
                connection.release()
                throw err
            }
            console.log("Connected!\n")
            console.log("Part of title to search for: " + title_to_search.toString() + '\n')
            sql=`
            SELECT titleID, TitleType, titlePoster, OriginalTitleName, StartYear, EndYear, Genre, AkasInfo, PersonInfo, rating FROM
            (
                SELECT titleid as temp FROM media where media.OriginalTitleName like ?
            ) as fetch_search_result
            LEFT JOIN media on fetch_search_result.temp = media.titleid
            LEFT JOIN 
            (
                SELECT titleID as temp, GROUP_CONCAT(titlesaka.title,'---',titlesaka.region SEPARATOR "___") AS AkasInfo FROM titlesaka GROUP BY temp
            ) as fetch_akas_info on fetch_search_result.temp=fetch_akas_info.temp
            LEFT JOIN
            (
                SELECT principals.titleID as temp,GROUP_CONCAT(principals.nameID,'---',workers.PrimaryName,'---',principals.category SEPARATOR '___') as PersonInfo FROM principals
                LEFT JOIN workers on principals.nameID = workers.nameID GROUP BY temp
            ) as fetch_principals_info on fetch_search_result.temp = fetch_principals_info.temp
            LEFT JOIN 
            (
                SELECT titleID as temp, GROUP_CONCAT(Rating,',',votes) as rating FROM ratings GROUP BY temp
            ) as fetch_ratings_of_media on fetch_search_result.temp = fetch_ratings_of_media.temp;`;
            
            ntuaflix.query(sql,[`%${title_to_search.toString()}%`],(err,result) => {
                if (err){
                    console.log(err)
                    res.status(500).send()
                    return connection.release()
                }

                if (result.length === 0){
                    console.log("Got Empty response from Database\nPropably no dummy data available for request")
                    res.status(204).send()
                    return connection.release()
                }
                else {
                    //Separate into list of lists where it is required
                    for (let j=0;j<result.length;j++){
                        if (result[j]["Genre"] !== null) {
                            result[j]["Genre"]=separate_into_list_all_commas(result[j]["Genre"])
                            result[j]["Genre"]=result[j]["Genre"].map((nameofGenre) => ({
                                "genreTitle": nameofGenre
                            }))
                        }
                        if (result[j]["AkasInfo"] !== null) {
                            result[j]["AkasInfo"]=separate_into_list(result[j]["AkasInfo"])
                            result[j]["AkasInfo"]=result[j]["AkasInfo"].map(([akaTitle,regionAbbrev]) => ({
                                "akaTitle": akaTitle,
                                "regionAbbrev" : regionAbbrev
                            }))
                        }
                        if (result[j]["PersonInfo"] !== null) {
                            result[j]["PersonInfo"]=separate_into_list(result[j]["PersonInfo"])
                            result[j]["PersonInfo"]=result[j]["PersonInfo"].map(([nameID,name,category]) => ({
                                "nameID": nameID,
                                "name" : name,
                                "category" : category
                            }))
                        }
                        if (result[j]["rating"] !== null) {
                            result[j]["rating"] = separate_into_list_all_commas(result[j]["rating"])

                            //The structure of mapping out different entries into the json object is different
                            //because of the result of separating into lists only by splitting by commas,instead
                            //of the other method of splititng by ___ and then by ---
                            result[j]["rating"]={
                                "avRating": result[j]["rating"][0],
                                "nVotes" : result[j]["rating"][1],
                            }
                        }
                        if (result[j]["titlePoster"] != null){
                            result[j]["titlePoster"]=result[j]["titlePoster"].replace("{width_variable}","w500")
                        }
                    }
                    res.send(result);
                    connection.release()
                }
                console.log("The result of the query is:")
                console.log(result)
            })
        })
    }
})

app.post(startURL+"/bygenre",(req,res) => {
    genre_to_search = ""
    min_rating = ""
    filter_year_from= ""
    filter_year_to= ""
    filter_with_year=false;
    error_proper_syntax_string='Input data is incorrect.Try with proper http body syntax:\n{\n   '
    + '"qgenre" : "genre_to_search",\n   "minrating" : "minimum_rating",\n   '
    + '"yrFROM" : "filter_year_from", (not required)\n   "yrTO" : "filter_year_to" (not required)\n}'

    //if the required body fields are not given,show error
    if ((req.body.qgenre === undefined)||(req.body.minrating === undefined)){
        console.log(error_proper_syntax_string)
        return res.status(400).send(error_proper_syntax_string)
    }
    else {
        genre_to_search = req.body.qgenre.toString()
        min_rating = req.body.minrating.toString()

        //if genre and minrating are given but are null
        if ((genre_to_search == "")||(min_rating == "")){
            console.log(error_proper_syntax_string)
            return res.status(400).send(error_proper_syntax_string)
        }

        //If both yrFROM and yrTO are given and are not null,use them in query
        if((req.body.yrFROM !== undefined)&&(req.body.yrTO !==undefined)){
            filter_year_from=req.body.yrFROM.toString()
            filter_year_to=req.body.yrTO.toString()

            if((filter_year_from != "")&&(filter_year_to != "")){
                //this boolean will be used to make sure year filters are used in query
                filter_with_year=true
            }
            else{
                console.log(error_proper_syntax_string)
                return res.status(400).send(error_proper_syntax_string)
            }
        }
        else{
            console.log("!!No proper yrFROM and yrTO parameters where passed,it is assumed that this is what you wanted!!")
        }
    }

    //By this point info from body is properly saved and can be used

    const format_type=req.query.format;

    //if "format" variable is passed and is csv
    if (format_type && format_type==='csv'){
        //return info as csv
    }
    else {
        //return info as json

        ntuaflix.getConnection((err,connection) => {
            if (err){
                console.log("cannot connect to db")
                res.status(500).send()
                connection.release()
                throw err
            }
            console.log("Connected!\n")
            sql=`
            SELECT titleID, TitleType, titlePoster, OriginalTitleName, StartYear, EndYear, Genre, AkasInfo, PersonInfo, rating FROM
            (
                SELECT * FROM media WHERE media.Genre LIKE ?
            ) as fetch_search_result
            LEFT JOIN 
            (
                SELECT titleID as temp, GROUP_CONCAT(titlesaka.title,'---',titlesaka.region SEPARATOR "___") AS AkasInfo FROM titlesaka GROUP BY temp
            ) as fetch_akas_info on fetch_search_result.titleID=fetch_akas_info.temp
            LEFT JOIN
            (
                SELECT principals.titleID as temp,GROUP_CONCAT(principals.nameID,'---',workers.PrimaryName,'---',principals.category SEPARATOR '___') as PersonInfo FROM principals
                LEFT JOIN workers on principals.nameID = workers.nameID GROUP BY temp
            ) as fetch_principals_info on fetch_search_result.titleID = fetch_principals_info.temp
            LEFT JOIN 
            (
                SELECT titleID as temp, GROUP_CONCAT(Rating,',',votes) as rating FROM ratings GROUP BY temp
            ) as fetch_ratings_of_media on fetch_search_result.titleID = fetch_ratings_of_media.temp WHERE Rating >= ?
            `

            sql_query_parameters=[`%${genre_to_search}%`,min_rating]

            if (filter_with_year === true){
                sql= sql + `and StartYear >= ? and (EndYear <= ? or EndYear is NULL)`
                sql_query_parameters.push(filter_year_from,filter_year_to)
            }
            //console.log(sql)
            ntuaflix.query(sql,sql_query_parameters,(err,result) => {
                if (err){
                    console.log(err)
                    res.status(500).send()
                    return connection.release()
                }

                if (result.length === 0){
                    console.log("Got Empty response from Database\nPropably no dummy data available for request")
                    res.status(204).send()
                    return connection.release()
                }
                else {
                    //Process and send result
                    for (let j=0;j<result.length;j++){
                        if (result[j]["Genre"] !== null) {
                            result[j]["Genre"]=separate_into_list_all_commas(result[j]["Genre"])
                            result[j]["Genre"]=result[j]["Genre"].map((nameofGenre) => ({
                                "genreTitle": nameofGenre
                            }))
                        }
                        if (result[j]["AkasInfo"] !== null) {
                            result[j]["AkasInfo"]=separate_into_list(result[j]["AkasInfo"])
                            result[j]["AkasInfo"]=result[j]["AkasInfo"].map(([akaTitle,regionAbbrev]) => ({
                                "akaTitle": akaTitle,
                                "regionAbbrev" : regionAbbrev
                            }))
                        }
                        if (result[j]["PersonInfo"] !== null) {
                            result[j]["PersonInfo"]=separate_into_list(result[j]["PersonInfo"])
                            result[j]["PersonInfo"]=result[j]["PersonInfo"].map(([nameID,name,category]) => ({
                                "nameID": nameID,
                                "name" : name,
                                "category" : category
                            }))
                        }
                        if (result[j]["rating"] !== null) {
                            result[j]["rating"] = separate_into_list_all_commas(result[j]["rating"])

                            //The structure of mapping out different entries into the json object is different
                            //because of the result of separating into lists only by splitting by commas,instead
                            //of the other method of splititng by ___ and then by ---
                            result[j]["rating"]={
                                "avRating": result[j]["rating"][0],
                                "nVotes" : result[j]["rating"][1],
                            }
                        }
                        if (result[j]["titlePoster"] != null){
                            result[j]["titlePoster"]=result[j]["titlePoster"].replace("{width_variable}","w500")
                        }
                    }

                    res.send(result);
                    connection.release()
                }
                console.log("The result of the query is:")
                console.log(result)
            })
        })
    }
})

app.get(startURL+"/name/:nameID",(req,res) => {
    const name_id = req.params.nameID
    
    const format_type=req.query.format;

    //if "format" variable is passed and is csv
    if (format_type && format_type==='csv'){
        //return info as csv
    }
    else {
        //return info as json

        ntuaflix.getConnection((err,connection) => {
            if (err){
                console.log("cannot connect to db")
                res.status(500).send({})
                connection.release()
                throw err
            }
            console.log("Connected!\n")
            console.log("NameID to search for: " + name_id.toString() + '\n')

            sql=`
            SELECT principals.nameID,PrimaryName as 'name', namePoster, BirthYear as birthYr,
            DeathYear as deathYr,professions as profession,GROUP_CONCAT(principals.titleID,'---',principals.category SEPARATOR '___') as nameTitles FROM
            (
                SELECT * FROM workers where workers.nameID = ?
            ) as fetch_data_of_workers_that_contains_search_input
            LEFT JOIN principals on fetch_data_of_workers_that_contains_search_input.nameID = principals.nameID GROUP BY principals.nameID;
            `

            ntuaflix.query(sql,[name_id],(err,result) => {
                if (err){
                    console.log(err)
                    res.status(500).send()
                    return connection.release()
                }

                if (result.length === 0){
                    console.log("Got Empty response from Database\nPropably no dummy data available for request")
                    res.status(204).send()
                    return connection.release()
                }
                else {
                    //Process result and send
                    result=result[0]
                    if (result["nameTitles"] !== null){
                        result["nameTitles"]=separate_into_list(result["nameTitles"])
                        result["nameTitles"]=result["nameTitles"].map(([titleID,category]) => ({
                            "titleID": titleID,
                            "category": category
                        }))
                    }
                    if (result["namePoster"] != null){
                        result["namePoster"]=result["namePoster"].replace("{width_variable}","w500")
                    }
                    res.send(result)
                    connection.release()
                }
                console.log("The result of the query is:")
                console.log(result)
            })
        })
    }
})

app.post(startURL+"/searchname",(req,res) => {
    name_to_search = ""
    error_proper_syntax_string='Input data is incorrect.Try with proper http body syntax:\n{\n    "namepart" : "title_part_to_search"\n}'
    if (req.body.namepart === undefined){
        console.log(error_proper_syntax_string)
        return res.status(400).send(error_proper_syntax_string)
    }
    else {
        name_to_search = req.body.namepart.toString()
        if (name_to_search == ""){
            console.log(error_proper_syntax_string)
            return res.status(400).send(error_proper_syntax_string)
        }
    }
    const format_type=req.query.format;

    //if "format" variable is passed and is csv
    if (format_type && format_type==='csv'){
        //return info as csv
    }
    else {
        //return info as json

        ntuaflix.getConnection((err,connection) => {
            if (err){
                console.log("error connecting to db")
                connection.release()
                throw err
            }
            console.log("Connected!\n")
            console.log("Part of name to search for: " + name_to_search.toString() + '\n')

            sql=`
            SELECT principals.nameID,PrimaryName as 'name', namePoster, BirthYear as birthYr,
            DeathYear as deathYr,professions as profession,GROUP_CONCAT(principals.titleID,'---',principals.category SEPARATOR '___') as nameTitles FROM
            (
                SELECT * FROM workers where workers.PrimaryName like ?
            ) as fetch_data_of_workers_that_contains_search_input
            LEFT JOIN principals on fetch_data_of_workers_that_contains_search_input.nameID = principals.nameID GROUP BY principals.nameID;
            `

            ntuaflix.query(sql,[`%${name_to_search.toString()}%`],(err,result) => {
                if (err){
                    console.log(err)
                    res.status(500).send()
                    return connection.release()
                }

                if (result.length === 0){
                    console.log("Got Empty response from Database\nPropably no dummy data available for request")
                    res.status(204).send()
                    return connection.release()
                }
                else {
                    //Process result and send
                    for (let j=0;j<result.length;j++){
                        if (result[j]["nameTitles"] !== null){
                            result[j]["nameTitles"]=separate_into_list(result[j]["nameTitles"])
                            result[j]["nameTitles"]=result[j]["nameTitles"].map(([titleID,category]) => ({
                                "titleID": titleID,
                                "category": category
                            }))
                        }
                        if (result[j]["namePoster"] != null){
                            result[j]["namePoster"]=result[j]["namePoster"].replace("{width_variable}","w500")
                        }
                    }
                    res.send(result)
                    connection.release()
                }
                console.log("The result of the query is:")
                return console.log(result)
            })
        })
    }
})

app.post(startURL+"/bestofgenre",(req,res) => {
    genre_to_search = ""
    amount = ""
    error_proper_syntax_string='Input data is incorrect.Try with proper http body syntax:\n{\n   '
    + '"qgenre" : "genre_to_search",\n   "amount" : N_to_display\n}'

    //if the required body fields are not given,show error
    if ((req.body.qgenre === undefined)||(req.body.amount === undefined)){
        console.log(error_proper_syntax_string)
        return res.status(400).send(error_proper_syntax_string)
    }
    else {
        genre_to_search = req.body.qgenre.toString()
        amount = parseInt(req.body.amount,10)

        //if genre and minrating are given but are null
        if ((genre_to_search == "")||(amount < 0)){
            console.log(error_proper_syntax_string)
            return res.status(400).send(error_proper_syntax_string)
        }
    }

    //By this point info from body is properly saved and can be used

    const format_type=req.query.format;

    //if "format" variable is passed and is csv
    if (format_type && format_type==='csv'){
        //return info as csv
    }
    else {
        //return info as json

        ntuaflix.getConnection((err,connection) => {
            if (err){
                console.log("cannot connect to db")
                res.status(500).send()
                connection.release()
                throw err
            }
            console.log("Connected!\n")
            sql=`
            SELECT titleID, TitleType, titlePoster, OriginalTitleName, StartYear, EndYear, Genre, AkasInfo, PersonInfo, rating FROM
            (
                SELECT * FROM media WHERE media.Genre LIKE ?
            ) as fetch_search_result
            LEFT JOIN 
            (
                SELECT titleID as temp, GROUP_CONCAT(titlesaka.title,'---',titlesaka.region SEPARATOR "___") AS AkasInfo FROM titlesaka GROUP BY temp
            ) as fetch_akas_info on fetch_search_result.titleID=fetch_akas_info.temp
            LEFT JOIN
            (
                SELECT principals.titleID as temp,GROUP_CONCAT(principals.nameID,'---',workers.PrimaryName,'---',principals.category SEPARATOR '___') as PersonInfo FROM principals
                LEFT JOIN workers on principals.nameID = workers.nameID GROUP BY temp
            ) as fetch_principals_info on fetch_search_result.titleID = fetch_principals_info.temp
            LEFT JOIN 
            (
                SELECT titleID as temp, GROUP_CONCAT(Rating,',',votes) as rating FROM ratings GROUP BY temp
            ) as fetch_ratings_of_media on fetch_search_result.titleID = fetch_ratings_of_media.temp ORDER BY rating DESC LIMIT ?
            `

            //console.log(sql)
            ntuaflix.query(sql,[`%${genre_to_search}%`,amount],(err,result) => {
                if (err){
                    console.log(err)
                    res.status(500).send()
                    return connection.release()
                }

                if (result.length === 0){
                    console.log("Got Empty response from Database\nPropably no dummy data available for request")
                    res.status(204).send()
                    return connection.release()
                }
                else {
                    //Process and send result
                    for (let j=0;j<result.length;j++){
                        if (result[j]["Genre"] !== null) {
                            result[j]["Genre"]=separate_into_list_all_commas(result[j]["Genre"])
                            result[j]["Genre"]=result[j]["Genre"].map((nameofGenre) => ({
                                "genreTitle": nameofGenre
                            }))
                        }
                        if (result[j]["AkasInfo"] !== null) {
                            result[j]["AkasInfo"]=separate_into_list(result[j]["AkasInfo"])
                            result[j]["AkasInfo"]=result[j]["AkasInfo"].map(([akaTitle,regionAbbrev]) => ({
                                "akaTitle": akaTitle,
                                "regionAbbrev" : regionAbbrev
                            }))
                        }
                        if (result[j]["PersonInfo"] !== null) {
                            result[j]["PersonInfo"]=separate_into_list(result[j]["PersonInfo"])
                            result[j]["PersonInfo"]=result[j]["PersonInfo"].map(([nameID,name,category]) => ({
                                "nameID": nameID,
                                "name" : name,
                                "category" : category
                            }))
                        }
                        if (result[j]["rating"] !== null) {
                            result[j]["rating"] = separate_into_list_all_commas(result[j]["rating"])

                            //The structure of mapping out different entries into the json object is different
                            //because of the result of separating into lists only by splitting by commas,instead
                            //of the other method of splititng by ___ and then by ---
                            result[j]["rating"]={
                                "avRating": result[j]["rating"][0],
                                "nVotes" : result[j]["rating"][1],
                            }
                        }
                    }

                    res.send(result);
                    connection.release()
                }
                console.log("The result of the query is:")
                console.log(result)
            })
        })
    }
})

app.post(startURL+"/editlist",(req,res) => {
    username = ""
    title_id = ""
    list_to_manipulate = ""
    add_or_remove = ""
    error_proper_syntax_string='Input data is incorrect.Try with proper http body syntax:\n{\n   "username" : "user name"\n '
    + '"titleid" : "titleid of media",\n   "list_to_manipulate" : "watchlist" or "already watched",\n  '
    + '"add_or_remove" : "add" or "remove"\n}'

    //if the required body fields are not given,show error
    if ((req.body.username === undefined)||(req.body.titleid === undefined)||(req.body.list_to_manipulate === undefined)||(req.body.add_or_remove === undefined)){
        console.log(error_proper_syntax_string)
        return res.status(400).send(error_proper_syntax_string)
    }
    else {
        username = req.body.username.toString()
        title_id = req.body.titleid.toString()
        list_to_manipulate = req.body.list_to_manipulate.toString()
        add_or_remove = req.body.add_or_remove

        //if given but are null
        if ((username == "")||(title_id == "")||(list_to_manipulate == "")){
            console.log(error_proper_syntax_string)
            return res.status(400).send(error_proper_syntax_string)
        }
        //if add_or_remove or watchlist parameters are not correct
        else if (((add_or_remove != "add")&&(add_or_remove != "remove"))||((list_to_manipulate != "watchlist")&&(list_to_manipulate != "already watched"))) {
            console.log(error_proper_syntax_string)
            return res.status(400).send(error_proper_syntax_string)
        }
    }

    //By this point info from body is properly saved and can be used

    //convert list parameter to sql table column and add_or_remove parameter to corresponding query
    list_to_manipulate = (list_to_manipulate == "watchlist") ? "Watchlist" : "AlreadyWatched"
    //add_or_remove = (add_or_remove == "add") ? :

    const format_type=req.query.format;

    //if "format" variable is passed and is csv
    if (format_type && format_type==='csv'){
        //return info as csv
    }
    else {
        //return info as json

        ntuaflix.getConnection((err,connection) => {
            if (err){
                console.log("cannot connect to db")
                res.status(500).send()
                connection.release()
                throw err
            }
            console.log("Connected!\n")
            //depending on which list to modify,assign corresponding query
            sql= (list_to_manipulate == "Watchlist") ? "SELECT Watchlist FROM users where username = ?" : "SELECT AlreadyWatched FROM users where username = ?"
            ntuaflix.query(sql,[username],(err,result) => {
                if (err){
                    console.log(err)
                    res.status(500).send()
                    return connection.release()
                }

                if (result.length === 0){
                    console.log("Got Empty response from Database\nPropably no dummy data available for request")
                    res.status(204).send()
                    return connection.release()
                }
                else {
                    //Process the result to modify the list
                    result = (list_to_manipulate == "Watchlist") ? result[0]["Watchlist"] : result[0]["AlreadyWatched"]
                    console.log(result)
                    //depending on which list to modify,assign corresponding query
                    sql2 = (list_to_manipulate == "Watchlist") ? "UPDATE users SET Watchlist = ? where username = ?" : "UPDATE users SET AlreadyWatched = ? where username = ?"
                    if (add_or_remove == "add"){
                        //modify list part if add
                        result = (result == null) ? title_id : result + ',' + title_id
                    }
                    else{
                        //modify list part if remove
                        if(result == null) {
                            console.log("Incorrect use of endpoint.Cannot remove titleID that doesn't exist in list")
                            res.send("Incorrect use of endpoint.Cannot remove titleID that doesn't exist in list")
                            connection.release()
                        }
                        else{
                            //triggers if not only or last value in list
                            if (result.includes(title_id + ',')){
                                result=result.replace(title_id + ',','')
                            }
                            //triggers if only or last value in list
                            else if(result.includes(title_id)){
                                //if last value,set to null.Else,remove from end of list
                                result = (result == title_id) ? null : result.replace(',' + title_id,'')
                            }
                            //triggers if endpoint is used incorrectly
                            else{
                                console.log("Incorrect use of endpoint.Cannot remove titleID that doesn't exist in list")
                                res.send("Incorrect use of endpoint.Cannot remove titleID that doesn't exist in list")
                                connection.release()
                            }
                        }
                    }
                    //execute query part
                    ntuaflix.query(sql2,[result,username],(err,result2) => {
                        if (err){
                            console.log(err)
                            res.status(500).send()
                            return connection.release()
                        }
                        else {
                            console.log(result2)
                            res.send()
                            connection.release()
                        }
                    })
                }
                console.log("The result of the query is:")
                console.log(result)
            })
        })
    }
})

app.get(startURL+"/fetchlists/:username",(req,res) => {
    user_username = req.params.username.toString()
    
    const format_type=req.query.format;

    //if "format" variable is passed and is csv
    if (format_type && format_type==='csv'){
        //return info as csv
    }
    else {
        //return info as json

        ntuaflix.getConnection((err,connection) => {
            if (err){
                console.log("error connecting to db")
                res.status(500).send()
                connection.release()
                throw err
            }
            console.log("Connected!\n")
            sql=`
            SELECT Watchlist,AlreadyWatched from users where username = ?
            `
            ntuaflix.query(sql,[user_username],(err,result) => {
                if (err){
                    console.log(err)
                    res.status(500).send()
                    return connection.release()
                }

                if (result.length === 0){
                    console.log("Got Empty response from Database\nPropably no dummy data available for request")
                    res.status(204).send()
                    return connection.release()
                }
                else {
                    //Process and send result
                    result=result[0]
                    if (result["Watchlist"] != null) result["Watchlist"]=separate_into_list_all_commas(result["Watchlist"])
                    if (result["AlreadyWatched"] != null) result["AlreadyWatched"]=separate_into_list_all_commas(result["AlreadyWatched"])
                    res.send(result);
                    connection.release()
                }
                console.log("This is the fetched data of the user:")
                console.log(result)
            })
        })
    }
})

app.post(startURL+"/signin",(req,res) => {
    let user_username = ""
    let user_password = ""
    error_proper_syntax_string='Input data is incorrect.Try with proper http body syntax:\n{\n    "username" : "user name"\n    "password" : "user password"\n}'
    if ((req.body.username === undefined)||(req.body.password === undefined)){
        console.log(error_proper_syntax_string)
        return res.status(400).send(error_proper_syntax_string)
    }
    else {
        user_username = req.body.username.toString()
        user_password = req.body.password.toString()
        if ((user_username == "")||(user_password == "")){
            console.log(error_proper_syntax_string)
            return res.status(400).send(error_proper_syntax_string)
        }
    }
    const format_type=req.query.format;

    //if "format" variable is passed and is csv
    if (format_type && format_type==='csv'){
        //return info as csv
    }
    else {
        //return info as json

        ntuaflix.getConnection((err,connection) => {
            if (err){
                console.log("error connecting to db")
                res.status(500).send()
                connection.release()
                throw err
            }
            console.log("Connected!\n")
            sql=`
            SELECT License from users where username = ? and Password_ = ?
            `
            ntuaflix.query(sql,[user_username,user_password],(err,result) => {
                if (err){
                    console.log(err)
                    res.status(500).send()
                    return connection.release()
                }

                if (result.length === 0){
                    console.log("Credentials failed to authenticate")
                    res.status(401).send()
                    return connection.release()
                }
                else {
                    //Separate into list of lists where it is required
                    result=result[0]
                    console.log("user's license: " + result["License"])
                    res.status(200).send((result["License"] === '000000000') ? '0' : '1');
                    console.log((result["License"] === '000000000') ? "User Doesn't have premium access" : "User has premium access")
                    connection.release()
                }
                console.log("This user exists in the database and their credentials have been validated")
            })
        })
    }
})

app.post(startURL+"/signup",(req,res) => {
    let new_username = ""
    let new_password = ""
    let new_license = Boolean(0)
    error_proper_syntax_string='Input data is incorrect.Try with proper http body syntax:\n{\n    "username" : "new user name",\n    "password" : "new user password",\n  "premium_user" : 0 or 1\n}'
    if ((req.body.premium_user === undefined)||(req.body.username === undefined)||(req.body.password === undefined)){
        console.log(error_proper_syntax_string)
        return res.status(400).send(error_proper_syntax_string)
    }
    else {
        new_username = req.body.username.toString()
        new_password = req.body.password.toString()
        new_license = Boolean(req.body.premium_user) ? generateRandomDigits(9) : '000000000'
        if ((new_username == "")||(new_password == "")){
            console.log(error_proper_syntax_string)
            return res.status(400).send(error_proper_syntax_string)
        }
    }
    const format_type=req.query.format;

    //if "format" variable is passed and is csv
    if (format_type && format_type==='csv'){
        //return info as csv
    }
    else {
        //return info as json

        ntuaflix.getConnection((err,connection) => {
            if (err){
                console.log("error connecting to db")
                res.status(500).send()
                connection.release()
                throw err
            }
            console.log("Connected!\n")
            sql=`
            INSERT INTO users (username,Password_,RegisterDate,License) VALUES (?,?,CURRENT_DATE(),?);
            `
            ntuaflix.query(sql,[new_username,new_password,new_license],(err,result) => {
                if (err){
                    console.log(err)
                    //Send specific error message if trying to sign up with existing username
                    if (err.code === "ER_DUP_ENTRY"){
                        res.status(400).send("Username already exists")
                        return connection.release()
                    }
                    res.status(500).send()
                    return connection.release()
                }

                if (result.length === 0){
                    console.log("Got Empty response from Database\nPropably no dummy data available for request")
                    res.status(204).send()
                    return connection.release()
                }
                else {
                    //Separate into list of lists where it is required
                    res.send("A new account has been created with the information you have given!");
                    connection.release()
                }
                console.log("A new account has been created with the information you have given!")
            })
        })
    }
})

app.get(startURL+"/admin/users/:username",(req,res) => {
    user_username = req.params.username.toString()
    
    const format_type=req.query.format;

    //if "format" variable is passed and is csv
    if (format_type && format_type==='csv'){
        //return info as csv
    }
    else {
        //return info as json

        ntuaflix.getConnection((err,connection) => {
            if (err){
                console.log("error connecting to db")
                res.status(500).send()
                connection.release()
                throw err
            }
            console.log("Connected!\n")
            sql=`
            SELECT * from users where username = ?
            `
            ntuaflix.query(sql,[user_username],(err,result) => {
                if (err){
                    console.log(err)
                    res.status(500).send()
                    return connection.release()
                }

                if (result.length === 0){
                    console.log("Got Empty response from Database\nPropably no dummy data available for request")
                    res.status(204).send()
                    return connection.release()
                }
                else {
                    //Process and send result
                    result=result[0]
                    if (result["Watchlist"] != null) result["Watchlist"]=separate_into_list_all_commas(result["Watchlist"])
                    if (result["AlreadyWatched"] != null) result["AlreadyWatched"]=separate_into_list_all_commas(result["AlreadyWatched"])
                    res.send(result);
                    connection.release()
                }
                console.log("This is the fetched data of the user:")
                console.log(result)
            })
        })
    }
})

app.get(startURL+"/admin/healthcheck",(req,res) => {
    ntuaflix.getConnection((err,connection) => {
        if (err){
            console.log("error connecting to db")
            res.send({
                "status":"failed",
                "dataconnection":connection_string
            })
            return connection.release()
        }
        else{
            console.log("Connected!\n")
            res.send({
                "status":"OK",
                "dataconnection":connection_string
            })
            return connection.release()
        }
    })
})

app.post(startURL+"/admin/resetall",async (req,res) => {
    ntuaflix.getConnection(async (err,connection) => {
        if (err){
            console.log("error connecting to database")
            connection.release()
            throw err
        }

        //With these 2 lines,i can await the execution of any query by using queryAsync
        connection = await util.promisify(ntuaflix.getConnection).bind(ntuaflix)();
        const queryAsync = await util.promisify(connection.query).bind(connection);

        console.log("Connected!")
        list_of_queries=[
            "DELETE FROM users;",
            "DELETE FROM crew;",
            "DELETE FROM episodes;",
            "DELETE FROM principals;",
            "DELETE FROM ratings;",
            "DELETE FROM titlesaka;",
            "DELETE FROM workers;",
            "DELETE FROM media;",
        ]
        
        //Changed format of executing queries with the try and catch method
        //This way,these simple queries can be executed asynchronously
        for (let i = 0;i < list_of_queries.length;i++) {
            console.log(list_of_queries[i])
            try {
                await queryAsync(list_of_queries[i])
            } catch (error) {
                console.log(err)
                res.send({
                    "status" : "failed",
                    "reason" : err
                })
                return connection.release()
            }
        }

        //These are not put into the query list because for some reason they are not executed
        //in the correct order.I have no idea why
        ntuaflix.query("DELETE FROM workers;",(err,result) => {
            if (err){
                console.log(err)
                res.send({
                    "status" : "failed",
                    "reason" : err
                })
                return connection.release()
            }
        })
        ntuaflix.query("DELETE FROM media;",(err,result) => {
            if (err){
                console.log(err)
                res.send({
                    "status" : "failed",
                    "reason" : err
                })
                return connection.release()
            }
        })
        res.send({
            "status" : "OK"
        })
        connection.release()
    })
})

app.post(startURL+"/admin/upload/:which_table_to_upload/:which_drive_xampp_is",(req,res) => {
    //All the upload urls look and do the same thing.For a specific table,upload data from
    //tsv file given in the body.So,i condense each of them to one url
    console.log(req.body)

    let name_of_file = ""
    let table_to_upload_to =""
    let filepath = ""
    //check for proper filename syntax and get data of parameters
    error_syntax_titlebasics = 'Incorrect body syntax or upload url.Proper body syntax is:\n{\n    "filename" : "path_of_file.tsv"\n}'
    if ((req.body.filename === undefined)||(req.params.which_table_to_upload === undefined)){
        console.log(error_syntax_titlebasics)
        return res.send(error_syntax_titlebasics)
    }
    else {
        name_of_file = req.body.filename.toString()
        //assign the correct table which the file will be uploaded to based on this url parameter conversion:
        table_to_upload_to = req.params.which_table_to_upload.toString()
        if ((name_of_file == "")||(table_to_upload_to == "")||(!convert_to_table.hasOwnProperty(table_to_upload_to))){
            console.log(error_syntax_titlebasics)
            return res.send(error_syntax_titlebasics)
        }
    }
    if (req.params.which_drive_xampp_is === undefined){
        console.log("No parameter given for which drive XAMPP is in")
        return res.send("No parameter given for which drive XAMPP is in")
    }
    else{
        if(req.params.which_drive_xampp_is === 'c'){
            filepath="C:/xampp/mysql/data/ntuaflix/" + name_of_file
        }
        else if (req.params.which_drive_xampp_is === 'd'){
            filepath="D:/xampp/mysql/data/ntuaflix/" + name_of_file
        }
        else{
            console.log("Incorrect parameter given.It's either 'c' or 'd'")
            return res.send("No parameter given for which drive XAMPP is in")
        }
    }

    //Read the first line of the file,which i will check with the proper syntax
    //of headers for tsv data.If incorrect,show proper syntax and return

    // This is a really complex way to just read the first line of the file,which must of course
    //be the header for the tsv data

    // Create a readline interface
    const rl = readline.createInterface({
        input: fs.createReadStream(filepath),
        output: process.stdout,
        terminal: false
    });

    // Listen for the 'line' event
    rl.on('line', (line) => {
        // Process the first line and close the interface

        //Check syntax of headers of tsv file.If false,return error and terminate
        if (line !== check_header_of_files[req.params.which_table_to_upload]){
            console.log("Incorrect header of file.Correct syntax is this:\n" + check_header_of_files[req.params.which_table_to_upload])
            res.send("Incorrect header of file.Correct syntax is this:\n" + check_header_of_files[req.params.which_table_to_upload])
            rl.close();
            rl.removeAllListeners()
            return
        }
        else{
            console.log(line);
            //stop reading first line of file
            rl.close();
            rl.removeAllListeners()
        }
    });

    ntuaflix.getConnection((err,connection) => {
        if (err){
            console.log("error connecting to db")
            connection.release()
            throw err
        }
        console.log("Connected!\n")
        sql =`
        LOAD DATA INFILE ?
        INTO TABLE ${convert_to_table[table_to_upload_to]}
        FIELDS TERMINATED BY '	'
        LINES TERMINATED BY '\n'
        IGNORE 1 ROWS;
        `;
        ntuaflix.query(sql,[name_of_file],(err,result) => {
            if (err){
                console.log(err)
                res.status(500).send()
                return connection.release()
            }
            if (result.length == 0){
                console.log("Got Empty response from Database\nPropably no dummy data available for request")
                res.send("Got Empty response from Database\nPropably no dummy data available for request")
                return connection.release()
            }
            console.log("Data successfully uploaded to " + convert_to_table[table_to_upload_to])
            res.send("Data successfully uploaded to " + convert_to_table[table_to_upload_to])
            return connection.release()

        })
        connection.release()
    })
})


app.listen(9876 , () => {console.log("server started on port 9876")})