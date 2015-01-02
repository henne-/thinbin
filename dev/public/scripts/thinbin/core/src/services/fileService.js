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

            file.viewFileUrl = appUrl + '#/plaintext/' + file.id;
            file.downloadFileUrl = apiUrl + '/file/' + file.id + '/raw';

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

            return $upload.upload({
                url: '/api/file',
                method: 'POST',
                data: formdata,
                file: upload,
                fileName: upload.name
            });
        }

        function readPlaintextFileById(fileId) {
            return Restangular
                .one('file', fileId)
                .get()
                .then(decorateFile);
        }

        return {
            savePlaintextFile: savePlaintextFile,
            readPlaintextFileById: readPlaintextFileById,
            saveBinaryFile: saveBinaryFile
        }
    }]);
