cd ..
svn co http://sosoa.inf.usi.ch/svn/sosoa/usi/trunk/daniele/koala_branch
cd koala_branch
killall -9 node
killall -9 nodejs
sudo service ntp stop
sudo ntpdate ntp.ubuntu.com
sudo service ntp start
