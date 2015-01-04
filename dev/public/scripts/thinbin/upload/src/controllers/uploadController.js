angular.module('io.risu.thinbin.upload')
    .controller('UploadController',
    ['$scope', '$routeParams', '$location', '$timeout', 'UploadService', 'FileService', '$upload',
        function ($scope, $routeParams, $location, $timeout, UploadService, FileService) {

            $scope.isProcessing = false;
            $scope.method = $routeParams.method;
            $scope.file = undefined;

            if(['binary', 'plaintext'].indexOf($scope.method) === -1 ) {
                $scope.method =  '_plaintext';
            } else {
                $scope.method = '_' + $scope.method;
            }

            $scope.displayModes = UploadService.getTranslatedDisplayModes();
            $scope.defaultMode  = $scope.displayModes[$scope.method];

            $scope.retentions = UploadService.getTranslatedRetentions();
            var shortestRetention = Object.keys($scope.retentions)
                .reduce(function (prevKey, currKey) {
                    var prev = $scope.retentions[prevKey],
                        curr = $scope.retentions[currKey];

                    return prev < curr ? prevKey : currKey;
                });

            $scope.defaultRetention = $scope.retentions['_24_hours'];

            $scope.onFormSubmit = function onSubmitClick() {
                $scope.isProcessing = true;

                if($scope.uploadForm.data.filetype === 'text/plain') {
                    FileService.savePlaintextFile($scope.uploadForm.data)
                        .then(onSuccess, onError);
                } else {
                    FileService.saveBinaryFile($scope.uploadForm.data, $scope.file)
                        .then(function(response) { return response.data; })
                        .then(onSuccess, onError);
                }

                function onSuccess(response) {
                    var url = ['/upload', response.id , 'done'].join('/');
                    $location.path(url);
                }

                function onError(response) {
                    var error = response.data;

                    $scope.errorMessage = error.message;
                    $scope.isProcessing = false;

                    $timeout(function () {
                        $scope.errorMessage = undefined;
                    }, 5000);
                }

            };

            $scope.onFileSelected = function onFileSelected(files) {
                $scope.file = files[0];
            };
        }
    ]);