angular.module('io.risu.thinbin.plaintext')
    .controller('PlaintextController',
    ['$scope', '$routeParams', '$http', 'UploadService', 'FileService',
        function ($scope, $routeParams, $http, UploadService, FileService) {

            FileService
                .readFileById($routeParams.id)
                .then(function (archive) {
                    var fileName = $routeParams.filename,
                        file = archive.files[fileName];

                    $scope.archive = file;
                    $scope.archive.expiresAt = moment(archive.expiresAt).calendar();

                    $http.get(archive.rawFileUrl).then(function(response) {
                        $scope.source = response.data;
                    })
                });
        }
    ]);