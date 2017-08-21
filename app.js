//the child_process library let's us execute command line commands, https://nodejs.org/api/child_process.html
var exec = require('child_process').exec;
//This variable stores the command we want to execute, we are going to use the say command
var say = 'say ';

//import express 
var express = require('express');

var bodyParser = require('body-parser');

//create express object named app
var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//instantiate a server on port 3000
var server = app.listen(3000);
var io = require('socket.io')(server);

//expose the local public folder for inluding files js, css etc..
app.use(express.static('public'));

//create a bart oobject that queries the API every 5 seconds
var bart = require('bart').createClient({ "interval": 20000 });

//let's make a function that speaks
function speak(whatosay) {
    //speak the string
    exec(say + whatosay);
    //log it to the console
    console.log(whatosay)
}

//on a request to / serve index.html
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});


app.get('/payload', function(req, res) {
    res.sendStatus(200);
    console.log('get /payload');
});

app.post('/payload', function(req, res) {
    //verify that the payload is a push from the correct repo
    //verify repository.name == 'wackcoon-device' or repository.full_name = 'DanielEgan/wackcoon-device'
    console.log(req.body.pusher.name + ' just pushed to ' + req.body.repository.name);

    console.log('pulling code from GitHub...');

    // reset any changes that have been made locally
    exec('git -C ~/node_bart_express reset --hard', execCallback);

    // and ditch any files that have been added locally too
    exec('git -C ~/node_bart_express clean -df', execCallback);

    // now pull down the latest
    exec('git -C ~/node_bart_express pull -f', execCallback);

    // and npm install with --production
    exec('npm -C ~/node_bart_express install --production', execCallback);

    // and run tsc
    exec('tsc', execCallback);
});

function queryBart() {
    //choose which bart staion to to monitor, station abbreviations are here: http://api.bart.gov/docs/overview/abbrev.aspx
    bart.on('powl', function(estimates) {
        //log the results to the console
        // console.log(estimates);


        // store the results in some variables
        var nextTrainNorth = "next train in " + estimates[0].minutes;
        var destSouth = "Dest: " + estimates[0].destination;
        io.sockets.emit('mysocket', nextTrainNorth + " minutes" + " destination is " + estimates[5].destination + " Direction is " + estimates[5].direction);
        // call the function
        speak(nextTrainNorth + " minutes" + " destination is " + estimates[5].destination + " Direction is " + estimates[5].direction);
    }, 1000);
}

queryBart();