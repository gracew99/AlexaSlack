// Require the Bolt package (github.com/slackapi/bolt)
// const { App } = require("@slack/bolt");
const AWSdb = require("aws-sdk");
const db = require(__dirname+"/ddb.js");

// const app = new App({
//     token: process.env.SLACK_BOT_TOKEN,
//     signingSecret: process.env.SLACK_SIGNING_SECRET,
//     endpoints: {
//         events: '/slack/events',
//         commands: '/slack/command'
//     }
// });
let fname = 'Grace';
let lname = 'Alexander';
let chatName = 'LP1';
let slack_user_id;
let slack_channel_id;
const docClient = new AWSdb.DynamoDB.DocumentClient();
const table = "AlexaSkillHackathon";
db.initdb();

// db.putdb(table, chatName, fname, lname, docClient, function(data){
//     if (data === null){
//         console.log('error')
//     }
//     else{
//         console.log(data);
//     }
// });

// app.event('app_home_opened', async ({ event, context }) => {
//     try {
//         /* view.publish is the method that your app uses to push a view to the Home tab */
//         slack_user_id = event.user;

//         const result = await app.client.views.publish({

//             /* retrieves your xoxb token from context */
//             token: context.botToken,

//             /* the user that opened your app's app home */
//             user_id: event.user,

//             /* the view object that appears in the app home*/
//             view: {
//                 type: 'home',
//                 callback_id: 'home_view',

//                 /* body of the view */
//                 blocks: [
//                     {
//                         "type": "section",
//                         "text": {
//                             "type": "mrkdwn",
//                             "text": "*Welcome to SuperTeam* :tada:"
//                         }
//                     },
//                     {
//                         "type": "divider"
//                     },
//                     {
//                         "type": "section",
//                         "text": {
//                             "type": "mrkdwn",
//                             "text": "Head on over to the Messages tab and send the /join-room message followed by your first and last name to join your SuperTeam! For example: /join-room Amazon Alexa"
//                         }
//                     }
//                 ]
//             }
//         });
//     }
//     catch (error) {
//         console.error(error);
//     }
// });



// app.command('/create-room', async ({ ack, payload, context }) => {
//     console.log(payload);
//     // Calling ack() acknowledges the request coming from Slack
//     ack();

//     try {
//         // Call the conversations.create method using the built-in WebClient
//         const result = await app.client.conversations.create({
//             // The token you used to initialize your app is stored in the `context` object
//             token: context.botToken,
//             // The name of the conversation
//             name: "public-channel",

//             is_private: false,

//             // Add the user who clicked the message action into the new channel
//             user_ids: payload.user_id
//         });

//         slack_channel_id = "C0EAQDV4Z";

//         // addUserToRoom();
//         console.log(result);
//     }
//     catch (error) {
//         console.error(error);
//     }
// });


// app.command('/join-room', async ({ ack, payload, context }) => {
//     console.log(slack_user_id);

//     // Calling ack() acknowledges the request coming from Slack
//     ack();

//     try {
//         // Call the conversations.create method using the built-in WebClient
//         const result = await app.client.conversations.invite({
//             // The token you used to initialize your app is stored in the `context` object
//             token: context.botToken,
//             // The name of the conversation
//             channel: "C0180ED3EBX",
//             // Add the user who clicked the message action into the new channel
//             users: slack_user_id
//         });

//         console.log(result);
//     }
//     catch (error) {
//         console.error(error);
//     }
// });




// All the room in the world for your code



// (async () => {
//     // Start your app
//     await app.start(process.env.PORT || 3000);

//     console.log('⚡️ Bolt app is running!');
// })();

