"use strict";

const stripAnsi = require('strip-ansi');

// ... with this middleware:
function sseMiddleware(req, res, next) {
    //console.log(" sseMiddleware is activated with " + req + " res: " + res);
    res.sseConnection = new Connection(res);
    //console.log(" res has now connection  res: " + res.sseConnection);
    next();
}
exports.sseMiddleware = sseMiddleware;
/**
 * A Connection is a simple SSE manager for 1 client.
 */
var Connection = (function () {
    function Connection(res) {
        //console.log(" sseMiddleware construct connection for response ");

        this.res = res;
    }
    Connection.prototype.setup = function () {
        //console.log("set up SSE stream for response");
        this.res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });
    };
    Connection.prototype.send = function (data) {
        if (data['_id'])
        {
            console.log("id is here");
        }
        else
        {
            data = stripAnsi(data); // remove all undesired ansi escape codes
            data = data.replace(/(\r\n)/gm,"<br>"); // remove all undesired return/line feed chars
        }
        var json_data = JSON.stringify(data);
        console.log("send event to SSE stream " + json_data);
        this.res.write("data: " + json_data + "\n\n");
    };
    return Connection;
} ());

exports.Connection = Connection;
/**
 * A Topic handles a bundle of connections with cleanup after lost connection.
 */
var Topic = (function () {
    function Topic() {
        //console.log(" constructor for Topic");

        this.connections = {};
    }
    Topic.prototype.add = function (name, conn) {
        var connections = this.connections;
        connections[name] = conn;
        //console.log(`New client connected: ${name}, the number of clients is now: ${Object.keys(connections).length}`);
        conn.res.on('close', function () {

            let key = getKeyByValue(connections, conn);
            delete connections[key];
            //console.log('Client disconnected, now: ', Object.keys(connections).length);
        });
    };
    Topic.prototype.forEach = function (cb) {
        this.connections.forEach(cb);
    };
    Topic.prototype.getConnection = function (name) {
        return this.connections[name];
    };

    return Topic;
} ());
exports.Topic = Topic;

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}
