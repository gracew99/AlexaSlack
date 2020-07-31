// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");
const AWSdb = require("aws-sdk");
const db = require(__dirname+"/ddb.js");

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    endpoints: {
        events: '/slack/events',
        commands: '/slack/command'
    }
});
let fnames = ['Grace', 'Alexa', 'John', 'Mark', 'Matthew', 'Luke', 'Peter', 'Martha', 'Paul', 'Mary', 'Esther'];
let lnames = ['Thomas', 'Larson', 'Spokes', 'Pilar', 'Slaz', 'Beshe', 'Bolan', 'Min', 'Kruger', 'Nore', 'Manerston'];
let chatName = 'feast';
let slack_user_id;
let event_user;
const docClient = new AWSdb.DynamoDB.DocumentClient();
const table = "AlexaSkillHackathon";
const rooms = "Rooms";

// db.initdb();

// for (let i = 0; i < fnames.length; i++){
//   db.putdb(table, chatName, fnames[i], lnames[i], docClient, function(data){
//       if (data === null){
//           console.log('error')
//       }
//       else{
//           console.log(data);
//       }
//   });
// }


app.event('app_home_opened', async ({ event, context }) => {
    try {
        /* view.publish is the method that your app uses to push a view to the Home tab */
        event_user = event.user;

        const result = await app.client.views.publish({

            /* retrieves your xoxb token from context */
            token: context.botToken,

            /* the user that opened your app's app home */
            user_id: event.user,

            /* the view object that appears in the app home*/
            view: {
                type: 'home',
                callback_id: 'home_view',

                /* body of the view */
                blocks: [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": "*Welcome to SuperTeam* :tada:"
                        }
                    },
                    {
                        "type": "divider"
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": "Head on over to the Messages tab and send the /join-room message followed by your first and last name to join your SuperTeam! For example: /join-room Amazon Alexa"
                        }
                    }
                ]
            }
        });
    }
    catch (error) {
        console.error(error);
    }
});



app.command('/create-room', async ({ ack, payload, context }) => {
    console.log(payload);
    // Calling ack() acknowledges the request coming from Slack
    ack();

    try {
        // Call the conversations.create method using the built-in WebClient
        const result = await app.client.conversations.create({
            // The token you used to initialize your app is stored in the `context` object
            token: context.botToken,
            // The name of the conversation
            name: chatName,

            is_private: false,

            // Add the botuser into the new channel
            user_ids: payload.user_id
        });

        // addUserToRoom();
        console.log(result);
        console.log(result.channel_id);
        const dbRoom = await db.putdbRooms(rooms, chatName, result.channel_id, docClient);
        console.log("dbRoom doesnt work bc promise" + dbRoom);
    }
    catch (error) {
        console.error(error);
    }
});

let joinRoom = async (rmName, payload_text, context) =>{
    if (rmName === null){
        console.error('user does not exist');
        return null;
    }

    let slack_channel;

    if (rmName === chatName){
        slack_user_id = event_user;
        slack_channel = await db.getdbRooms(rooms, chatName, docClient);
        console.log("slackchannel doesnt work bc promise" + slack_channel);
    }
    console.log("channel " + slack_channel);
    console.log("user " + slack_user_id);

    try {
        // Call the conversations.create method using the built-in WebClient
        const result = await app.client.conversations.invite({
            // The token you used to initialize your app is stored in the `context` object
            token: context.botToken,
            // The name of the conversation
            channel: slack_channel,
            // Add the user who clicked the message action into the new channel
            users: slack_user_id
        });

        console.log(result);
    }
    catch (error) {
        console.error(error);
    }
}


app.command('/join-room', async ({ ack, payload, context }) => {
    ack();
    await db.getdb(table, payload.text, docClient, joinRoom, context);
});




// All the room in the world for your code



(async () => {
    // Start your app
    await app.start(process.env.PORT || 3000);

    console.log('⚡️ Bolt app is running!');
})();





