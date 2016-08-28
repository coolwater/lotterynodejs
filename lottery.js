var express = require('express');
var app = express();
var fs = require("fs");

var bodyParser = require('body-parser');
var multer = require('multer');

// create parser for 'application/x-www-form-urlencoded' content
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(express.static('public'));

// constants
var MEGABASKET_SIZE = 15;
var BALLBASKET_SIZE = 75;

// Returns a random integer between min and max

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// classes
var MegaBallBasket = function() {
    var numDrawn = 0;
    var megaballs = new Array(MEGABASKET_SIZE);
    
    // initialize basket with balls
    this.reset = function() {
        for (var j=0; j<MEGABASKET_SIZE;j++) 
            megaballs[j] = j+1;
    }
    
    this.draw = function() {
        var basketSize = MEGABASKET_SIZE - numDrawn;
        var randIdx = getRandomInt(0, basketSize-1);
        
        for (var i=0; i<MEGABASKET_SIZE;i++) {
            if (megaballs[i] === -1)
                continue;
                
            if (megaballs[i] != -1 && randIdx === 0) {
                numDrawn++;
                var drawnBall = megaballs[i];
                megaballs[i] = -1;
                return drawnBall;
            } else {
                randIdx--;
            }
        }
        console.log("MegaBallBasket: ERROR no megaball selected this time***");
    }
}

var BallBasket = function() {
    var numDrawn = 0;
    var balls = new Array(BALLBASKET_SIZE);
    
    // initialize basket with balls
    this.reset = function() {
        for (var j=0; j<BALLBASKET_SIZE; j++)
            balls[j] = j+1;
    }
    
    this.draw = function() {
        var basketSize = BALLBASKET_SIZE - numDrawn;
        var randIdx = getRandomInt(0, basketSize-1);
        
        for (var i=0; i<BALLBASKET_SIZE; i++) {
            if (balls[i] === -1) 
                continue;
            
            if (balls[i] != -1 && randIdx === 0) {
                numDrawn++;
                var drawnBall = balls[i];
                balls[i] = -1;
                return drawnBall;
            } else {
                randIdx--;
            }
        }
        console.log("BallBasket: ERROR no ball selected this time");
    }
}

var Lottery = function() {
    this.draw = function(ticket, resp) {
        var bb = new BallBasket();
        var mbb = new MegaBallBasket();
        
        // reset the ball basket
        bb.reset();
        mbb.reset();
        
        // draw a ticket
        resp.tickets[ticket-1] = {
            number: ticket,
            balls: [ bb.draw(), bb.draw(), bb.draw(), bb.draw(), bb.draw() ],
            mball: mbb.draw()
        }

        return resp;
    }
}

// web methods
app.get('/lottery.html', function (req, res) {
    res.sendFile(__dirname + "/" + "lottery.html");
})

app.post('/numtickets', urlencodedParser, function (req, res) {
    
    var numtickets = req.body.numtickets;
    var mesg = 'Thanks for requesting ' + numtickets + ' MegaMillion Tickets';
    console.log(mesg);
    
    response = {
        message: mesg,
        numtickets: numtickets,
        tickets: new Array(numtickets)
    };
    
    var lottery = new Lottery();
    // generate 'n' lottery tickets requested
    for (var i=0; i<numtickets; i++) {
        lottery.draw(i+1, response);
    }
    res.status(200).end(JSON.stringify(response));
})

// server main
var server = app.listen(8081, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("MegaMillions app listening at http://%s:%s/lottery.html", host, port);
})

