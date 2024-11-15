const mysql=require("mysql2")

const ntuaflix = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ntuaflix',
})

ntuaflix.getConnection((err) => {
    if (err){
        console.log("error!")
    }
    console.log("Connected!")
    sql="SELECT * FROM media";
    ntuaflix.query(sql,(err,result) => {
        if (err){
            throw err
        }
        console.log(result);
    })
})

/*
ntuaflix.getConnection(function(err,connection){
    console.log("connected!");
    const result = ntuaflix.query("SELECT * FROM media")
    console.log(result)
})
*/
//const result = await ntuaflix.query("SELECT * FROM media")

//console.log(result)