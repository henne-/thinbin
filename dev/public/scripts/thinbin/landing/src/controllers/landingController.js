angular.module('io.risu.thinbin.landing')
    .controller('LandingController',
    ['$scope', '$location',
        function ($scope, $location) {

            $scope.onUpload = function(method) {
                var targetPath = ['/upload'];

                method = ['binary', 'plaintext'].indexOf(method) > -1 ? method : 'plaintext';
                targetPath.push(method);

                targetPath = targetPath.join('/');

                $location.path(targetPath);
            };
        }
    ]);