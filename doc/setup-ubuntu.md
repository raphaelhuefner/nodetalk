# Try to setup a high concurrency scenario on Linux (Ubuntu 9.10 "karmic koala")

After giving up on setting up a high concurrency scenario on Mac OS X, I turned to my "trusty old" Linux VPS, which still runs under Ubuntu 9.10 "karmic koala".

These are my stabs at preparing the environment for a single node.js process to be able to receive high numbers of connections.

### Raise limits, part I

Edit file /etc/security/limits.conf

    sudo vim /etc/security/limits.conf

Add or modify the following lines
(replace stuff in &lt;angle brackets&gt;):

    <username>       soft    nofile          200000
    <username>       hard    nofile          200000

My box seems not to take this into account at all. Maybe this would have a
meaning when I would directly ssh into the box as &lt;username&gt;.


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


### Configure Apache2

    <IfModule mpm_prefork_module>
        StartServers       8
        MinSpareServers    5
        MaxSpareServers   15
        MaxClients       256
        MaxRequestsPerChild   0
    </IfModule>

