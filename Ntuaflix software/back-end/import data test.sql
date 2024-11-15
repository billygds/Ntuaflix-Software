LOAD DATA INFILE 'truncated_title.basics.tsv'
INTO TABLE media
FIELDS TERMINATED BY '	'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA INFILE 'truncated_title.akas.tsv'
INTO TABLE titlesaka
FIELDS TERMINATED BY '	'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA INFILE 'truncated_name.basics.tsv'
INTO TABLE workers
FIELDS TERMINATED BY '	'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA INFILE 'truncated_title.crew.tsv'
INTO TABLE crew
FIELDS TERMINATED BY '	'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA INFILE 'truncated_title.principals.tsv'
INTO TABLE principals
FIELDS TERMINATED BY '	'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA INFILE 'truncated_title.ratings.tsv'
INTO TABLE ratings
FIELDS TERMINATED BY '	'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA INFILE 'truncated_title.episode.tsv'
INTO TABLE episodes
FIELDS TERMINATED BY '	'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

INSERT INTO users (username,Password_,RegisterDate,License) VALUES ('Michael','1',CURRENT_DATE(),'1234509876');
INSERT INTO users (username,Password_,RegisterDate,License,Watchlist) VALUES ('Janlio','1',CURRENT_DATE(),'1234512345','tt0095290');
INSERT INTO users (username,Password_,RegisterDate,License,AlreadyWatched) VALUES ('Vasilihs','1',CURRENT_DATE(),'1234509476','tt0096752');
INSERT INTO users (username,Password_,RegisterDate,License,AlreadyWatched) VALUES ('Rhett','1',CURRENT_DATE(),'1930509476','tt0095290,tt0096752');

SELECT * FROM crew;
SELECT * FROM episodes;
SELECT * FROM media;
SELECT * FROM principals;
SELECT * FROM ratings;
SELECT * FROM titlesaka;
SELECT * FROM users;
SELECT * FROM workers;
