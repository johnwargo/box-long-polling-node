//@ts-check

const axios = require('axios').default;
const boxen = require('boxen');
const chalk = require('chalk');

const APP_NAME = 'Box Long Polling Example';
const EVENTS_URL = 'https://api.box.com/2.0/events';

const ERROR_STRING = 'Error: ';
const ERROR_EVENT = 'Invalid response from Box Realtime Server';
const ERR_EVENT_LIST = 'Unable to retrieve event list';
const ERR_EVENT_STREAM_POS = 'Unable to determine current event stream position';
const ERR_POLL = 'Enable to invoke long polling';
const ERR_POLL_URL = 'Unable to retrieve the long polling URL';

/**
 * @param {string} msg 
 */
function displayError(msg) {
    console.log(chalk.red(ERROR_STRING) + msg);
}

/**
 * @param {string} highlight
 * @param {string} msg 
 */
function displayHighlight(highlight, msg) {
    console.log(chalk.yellow(`${highlight}: `) + msg);
}

/**
 * @param {string} devToken 
 */
async function longPoll(devToken) {

    let pollURL;
    let streamPos;

    console.log(boxen(APP_NAME, { padding: 1 }));
    console.log();

    // Set the auth config for the get events request
    const authConfig = { headers: { Authorization: `Bearer ${devToken}` } };

    // get the polling URL
    try {
        await axios.options(EVENTS_URL, authConfig)
            .then(response => {
                // Successful request?
                if (response.status == 200) {
                    // get the list of entries
                    let entries = response.data.entries;
                    // Do we have any entries?
                    if (entries && entries.length > 0) {
                        // get the polling URL we need to invoke (the first one in the list)
                        pollURL = entries[0].url;
                        displayHighlight('Realtime URL', pollURL);
                    } else {
                        displayError(ERR_POLL_URL);
                        process.exit(1);
                    }
                } else {
                    displayError(`${ERR_POLL_URL} (${response.statusText})`);
                    process.exit(1);
                }
            })
            .catch(err => {
                // handle error
                displayError(ERR_POLL_URL);
                console.error(err);
                process.exit(1);
            })
    } catch (err) {
        displayError(ERR_POLL_URL);
        console.error(err);
        process.exit(1);
    }

    // Use the polling URL to get the current stream position
    try {
        await axios.get(EVENTS_URL, authConfig)
            .then(res => {
                if (res.data.next_stream_position) {
                    streamPos = res.data.next_stream_position;
                    displayHighlight('Stream position', streamPos);
                } else {
                    displayError(ERR_EVENT_STREAM_POS);
                    process.exit(1);
                }
            })
            .catch(err => {
                displayError(ERR_EVENT_STREAM_POS);
                console.error(err);
                process.exit(1);
            })
    } catch (err) {
        displayError(ERR_EVENT_STREAM_POS);
        console.error(err);
        process.exit(1);
    }

    // At this point, start an infinite loop that starts long polling, 
    // processes any events, then starts the long poll until the user
    // hits `Ctrl-C` on the keyboard
    while (true) {
        console.log('\n' + chalk.green('Invoking long poll...'));
        try {
            const response = await axios.get(pollURL, authConfig);
            let msg = response.data.message;
            if (msg) {
                switch (msg) {
                    case 'new_change':
                        displayHighlight(msg, 'Change detected');
                        console.log('Fetching events...');

                        // build the event request URL (using stream_position)
                        let requestURL = new URL(EVENTS_URL);
                        requestURL.searchParams.append('stream_position', streamPos);

                        // now try to get the most recent event list
                        try {
                            await axios.get(requestURL.href, authConfig)
                                .then(res => {
                                    // get the events result array
                                    let events = res.data.entries;
                                    // do we have some events?
                                    if (events && events.length > 0) {
                                        // the print the event list to the console
                                        for (const event of events) {
                                            displayHighlight(event.event_type, event.event_id);
                                        }
                                    } else {
                                        displayError(ERR_EVENT_LIST);
                                    }
                                    // Update the stream position with the current position
                                    streamPos = res.data.next_stream_position;
                                })
                                .catch(err => {
                                    displayError(ERR_EVENT_LIST);
                                    console.dir(err.data);
                                })
                        } catch (err) {
                            displayError(ERR_EVENT_LIST);
                            console.dir(err.data);
                        }
                        break;
                    case 'reconnect':
                        displayHighlight(msg, 'Connection timed-out, reconnecting...');
                        break;
                    default:
                        displayError(`${ERROR_EVENT} (${msg})`);
                }
            } else {
                displayError(`${ERROR_EVENT} (message missing)`);
            }
        } catch (err) {
            displayError(ERR_POLL);
            console.error(err);
            process.exit(1);
        }
    }
};

// Get the Box developer token from the command line
let devToken = process.argv[2];
if (!devToken) {
    displayError('You must pass the Box API developer token on the command line to this process');
    process.exit(1);
}
// start the long poll process
longPoll(devToken);
