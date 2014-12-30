angular.module('io.risu.thinbin')
    .config(['SettingServiceProvider', 'RestangularProvider', 'hljsServiceProvider',
        function (SettingServiceProvider, RestangularProvider, hljsServiceProvider) {
            RestangularProvider.setBaseUrl('/api');

            hljsServiceProvider.setOptions({
                tabReplace: '    '
            });
        }]);
