# Try to get node running with a concurrency of at least 1000 connections

## Linux (Ubuntu 9.10 "karmic koala")

### Raise limits, part I

Edit file /etc/security/limits.conf

    sudo vim /etc/security/limits.conf

Add or modify the following lines
(replace stuff in <code><angle brackets></code>):

    <username>       soft    nofile          200000
    <username>       hard    nofile          200000

My box seems not to take this into account at all. Maybe this would have a
meaning when I would directly ssh into the box as <code><username></code>.

### Raise limits, part II

Edit file /etc/rc.local

    sudo vim /etc/rc.local

Add or modify the following lines:

    ulimit -Hn 1000000
    ulimit -Sn 1000000

Maybe this helps Apache and MySQL?

### Raise limits, part III

Since I ssh into my Linux box as root (boo!), do this as well:
Edit file /root/.bashrc

    sudo vim /root/.bashrc

Add or modify the following lines:

    ulimit -Hn 1000000
    ulimit -Sn 1000000

### Raise MySQL connection limit

    vim /etc/mysql/my.cnf

Add or modify the following lines:

    max_connections = 5001

Restart MySQL

    /etc/init.d/mysql restart

## MacOS X

### Raise system limits

To raise some system limitations, issue these commands:

    sudo sysctl -w kern.maxvnodes=4000000
    sudo sysctl -w kern.maxfiles=1000000
    sudo sysctl -w kern.maxfilesperproc=100000
    sudo sysctl -w kern.maxnbuf=100000
    sudo sysctl -w net.inet.ip.portrange.first=10000
    sudo sysctl -w net.inet.ip.portrange.hifirst=10000

You might need to restart all dependent processes (servers, clients, shells) 
for them to come under the effect of the raised limits.

Alternatively, you could edit the "System Control" configuration file:

    sudo vim /etc/sysctl.conf
    
add or modify the following settings to read as this:

    kern.maxvnodes=4000000
    kern.maxfiles=1000000
    kern.maxfilesperproc=100000
    kern.maxnbuf=100000
    net.inet.ip.portrange.first=10000
    net.inet.ip.portrange.hifirst=10000

You might need to restart your computer for these settings to come into effect.

### Raise the limits for MAMP (Apache and MySQL)

Edit the MAMP start files to take the raised system limits into account:

    vim /Applications/MAMP/bin/start{Apache,Mysql}.sh

After the [MAMP, what are you doing there?] hashbang, add the following line:

    ulimit -S -n $(sysctl -n kern.maxfilesperproc)

### Setup MySQL

Edit MySQL configuration file:

    vim /Applications/MAMP/conf/my.cnf

Under the section

    [mysqld]

add or modify the following settings to read as this:

    port=3306
    max_connections=1001
    bind_address=127.0.0.1

Restart MySQL to take these new settings into account.
