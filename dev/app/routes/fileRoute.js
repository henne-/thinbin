'use strict';

// imports

var Boom = require('boom'),
    FileService = require('../services/fileService'),
    ConfigFactory = require('../services/configFactory');

// route handlers

function handleGetFile(request, reply) {
    FileService
        .readFile(request.params.id)
        .then(function (fileDocument) {
            reply(fileDocument);
        })
        .catch(function (err) {
            var error = Boom.create(500, 'unexpected error during read file');
            reply(error);
        });
}

function handleGetRawFile(request, reply) {
    var contentType,
        fileName;

    FileService
        .readFile(request.params.id)
        .then(function(file) {
            fileName = request.params.filename;
            contentType = file.files[fileName].contentType;

            return FileService.readRawFile(file.id);
        })
        .then(function (rawFile) {
            reply(rawFile).type(contentType);
        })
        .catch(function () {
            var error = Boom.create(500, 'unexpected error during raw read process');
            reply(error);
        });
}

function handleGetDownloadFile(request, reply) {
    var contentType,
        fileName;

    FileService
        .readFile(request.params.id)
        .then(function(file) {
            fileName = request.params.filename;
            contentType = file.files[fileName].contentType;

            return FileService.readRawFile(file.id);
        })
        .then(function (rawFile) {
            reply(rawFile)
                .type(contentType)
                .header('Content-disposition', 'attachment; filename=' + fileName);
        })
        .catch(function () {
            var error = Boom.create(500, 'unexpected error during raw read process');
            reply(error);
        });
}

function handleGetDownloadArchive(request, reply) {
    reply('To be implemented');
}

function handlePostFile(request, reply) {

    var payload = request.payload;

    var file = {
        metatype: payload.filetype,
        retentionPeriod: payload.retentionPeriod,
        attachment: {
            name: undefined,
            type: undefined,
            size: undefined,
            buffer: undefined
        }
    };

    if(file.metatype === 'application/octet-stream') {
        file.attachment        = JSON.parse(payload.file[0])[0];
        file.attachment.name   = payload.filename;
        file.attachment.type   = payload.mimetype;
        file.attachment.buffer =  payload.file[1];
    } else if(file.metatype === 'text/plain') {
        file.attachment.buffer = new Buffer(payload.content);
        file.attachment.size = file.attachment.buffer.length;
        file.attachment.type = 'text/plain';
    }

    FileService
        .saveFile(file)
        .then(function (fileDocument) {
            reply(fileDocument);
        })
        .catch(function (err) {
            var error = Boom.badRequest(err);
            reply(error);
        });
}

function handleDeleteAll(request, reply) {
    FileService
        .deleteAllExpiredFiles()
        .then(function (result) {
            reply(result);
        })
        .catch(function (err) {
            var error = Boom.badRequest(err);
            reply(error);
        });
}

// exported api

module.exports = [
    {
        path: '/api/file',
        method: 'POST',
        handler: handlePostFile,
        config: {
            payload: {
                maxBytes: ConfigFactory.instance().get('shared').maxFileSizeBytes
            }
        }
    },
    {
        path: '/api/file/{id}/{filename}',
        method: 'GET',
        handler: handleGetRawFile
    },
    {
        path: '/api/file/{id}/download/{filename}',
        method: 'GET',
        handler: handleGetDownloadFile
    },
    {
        path: '/api/file/{id}/download',
        method: 'GET',
        handler: handleGetDownloadArchive
    },
    {
        path: '/api/file/{id}',
        method: 'GET',
        handler: handleGetFile
    },
    {
        path: '/api/files',
        method: 'DELETE',
        handler: handleDeleteAll
    }
];