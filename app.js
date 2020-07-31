/*
Real workflow:
I. Alexa
1) User-skill table: put user with key id, secondary key first name, also last name,
slack username, LP1
II. Service here
2) Room-chanelId table (see implemented workflow). Also, each room has a hashset of which skills included
3) User-room table: Loop through all users in user-skill table and assign to above rooms
III. User access (see implemented workflow)

Implemented workflow:
I. Alexa-SKIPPED
II. Setup here
1) Room-channelId table: put room name as key, channelId as value
    -Invoked manually in slack using slash command /create-room one time to create all rooms
    -call slack command to create conversation
2) User-room table: put user with key first name, secondary key last name, value room name
III. User access
3) User goes to slack and joins room with their name /join-room Alexa Larson
    -Check if Alexa Larson exists in the User-room database. If so, get roomname
    -Check Room-channelId table: get channelId for input roomname
    -Call slack api to user's id to channelId
 */

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

/* Alexa db interaction begin: put all users in dynamodb */
let fnames = ['Grace', 'Alexa', 'John', 'Mark', 'Matthew', 'Luke', 'Peter', 'Martha', 'Paul', 'Mary', 'Esther'];
let lnames = ['Thomas', 'Larson', 'Spokes', 'Pilar', 'Slaz', 'Beshe', 'Bolan', 'Min', 'Kruger', 'Nore', 'Manerston'];
let chatNames = ['feast', 'ocean', 'mountain', 'sunset'];
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

/* Alexa db interaction end */


/* Instructions for user */
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


/* Developer creates chat rooms from an array of random word names ie: feast and
* puts in database that maps to channel Id ie: feast C0183U16F0T. One time command
* creates all rooms */
app.command('/create-room', async ({ ack, payload, context }) => {
    console.log(payload);
    // Calling ack() acknowledges the request coming from Slack
    ack();
    chatNames.forEach(async (chatName) =>
    {
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
            const dbRoom = await db.putdbRooms(rooms, chatName, result.channel.id, docClient);
            console.log("dbRoom doesnt work bc promise" + dbRoom);
        } catch (error) {
            console.error(error);
        }
    });
});
/* If the name given by the user (Alexa Larson) exists in the user database and has a room assignment,
 go to the rooms database with that room assignment, fetch the channel id and add the user to that channel */
let joinRoom = async (rmName, payload_text, user_id, context) =>{
    if (rmName === null){
        console.error('user does not exist');
        return null;
    }

    let slack_channel;


    await db.getdbRooms(rooms, rmName, docClient, async(data) =>
    {
        console.log(data.Item.RoomCode);
        try {
            // Call the conversations.create method using the built-in WebClient
            const result = await app.client.conversations.invite({
                // The token you used to initialize your app is stored in the `context` object
                token: context.botToken,
                // The name of the conversation
                channel: data.Item.RoomCode,
                // Add the user who clicked the message action into the new channel
                users: user_id
            });

            console.log(result);
        }
        catch (error) {
            console.error(error);
        }
    });
    console.log("slackchannel doesnt work bc promise" + slack_channel);


}

/* User tries to join room by telling us their name ie: /join-room Alexa Larson */
app.command('/join-room', async ({ ack, payload, context }) => {
    ack();
    await db.getdb(table, payload.text, docClient, joinRoom, payload.user_id, context);
});


(async () => {
    // Start your app
    await app.start(process.env.PORT || 3000);

    console.log('⚡️ Bolt app is running!');
})();







