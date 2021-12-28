let app = angular.module('myApp', ['ngResource', 'ngRoute', 'ngCookies', 'pascalprecht.translate']);
app.config(['$locationProvider', function($locationProvider) {
    $locationProvider.hashPrefix('');
    $locationProvider.html5Mode(true);
}]);

app.run(['$rootScope', '$location', '$document', '$cookies','langService', function($rootScope, $location, $document, $cookies, langService) {
    
    console.log("AppRun");
    $rootScope.$on('$routeChangeSuccess', function() {
        gtag('config', 'UA-138901721-2', {
            'app_name': 'CraneBIT',
            'page_path': $location.path()
        });
    });

    $rootScope.existCookies = function () {
        return $cookies.get('crane-bit') === 'true' ? true : false;
    };

    $rootScope.lang = langService.getLang();
    langService.changeLanguage($rootScope.lang);
}]);

app.config(function($translateProvider) {
//app.config(function ($translateProvider) {
    $translateProvider
        .useStaticFilesLoader({
            prefix: '/locales/local-',
            suffix: '.json'
        })
        // remove the warning from console log by putting the sanitize strategy
        .useSanitizeValueStrategy('sanitizeParameters')
        .preferredLanguage((navigator.language || navigator.userLanguage).substring(0, 2));
        // Use eng translation as fallback (default)
    $translateProvider.fallbackLanguage(['en']);
});


app.factory('langService', function($window, $rootScope, $translate){
    let languages = [
        {
            flag : 'gb',
            id : 'en',
            name : 'English'
        },
        {
            flag : 'de',
            id : 'de',
            name : 'Deutch'
        },
        {
            flag : 'es',
            id : 'es',
            name : 'Español'
        },
        {
            flag : 'ru',
            id : 'ru',
            name : 'Русский'
        },
        {
            flag : 'fr',
            id : 'fr',
            name : 'Français'
        },
        {
            flag : 'pt',
            id : 'pt',
            name : 'Português'
        },
        {
            flag : 'cn',
            id : 'zh',
            name : '简体中文'
        },
        {
            flag : 'kr',
            id : 'ko',
            name : '한국어'
        },
        {
            flag : 'vn',
            id : 'vi',
            name : 'Tiếng Việt'
        },
        {
            flag : 'jp',
            id : 'jp',
            name : '日本語'
        },
        {
            flag : 'in',
            id : 'in',
            name : 'Indonesia'
        },
        {
            flag : 'ae',
            id : 'ar',
            name : 'العربية'
        },
        {
            flag : 'tr',
            id : 'tr',
            name : 'Türkçe'
        }
    ];
    let lang = null;
    let curLangObject = null;
    return{
        getLang : function () {
            return $window.localStorage.lang || (navigator.language || navigator.userLanguage).substring(0, 2);
        },
        getLangObject : function () {
            return curLangObject;
        },
        changeLanguage : function (key) {
            lang = key;
            $rootScope.lang = key;
            $translate.use(key);
            curLangObject = languages.find(x => x.id === key);
            $window.localStorage.lang = key;
        },
        languages : languages
    };
});