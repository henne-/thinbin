'use strict';

// imports

var PouchDB = require('pouchdb'),
    Q = require('q'),
    atob = require('atob'),
    btoa = require('btoa'),
    generateId = require('../utils/generateId')(),
    ConfigFactory = require('../services/configFactory');

// module instances

var settings,
    pouch;

settings = ConfigFactory.instance();
console.log('Using Pouch with: ', settings.get('pouchStore'));
pouch = PouchDB(settings.get('pouchStore'));

// private helpers

function convertDocumentToMetafile(doc) {

    var meta,
        files = {};

    Object.keys(doc._attachments).forEach(function (key) {
        var attachment = doc._attachments[key],
            fileName = key;

        files[fileName] = {
            contentType: attachment['content_type'],
            length: attachment['length']
        };
    });

    meta = {
        id: doc._id,
        files: files,
        expiresAt: (doc.expiresAt || null)
    };

    return meta;
}

function validateFileRequirements(filedata) {
    var error,
        sharedSettings = settings.get('shared'),
        validRetentions = sharedSettings.retentions;

    validRetentions = Object.keys(validRetentions)
        .map(function (key) {
            return validRetentions[key];
        });

    // filetype description checks
    if (!error && filedata.metatype === undefined) {
        error = 'Filetype is missing. Must be binary or plaintext.';
    }
    if (!error && ['text/plain', 'application/octet-stream'].indexOf(filedata.metatype) === -1) {
        error = 'Wrong filetype. Must be binary or plaintext.';
    }

    // content checks

    if (!error && filedata.attachment === undefined) {
        error = 'Content is not defined.';
    }
    if (!error && filedata.attachment.buffer === undefined) {
        error = 'Content is empty.';
    }
    if (!error && filedata.attachment.buffer.length > sharedSettings.maxFileSizeBytes) {
        error = 'Provided content exceeds upload filsize limit.';
    }

    // retention period checks

    if (!error && isNaN(filedata.retentionPeriod)) {
        error = 'Given retention period is not valid.';
    }
    if (!error && filedata.retentionPeriod === undefined) {
        error = 'Retention period is missing.';
    }
    if (!error && validRetentions.indexOf(filedata.retentionPeriod) === -1) {
        error = 'Given retention period is not available.';
    }

    return error;
}

function isFileExpired(file) {
    return (!doc.expiresAt) || (doc.expiresAt <= Date.now());
}

// service functions

function saveFileById(fileId, filedata) {

    filedata.retentionPeriod = Number(filedata.retentionPeriod);

    var files,
        deferred = Q.defer(),
        validationError = validateFileRequirements(filedata),
        fileName;

    if (validationError) {
        deferred.reject(validationError);
    } else {
        fileName = filedata.attachment.name || fileId;
        files = {};
        files[fileName] = {
            content_type: filedata.attachment.type,
            data: filedata.attachment.buffer
        };

        pouch.put({
            _id: fileId,
            _attachments: files,
            expiresAt: (filedata.retentionPeriod + Date.now()),
            metataype: filedata.metatype,
            isPrivate: (filedata.isPrivate === true)
        }).then(function (doc) {
            deferred.resolve(readFile(fileId));
        }).catch(function (err) {
            console.log('ERROR:', err);
            deferred.resolve(err);
        });
    }

    return deferred.promise;
}

/**
 *  Creates a new File Object with Attachments.
 *
 *  var file = {
 *         metatype: string,
 *         retentionPeriod: number,
 *         attachment: {
 *             name: string,
 *             type: string,
 *             size: number,
 *             buffer: Buffer
 *         }
 *     };
 *
 * @param fileData
 * @returns {*}
 */
function saveFile(fileData) {
    var fileId = generateId();

    return pouch
        .get(fileId)
        .then(onIdFound, onIdFree);

    function onIdFound() {
        // try once again
        return saveFile(fileData);
    }

    function onIdFree() {
        return saveFileById(fileId, fileData);
    }
}

function readFile(fileId) {
    var fileName = String(fileId);

    return pouch.get(fileName)
        .then(function (doc) {
            return convertDocumentToMetafile(doc);
        }).catch(function (err) {
            console.log('ERROR:', err);
        });
}

function readRawFile(fileId) {
    var fileName = String(fileId);

    return readFile(fileId)
            .then(function(file) {
                fileName = Object.keys(file.files)[0];

                return pouch.getAttachment(fileId, fileName)
                    .then(function (blob) {
                        return blob;
                    }).catch(function (err) {
                        console.log('ERROR:', err);
                    })
            });
}

function readExpiredFilesMeta() {
    var deferred = Q.defer();

    function map(doc) {
        if (!doc.expiresAt || doc.expiresAt <= Date.now()) {
            emit(doc._id);
        }
    }

    return pouch.query({map: map}, {reduce: false}, function (err, response) {
        if (err) {
            deferred.resolve(err);
        } else {
            deferred.resolve(response);
        }
    });
}

function deleteFileById(fileId) {
    return pouch.get(fileId)
        .then(function (doc) {
            return pouch.remove(doc)
                .then(function(f) {
                    return doc;
                }).catch(function(err) {
                    console.log('File deletion failed', err);
                });
        }).catch(function (err) {
            console.log('ERROR:', err);
        });
}

function deleteAllExpiredFiles() {
    return readExpiredFilesMeta()
        .then(function (result) {
            var promises = result.rows.map(function (meta) {
                return deleteFileById(meta.key);
            });

            return Q.all(promises).then(function(deletedDocs) {
                return deletedDocs.map(convertDocumentToMetafile);
            });
        }).catch(function (err) {
            console.log('ERROR:', err);
        });
}


// exported api

module.exports = {
    saveFile: saveFile,
    readFile: readFile,
    readRawFile: readRawFile,
    deleteFile: deleteFileById,
    readExpiredFilesMeta: readExpiredFilesMeta,
    deleteAllExpiredFiles: deleteAllExpiredFiles,
};