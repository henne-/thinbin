'use strict';

// imports

var Boom = require('boom'),
    FileService = require('../services/fileService.js');

// route handlers

function handleGetFile(request, reply) {
    FileService
        .readFile(request.params.id)
        .then(function (fileDocument) {
            reply(fileDocument);
        })
        .catch(function () {
            var error = Boom.create(500, 'unexpected error during read file');
            reply(error);
        });
}

function handleGetRawFile(request, reply) {
    FileService
        .readRawFile(request.params.id)
        .then(function (rawFile) {
            reply(rawFile);
        })
        .catch(function () {
            var error = Boom.create(500, 'unexpected error during raw read process');
            reply(error);
        });
}

function handlePostFile(request, reply) {
    FileService
        .saveFile(request.payload)
        .then(function (fileDocument) {
            reply(fileDocument);
        })
        .catch(function () {
            var error = Boom.create(500, 'unexpected error during save process');
            reply(error);
        });
}

// exported api

module.exports = [
    {
        path: '/api/file',
        method: 'POST',
        handler: handlePostFile
    },
    {
        path: '/api/file/{id}/raw',
        method: 'GET',
        handler: handleGetRawFile
    },
    {
        path: '/api/file/{id}',
        method: 'GET',
        handler: handleGetFile
    }
];