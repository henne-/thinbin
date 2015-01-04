angular.module('io.risu.thinbin')
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/start', {
                templateUrl: 'scripts/thinbin/landing/src/views/controllers/landingView.html',
                controller: 'LandingController'
            })
            .when('/upload/:method', {
                templateUrl: 'scripts/thinbin/upload/src/views/controllers/uploadView.html',
                controller: 'UploadController'
            })
            .when('/upload/:id/done', {
                templateUrl: 'scripts/thinbin/upload/src/views/controllers/uploadDoneView.html',
                controller: 'UploadDoneController'
            })
            .when('/show/:id/:filename', {
                templateUrl: 'scripts/thinbin/plaintext/src/views/controllers/plaintextView.html',
                controller: 'PlaintextController'
            })
            .otherwise({
                redirectTo: '/start'
            });
    }]);