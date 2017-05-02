#!/bin/bash
# If you have issues running this try this code
# sudo chmod 777 runForever.sh
echo If you get any issues running this script then read the help in the file
echo Please note that the shutdown command will not work when this file is running, the only was to shutdown is to stop this script
while :
do
	node app.js
	echo Spotify bot shutdown, restarting now
done
