#りす // Risu Thinbin

A minimalistic plaintext and binary pastebin.

## What You will Get

* Upload files and share them through an URL.
* Scan QR codes to easily get your file's URL to another device.
* Use drag and drop to upload binary files.
* Automatic deletion of an upload after passing a retention period.
* A configurable service settings.

## Technical Details

Thinbin is written in JavaScript, using AngularJS in the frontend and NodeJS in the backend. 
The application utilizes PouchDB with attachements as datastore. The storage strategy is configureable,
which means you can store files locally or in a remote CouchDB.

## What You will need

You should have an operating system running with NodeJS, NPM, Bower and Gulp preinstalled.
As long as you have NodeJS and NPM preinsalled the way your operating systems allows it, 
the rest comes pretty easy by executing `npm install -g bower gulp` in your command prompt.

## How to Install

At first get the files ready:

```
git clone https://github.com/risu-io/thinbin.git
cd thinbin
npm install
bower install
```

Second, configure the thinbin settings and adjust to your taste. 
To do so go and edit `thinbin/dev/config/production.json` to someting similiar like the below example

```
{
    // This will be the interface you want to bind the service to.
    // Tip: if you have a balancer like nginx in front, go for localhost
    "hostname": "thinbin.risu.io",
    "port": 8001,
    "public": "/public",
    
    // Where PouchDB will store it's data.
    // Filesystem paths to folders store in a local LevelDB.
    // HTTP urls can store into an external CouchDB.
    "pouchStore": "/tmp/thinbin",

    "idSalt":"you probably better change this",
    "idLength": 6,

    // These are the settings, the angular client will get in the frontend.
    // You do better by NOT placing sensitive content here.
    "shared": {
        // this will be the baseUrl the client generates it's external links from.
        "apiUrl":"http://thinbin.risu.io:8001/api",
        "maxFileSizeBytes": 524288000,
        "allowedPlaintextMimes": [
            "text/plain",
            "text/javascript",
            "text/html",
            "text/css",
            "text/sql",
            "text/bash",
            "text/c",
            "*/*"
        ],
        "allowedBinaryMimes": [
            "application/octet-stream",
            "*/*"
        ],
        // Maximum time to keep a file before deletion
        "retentions": {
            "_30_minutes": 1800000,
            "_60_minutes": 3600000,
            "_12_hours": 43200000,
            "_24_hours": 86400000,
            "_1_week": 604800000,
            "_1_month": 2678400000,
            "_3_months": 8035200000,
            "_6_months": 16070400000,
            "_1_year": 32140800000
        },
        // at least there are only those both types currently
        "displayModes": {
            "_plaintext": "text/plain",
            "_binary": "application/octet-stream"
        }
    }
}
```

Then you have to build an production ready version of the application by typing:

```
gulp build-server ; gulp build-client
```

Start your personal Thinbin with `node build/server.js`. 

Enjoy!
