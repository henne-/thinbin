angular.module('io.risu.thinbin.core')
    .factory('FileService', ['$location', 'SettingService', 'Restangular', '$upload', function ($location, SettingService, Restangular, $upload) {

        // helpers

        function decorateFile(file) {
            var apiUrl = SettingService.get('apiUrl');

            var appUrl = [
                $location.protocol(),
                '://',
                $location.host(),
                $location.port() ? ':' + $location.port() : '',
                '/'
            ].join('');

            var fileName = Object.keys(file.files)[0];

            if(file.files[fileName].contentType === 'text/plain') {
                file.viewFileUrl = appUrl + ['#/show', file.id, fileName].join('/');
            }

            file.rawFileUrl = [apiUrl, 'file', file.id, fileName].join('/');
            file.downloadFileUrl = [apiUrl, 'file', file.id, 'download', fileName].join('/');


            return file;
        }

        // public api functions

        function savePlaintextFile(formdata) {
            return Restangular
                .service('file')
                .post(formdata)
                .then(decorateFile);
        }

        function saveBinaryFile(formdata, upload) {
            formdata.filename = upload.name;
            formdata.mimetype = upload.type;

            return $upload.upload({
                url: '/api/file',
                method: 'POST',
                data: formdata,
                file: upload
            });
        }

        function readFileById(fileId) {
            return Restangular
                .one('file', fileId)
                .get()
                .then(decorateFile);
        }

        return {
            savePlaintextFile: savePlaintextFile,
            saveBinaryFile: saveBinaryFile,
            readFileById: readFileById
        }
    }]);
