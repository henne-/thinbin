angular.module('io.risu.thinbin.landing')
    .controller('LandingController',
    ['$scope', '$location', 'SettingService',
        function ($scope, $location, SettingService) {

            $scope.allowedPlaintextMimes = SettingService.get('allowedPlaintextMimes').join(',');
            $scope.allowedBinaryMimes    = SettingService.get('allowedBinaryMimes').join(',');

            $scope.onUpload = function(method, files) {
                var targetPath = ['/upload'];

                method = ['binary', 'plaintext'].indexOf(method) > -1 ? method : 'plaintext';
                targetPath.push(method);

                targetPath = targetPath.join('/');

                $location.path(targetPath);
            };
        }
    ]);