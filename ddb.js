var AWSdb = require('aws-sdk');

const { v4: uuidv4 } = require('uuid');

module.exports.initdb = initdb;
module.exports.querydb = querydb;
module.exports.getdb = getdb;
module.exports.putdb = putdb;
module.exports.putdbRooms = putdbRooms;
module.exports.getdbRooms = getdbRooms;


AWSdb.config.update({
    region: "us-west-2",
    endpoint: "http://dynamodb.us-west-2.amazonaws.com",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN
});
function initdb(){

    var dynamodb = new AWSdb.DynamoDB();

    var params = {
        TableName : "AlexaSkillHackathon",
        KeySchema: [
            { AttributeName: "FirstName", KeyType: "HASH"},  //Partition key
            { AttributeName: "LastName", KeyType: "RANGE" },

        ],
        AttributeDefinitions: [
            { AttributeName: "FirstName", AttributeType: "S" },
            { AttributeName: "LastName", AttributeType: "S" },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
        },
    };

    // TableName : "Rooms",
    //         KeySchema: [
    //             { AttributeName: "RoomName", KeyType: "HASH"},  //Partition key
    //         ],
    //         AttributeDefinitions: [
    //             { AttributeName: "RoomName", AttributeType: "S" },
    //         ],
    //         ProvisionedThroughput: {
    //             ReadCapacityUnits: 1,
    //             WriteCapacityUnits: 1
    //         }

    dynamodb.createTable(params, function(err, data) {
        if (err) {
            console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
}

function querydb(table, docClient, render){

    var params = {
        TableName: table,
    };
    docClient.query(params, onquery);

    function onquery(err, data) {
        if (err) {
            console.error("Unable to query the table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            // console.log(data.Items);
            render(data);
        }
    }
}


function getdb(table, pid, docClient, callback, user_id, context){
    var params = {
        TableName: table,
        Key:{
            "FirstName": pid.split(" ")[0],
            "LastName": pid.split(" ")[1]
        }
    };

    console.log(params);

    docClient.get(params, function(err, data) {
        if (err) {
            callback(null, null, null);
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            callback(data.Item.RoomName, pid, user_id, context);
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
        }
    });
}

function getdbRooms(table, chatName, docClient, callback){
    var params = {
        TableName: table,
        Key:{
            "RoomName": chatName
        }
    };

    console.log(params);

    docClient.get(params, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            callback(data);
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
        }
    });
}

function putdb(table, chatName, fname, lname, docClient, render){
    // if (typeof variable == 'undefined') {
    //     id = uuidv4();
    //     modified_id = id;
    // }
    // console.log(id + " " + modified_id);
    var params = {
        TableName:table,
        Item:{
            "FirstName": fname,
            "LastName": lname,
            "RoomName": chatName,
        }
    };

    console.log("Adding a new item...");
    docClient.put(params, function(err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            render(null);
        }
        else{
            render(true);
            console.log("Added item:", JSON.stringify(data, null, 2));
        }

    });
}

function putdbRooms(table, chatName, chatCode, docClient){
    // if (typeof variable == 'undefined') {
    //     id = uuidv4();
    //     modified_id = id;
    // }
    // console.log(id + " " + modified_id);
    var params = {
        TableName:table,
        Item:{
            "RoomName": chatName,
            "RoomCode": chatCode,
        }
    };

    console.log("Adding a new item...");
    docClient.put(params, function(err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
        }
        else{
            console.log("Added item:", JSON.stringify(data, null, 2));
        }

    });
}