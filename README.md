# notif-mailer

Service that sends notification emails, from a Firebase queue.

## What it does

After deploying and setting up this script to your favorite server (e.g. a Heroku instance), the `run.js` script is meant to be run every 10 minutes, and will:

1. Fetch the pending notifications from the associated Firebase database;
2. Email and remove the expected notifications (due from now).

I wrote this script for the "Clear" project.

## Setup

1. Clone this repository locally, then `npm install`;
2. Create a Firebase database => fill your Firebase credentials in the `run.sh` file;
3. Run `npm test` locally, it will store a sample notification in your Firebase database, and display the corresponding notification email that would be sent (using `--dry-run` toggle);
4. Create a [Sendgrid account](https://sendgrid.com) => fill the API credentials in the `run.sh` file;
5. Then, fill the `EMAIL_FROM` and `EMAIL_TO` fields of `run.sh`;
6. When the test works, run `run.sh` (without the `--dry-run` argument) => you should receive that email within 5 minutes, given your Sendgrid account was provisionned.
7. Now you can push all that to your favorite web server or hosting service, and configure it so that `run.sh` is run every day, at the time of your choice. If, like me, you decide to use [Heroku](http://heroku.com), you can use the [Scheduler addon](https://scheduler.heroku.com). Otherwise, a `cron` script should work.

## Required environment variables

- `FIREBASE_API_KEY`: API key of your Firebase Database
- `FIREBASE_DATA_URL`: URL of your Firebase Database (with `.firebaseio.com` suffix)
- `SENDGRID_API_KEY`: [API key provided by Sendgrid](https://sendgrid.com/docs/User_Guide/Settings/api_keys.html) after creating your account
- `EMAIL_FROM`: Email address from which daily emails will be sent
- `EMAIL_TO`: Email address of the recipient (i.e. you, I guess)

## Optional environment variables

- `FIREBASE_DATA_PATH`: Path in which your emails are stored. Default value: `/`.

## Model of emails in Firebase

When `FIREBASE_DATA_PATH` is set as `/emailNotifs`, the `test-sample-emails` will populate your Firebase Database like this:

```json
{
  "emailNotifs" : {
    "-Kh2jS_-AQvh-_GgUDyh" : {
      "subject" : "fake email 1",
      "text" : "should be sent now",
      "when" : 1491490167102
    },
    "-Kh2jSs_htKipIGCIVL7" : {
      "subject" : "fake email 2",
      "text" : "should be sent in 5 seconds or more",
      "when" : 1491490172102
    }
  }
}
```

The `when` property of each email object is a date-time serialized in milliseconds.
