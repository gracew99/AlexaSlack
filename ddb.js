var AWSdb = require('aws-sdk');

const { v4: uuidv4 } = require('uuid');

module.exports.initdb = initdb;
module.exports.querydb = querydb;
module.exports.getdb = getdb;
module.exports.putdb = putdb;

function initdb(){
    AWSdb.config.update({
        region: "us-west-2",
        endpoint: "http://dynamodb.us-west-2.amazonaws.com",
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        sessionToken: process.env.AWS_SESSION_TOKEN  
      });
      var dynamodb = new AWSdb.DynamoDB();
      
      var params = {
          TableName : "TestBlogdb",
          KeySchema: [       
              { AttributeName: "id", KeyType: "HASH"},  //Partition key
          ],
          AttributeDefinitions: [    
              { AttributeName: "RoomName", AttributeType: "S" },    
              { AttributeName: "FirstName", AttributeType: "S" },
              { AttributeName: "LastName", AttributeType: "S" }
      
          ],
          ProvisionedThroughput: {       
              ReadCapacityUnits: 1, 
              WriteCapacityUnits: 1
          }
      };
      
      dynamodb.createTable(params, function(err, data) {
          if (err) {
              console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
          } else {
              console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
          }
      });
}

function querydb(table, docClient, render){
    var today = new Date();

    var params = {
        TableName: table,
        IndexName: "DateTimeIndex",
        KeyConditionExpression: "postdate = :date1",
        ExpressionAttributeValues: {
          ":date1": today
        }
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


function getdb(table, pid, docClient, render){
    var params = {
        TableName: table,
        Key:{
            "id": pid
        }
    };

    docClient.get(params, function(err, data) {
    if (err) {
        render(null);
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        render(data);
        console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
    }
    });
}

function putdb(table, id, modified_id, post, title, docClient, render){
    var postdate = new Date();
    var posttime = postdate.getValue();

    // if (typeof variable == 'undefined') {
    //     id = uuidv4();
    //     modified_id = id;
    // }
    // console.log(id + " " + modified_id);
    var params = {
        TableName:table,
        Item:{
            "id": id,
            "modified_id": modified_id,
            "body": post,
            "title": title,
            "postdate": postdate,
            "posttime": posttime

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