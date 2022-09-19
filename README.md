# web-checker-template
Template for checking an online resource and notifies user by email when certain value is returned.
It can be run periodically by a cron job at a given time.


### Prerequest:
Requires Mailgun account (have free tier) for sending email from your behalf

### How to install:
After checkout, in root dir create a folder for the logs

    mkdir ./logs
    touch ./logs/logs.txt

### How to start with

    npm run start
