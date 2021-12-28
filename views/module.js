let app = angular.module('myApp', ['ngResource', 'ngRoute', 'ngCookies', 'pascalprecht.translate']);
app.config(['$locationProvider', function($locationProvider) {
    $locationProvider.hashPrefix('');
    $locationProvider.html5Mode(true);
}]);


app.controller('sucsCtrl', function($scope, $http, $window, $location) {

});
app.controller('timeoutCtrl', function($scope, $http, $window, $location) {

});

app.controller('sendCtrl', function($scope, $http, $window, $location) {
    $scope.user = {};
    $scope.errAddr = null;
    $scope.addrValid = false;
    $scope.validate = function() {
        let addr = $scope.user.addr;
        if(!(addr === undefined || addr === '')){
            if(/^(02|03)[0-9a-fA-F]{64}$/i.test(addr))
                $scope.addrValid = true;
            // regex fails
            else
                $scope.errAddr = 'ERR_SKEY_FIELD';
        }
        // Empty
        else
            $scope.errAddr = 'ERR_EMPTY_FIELD';
        // set borders
        this.addrIsValid = ($scope.addrValid) ? "" : "invalidField";

        // Final check
        if($scope.addrValid)
            this.send(addr);
    };

    $scope.request_pubkey = async function(){
        await $window.ENQweb3lib.connect()
        let pubkey = await $window.ENQweb3lib.enable()
        $scope.user.addr = pubkey.pubkey
        $scope.$apply();
    }

    $scope.generateTx = async function(){
      await $window.ENQweb3lib.connect()
      if(!$scope.user.addr){
        await $scope.request_pubkey()
      }
      let data = {
        from: {
          pubkey:$scope.user.addr,
        },
        to: '029dd222eeddd5c3340e8d46ae0a22e2c8e301bfee4903bcf8c899766c8ceb3a7d',
        tokenHash:'0000000000000000000000000000000000000000000000000000000000000001',
        value:Math.floor(Math.random()*10)*1e10,
        nonce:Math.floor(Math.random()*1e10)
      }
      $window.ENQweb3lib.sendTransaction(data)
    }

    $scope.send = function(key) {

        $http.post('/', { pubkey : key })
        .then(function(res) {
            if(res.data === true){
                $location.url('/successful');
            }
            else
                $location.url('/timeout');

        })
        .catch(function(failedResponse) {
            console.log("fail: ", failedResponse)
        });
        //let inputs = await db.get_success_transfers();
        //for(let i = 0; i < inputs.length; i++) {

        //}
    };
});

app.run(['$rootScope', '$location', '$document', '$cookies','langService', function($rootScope, $location, $document, $cookies, langService) {
    $rootScope.$on('$routeChangeSuccess', function() {
        gtag('config', 'UA-138901721-2', {
            'app_name': 'FaucetBIT',
            'page_path': $location.path()
        });
    });

    $rootScope.existCookies = function () {
        return $cookies.get('crane-bit') === 'true' ? true : false;
    };

    $rootScope.lang = langService.getLang();
    langService.changeLanguage($rootScope.lang);
}]);


 app.config(function ($routeProvider, $httpProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'views/home.html',
        controller: 'sendCtrl'
    })
    .when('/successful', {
        templateUrl: 'views/successful.html',
        controller: 'sucsCtrl'
    })
    .when('/timeout', {
        templateUrl: 'views/timeout.html',
        controller: 'timeoutCtrl'
    })
    .otherwise({
        //templateUrl: 'views/404.html'
        redirectTo: '/'
    });

    $httpProvider.interceptors.push(['$q', '$location', '$window', function($q, $location, $window) {
        return {
            'request': function (config) {
                config.headers = config.headers || {};
                if ($window.localStorage.token) {
                    config.headers['x-session-token'] = $window.localStorage.token;
                }
                return config;
            },
            'responseError': function(response) {
                if(response.status === 401 || response.status === 403) {
                    $location.path('/home').replace()
                }
                return $q.reject(response);
            }
        };
    }]);
});


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