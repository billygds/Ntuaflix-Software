#!/usr/bin/env node
//console.log(process.argv);
/**
 * ntuaflix
 * gets an answer from ntuaflix API
 *
 * @author Vasilis Gkounths <http://localhost:9876/ntuaflix_api/title/tt0015724>
 */

const init = require('./utils/init');
const cli = require('./utils/cli');
const log = require('./utils/log');
const http = require('http'); // Import the http module
const yargs = require('yargs');
const startURL = 'http://localhost:9876/ntuaflix_api';
const input = cli.input;
const flags = cli.flags;
// Debugging output for input and flags
console.log("Input:", input);
console.log("Flags:", flags);
const { clear, debug } = flags;
const argv = yargs
    .command('title', 'Get information about a title', {
        titleId: {
            description: 'The ID of the title',
            type: 'string',
            demandOption: true,
        }
    })
    .command('searchtitle', 'Search for titles by part of their name', {
        titlepart: {
            description: 'Part of the title name to search for',
            type: 'string',
            demandOption: true,
        }
    })
    .command('name', 'Get information about a name', {
        nameId: {
            description: 'The ID of the name',
            type: 'string',
            demandOption: true,
        }
    })
    .command('searchname', 'Search for names by part of their name', {
        name: {
            description: 'Part of the name to search for',
            type: 'string',
            demandOption: true,
        }
    })
    .command('newtitles', 'Upload new titles from a file', {
        filename: {
            description: 'Name of the file containing new titles data',
            type: 'string',
            demandOption: true,
        },
		drive: {
			description: 'Which drive XAMPP is in',
            type: 'string',
            demandOption: true,
		}
    })
    .command('signin', 'Sign in to the system', {
        username: {
            description: 'Your username',
            type: 'string',
            demandOption: true,
        },
        password: {
            description: 'Your password',
            type: 'string',
            demandOption: true,
        }
    })
    .command('signup', 'Sign up for a new account', {
        username: {
            description: 'Your username',
            type: 'string',
            demandOption: true,
        },
        password: {
            description: 'Your password',
            type: 'string',
            demandOption: true,
        },
        premium: {
            description: 'Premium user status (0 or 1)',
            type: 'number',
            demandOption: true,
        }
    })
	.command('bygenre', 'Search titles by genre and rating range', {
        qgenre: {
            description: 'Genre to search for',
            type: 'string',
            demandOption: true,
        },
        minrating: {
            description: 'Minimum rating',
            type: 'number',
            demandOption: true,
        },
        from: {
            description: 'Year range start',
            type: 'number',
            demandOption: false,
        },
        to: {
            description: 'Year range end',
            type: 'number',
            demandOption: false,
        }
    })
    .help()
    .argv;

(async () => {
	init({ clear });
	input.includes(`help`) && cli.showHelp(0);
	debug && log(flags);

	switch (input[0]) {
		case 'title':
			if (flags.titleId) {
				const titleId = flags.titleId;
				const options = {
					hostname: 'localhost',
					port: 9876,
					path: `${startURL}/title/${titleId}`,
					method: 'GET'
				};
				const req = http.request(options, (res) => {
					let data = '';
					res.on('data', (chunk) => {
						data += chunk;
					});
					res.on('end', () => {
						data = JSON.parse(data);
						console.log(data);
					});
				});
				req.on('error', (error) => {
					console.error('Error:', error);
				});
				req.end();
			} else {
				console.error('Invalid command. Usage: title --titleId titleid');
			}
			break;
		case 'searchtitle':
			if (flags.titlepart) {
				const titlepart = flags.titlepart;
				const requestBody = JSON.stringify({
					titlepart: titlepart
				});
				const options = {
					hostname: 'localhost',
					port: 9876,
					path: `${startURL}/searchtitle`,
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Content-Length': Buffer.byteLength(requestBody)
					}
				};
				const req = http.request(options, (res) => {
					let data = '';
					res.on('data', (chunk) => {
						data += chunk;
					});
					res.on('end', () => {
						data = JSON.parse(data);
						console.log(data);
					});
				});
				req.on('error', (error) => {
					console.error('Error:', error);
				});
				req.write(requestBody);
				req.end();
			} else {
				console.error('Invalid command. Usage: searchtitle --titlepart titlepart');
			}
			break;

		case 'bygenre' :
			if (flags.qgenre && flags.minrating) {
					const genre_to_search = flags.qgenre;
					const min_rating = flags.minrating;
					const filter_year_from = (flags.from !== undefined) ? flags.from : ''; // Use an empty string if from is not provided
					const filter_year_to = (flags.to !== undefined) ? flags.to : ''; // Use an empty string if to is not provided
					let requestBody = "";
					if ((filter_year_from !== "") && (filter_year_to !== "")) {
						requestBody = JSON.stringify({
							qgenre: genre_to_search,
							minrating: min_rating,
							yrFROM: filter_year_from,
							yrTO: filter_year_to
						});
					}	
					else if ((filter_year_from !== "") ^ (filter_year_to !== "")) {
						console.log("wrong syntax");
						return;
					}
					else  {
						
						requestBody = JSON.stringify({
							qgenre: genre_to_search,
							minrating: min_rating,
						});
					}
			
					// Define the options for the HTTP request
					const options = {
						hostname: 'localhost',
						port: 9876,
						path: `${startURL}/bygenre`,
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'Content-Length': Buffer.byteLength(requestBody)
						}
					};
			
					// Make the HTTP request
					const req = http.request(options, (res) => {
						let data = '';
			
						// A chunk of data has been received
						res.on('data', (chunk) => {
							data += chunk;
						});
			
						// The whole response has been received
						res.on('end', () => {
							data = JSON.parse(data);
							console.log(data); // Log the response data
						});
					});
			
					// Handle errors
					req.on('error', (error) => {
						console.error('Error:', error);
					});
					req.write(requestBody);
					req.end(); // End the request
				} else {
					console.error('Invalid command. Please provide qgenre and minrating flags.');
				}
				break;

		case 'name':
			if (flags.nameId) {
				const nameId = flags.nameId;
				const options = {
					hostname: 'localhost',
					port: 9876,
					path: `${startURL}/name/${nameId}`,
					method: 'GET'
				};
				const req = http.request(options, (res) => {
					let data = '';
					res.on('data', (chunk) => {
						data += chunk;
					});
					res.on('end', () => {
						try {
							data = JSON.parse(data);
							console.log(data);
						} catch (error) {
							console.error('Error parsing JSON data:', error);
						}
					});
				});
				req.on('error', (error) => {
					console.error('Error:', error);
				});
				req.end();
			} else {
				console.error('Invalid command. Usage: name --nameId nameID');
			}
			break;


		case 'searchname':
			if (flags.name) {
				const name = flags.name;
				const requestBody = JSON.stringify({
					namepart: name
				});
				const options = {
					hostname: 'localhost',
					port: 9876,
					path: `${startURL}/searchname`,
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Content-Length': Buffer.byteLength(requestBody)
					}
				};
				const req = http.request(options, (res) => {
					let data = '';
					res.on('data', (chunk) => {
						data += chunk;
					});
					res.on('end', () => {
						try {
							data = JSON.parse(data);
							console.log(data);
						} catch (error) {
							console.error('Error parsing JSON data:', error);
						}
					});
				});
				req.on('error', (error) => {
					console.error('Error:', error);
				});
				req.write(requestBody);
				req.end();
			} else {
				console.error('Invalid command. Usage: searchname --namepart namepart');
			}
			break;






		case 'signin':
			const username = flags.username;
			const password = flags.password;

			const requestBody = JSON.stringify({
				username: username,
				password: password
			});

			const options = {
				hostname: 'localhost',
				port: 9876,
				path: `${startURL}/signin`,
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Content-Length': Buffer.byteLength(requestBody)
				}
			};

			const req = http.request(options, (res) => {
				let data = '';
				res.on('data', (chunk) => {
					data += chunk;
				});
				res.on('end', () => {
					console.log(data); // Log the response data
				});
			});

			req.on('error', (error) => {
				console.error('Error:', error);
			});

			req.write(requestBody);
			req.end();

			break;

			case 'signup':
				// Handle 'signup' command
				const newUsername = flags.username;
				const newPassword = flags.password;
				const premiumUser = flags.premium;
	
				const signupRequestBody = JSON.stringify({
					username: newUsername,
					password: newPassword,
					premium_user: premiumUser
				});
				console.log(signupRequestBody)
				const signupOptions = {
					hostname: 'localhost',
					port: 9876,
					path: `${startURL}/signup`,
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Content-Length': Buffer.byteLength(signupRequestBody)
					}
				};
	
				const signupReq = http.request(signupOptions, (res) => {
					let data = '';
					res.on('data', (chunk) => {
						data += chunk;
					});
					res.on('end', () => {
						console.log(data); // Log the response data
					});
				});
	
				signupReq.on('error', (error) => {
					console.error('Error:', error);
				});
	
				signupReq.write(signupRequestBody);
				signupReq.end();
	
				break;
	
			default:
				console.error('Invalid command.');
				break;

		case 'healthcheck':

			if (input.includes('healthcheck')) {

				const http = require('http');

				// Ορίστε τη διαδρομή για το healthcheck
				const healthcheck = 'http://localhost:9876/ntuaflix_api/admin/healthcheck';

				// Καλέστε τον server για το healthcheck
				const options = {
					hostname: 'localhost',
					port: '9876',
					path: healthcheck,
					method: 'GET',
				};

				const req = http.request(options, (res) => {
					let data = '';

					res.on('data', (chunk) => {
						data += chunk;
					});

					res.on('end', () => {
						const responseData = JSON.parse(data);
						if (responseData.status === 'OK') {
							console.log('Connection successful.');
							console.log('Connection string:', responseData.dataconnection);
						} else {
							console.log('Connection failed.');
							console.log('Connection string:', responseData.dataconnection);
						}
					});
				});

				req.on('error', (error) => {
					console.error('Error during healthcheck:', error);
				});

				req.end();
			}

		case 'resetall':
			if (input.includes('resetall')) {
				const http = require('http');

				// Ορίστε τη διεύθυνση URL για το αίτημα POST
				const url = 'http://localhost:9876/ntuaflix_api/admin/resetall';

				// Δημιουργία δεδομένων που θα σταλούν με το αίτημα POST
				const postData = '';

				// Πραγματοποίηση του αιτήματος POST
				const options = {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Content-Length': postData.length
					}
				};

				const request = http.request(url, options, (response) => {
					let data = '';

					// Λήψη των δεδομένων από την απάντηση
					response.on('data', (chunk) => {
						data += chunk;
					});

					// Ολοκλήρωση της απάντησης
					response.on('end', () => {
						const result = JSON.parse(data);
						console.log(result);
					});
				});

				// Χειρισμός σφαλμάτων αιτήματος
				request.on('error', (error) => {
					console.error(error);
				});

				// Αποστολή των δεδομένων αιτήματος
				request.write(postData);
				request.end();
			}
			break;

		case 'newtitles':
			uploadData('titlebasics')
			break;

		case 'newakas':
			uploadData('titleakas');
			break;

		case 'newnames':
			uploadData('namebasics');
			break;

		case 'newcrew':
			uploadData('titlecrew');
			break;

		case 'newepisode':
			uploadData('titleepisode');
			break;

		case 'newprincipals':
			uploadData('titleprincipals');
			break;

		case 'newratings':
			uploadData('titleratings');
			break;
	}
})();

function uploadData(table) {
	if (flags.filename) {
		const filename = flags.filename;
		const which_drive = flags.drive;
		
		// Construct the URL for the API endpoint
		const url = `${startURL}/admin/upload/` + table + `/` + which_drive;
		
		// Prepare the data to be sent in the request body
		const requestBody = JSON.stringify({
			filename: filename
		});

		// Define request options
		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Content-Length': requestBody.length
			}
		};

		// Create the request
		const request = http.request(url, options, (response) => {
			let data = '';

			// Receive data from the response
			response.on('data', (chunk) => {
				data += chunk;
			});

			// Process the response
			response.on('end', () => {
				console.log(data); // Log the response from the server
			});
		});

		// Handle errors in the request
		request.on('error', (error) => {
			console.error(error); // Log any errors that occur during the request
		});

		// Send the request with the request body
		request.write(requestBody);
		request.end();
	} else {
		console.log('Please provide the filename using the --filename flag.');
	}
}

