# wunderlist-report

Congratulates you every evening by email for all the [Wunderlist](http://wunderlist.com) tasks that you checked during the day.

## What it does

After deploying and setting up this script to your favorite server (e.g. a Heroku instance), the `run.js` script is meant to be run daily, and will:

1. Find out all the tasks you checked today, from you Wunderlist account;
2. Send you an email containing this list of tasks.

I wrote this script to measure my day-to-day productivity, and also to motivate myself to keep checking many tasks every day.

## Setup

1. Clone this repository locally, then `npm install`;
2. Create a [Wunderlist developer account](https://developer.wunderlist.com);
3. Create a [Wunderlist app](https://developer.wunderlist.com/apps) => fill your app's client ID and client Secret in the `run.sh` file;
4. Generate an access token by clicking the corresponding button, near your Wunderlist app => also fill it in the `run.sh` file;
5. Create a [Sendgrid account](https://sendgrid.com) => fill the API key the `run.sh` file, when provided;
6. Then, fill the `EMAIL_FROM` and `EMAIL_TO` fields of `run.sh`;
7. Finally, run `run.sh --dry-run` to make sure that everything works => you should see a line `EMAIL =>` followed by a JSON object that lists the tasks that you checked today.
8. When the test works, run `run.sh` (without the `--dry-run` argument) => you should receive an email within 5 minutes, given your Sendgrid account was provisionned.
9. Now you can push all that to your favorite web server or hosting service, and configure it so that `run.sh` is run every day, at the time of your choice. If, like me, you decide to use [Heroku](http://heroku.com), you can use the [Scheduler addon](https://scheduler.heroku.com). Otherwise, a `cron` script should work.

## Required environment variables

- `WUNDERLIST_CLIENT_ID`: 20-char-long hexadecimal string, provided by [Wunderlist developer console](https://developer.wunderlist.com/apps) after creating an app
- `WUNDERLIST_CLIENT_SECRET`: 60-char-long hexadecimal string, provided by [Wunderlist developer console](https://developer.wunderlist.com/apps) after creating an app
- `WUNDERLIST_USER_TOKEN`: 60-char-long hexadecimal string, provided by clicking on "Create access token", from your [Wunderlist developer console](https://developer.wunderlist.com/apps) (or after using `auth.js`)
- `SENDGRID_API_KEY`: [API key provided by Sendgrid](https://sendgrid.com/docs/User_Guide/Settings/api_keys.html) after creating your account
- `EMAIL_FROM`: Email address from which daily emails will be sent
- `EMAIL_TO`: Email address of the recipient (i.e. you, I guess)
