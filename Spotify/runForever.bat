@echo off
echo Starting script with Forever mode on...
echo Please note that the shutdown command will not activate and will make this script think there is an error
:main
node app.js
echo Uh oh... Looks like the bot crashed, rebooting it now
goto main
