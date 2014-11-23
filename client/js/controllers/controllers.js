'use strict';
/* Controllers */
var seoControllers = angular.module('seoControllers', []);

seoControllers.controller('SitesCtrl', ['$scope', '$window', 'SiteService', 'Params',
    function ($scope, $window, SiteService, Params) {

        $scope.formData = {url: 'facebook.com', keyWords: 'Добро пожаловать'};
        $scope.error = {msg: ""};

        var load = function () {
            SiteService.query({},
                function (result) {
                    console.log('sites are reseived');
                    $scope.sites = result;
                },
                function (response) {
                    console.log('get sites return ERROR!', response);
                    $scope.sites = [];
                });
        };
        load();


        // when submitting the add site, send the text to the node API
        $scope.createSite = function () {
            $scope.error.msg = "";
            //console.log($scope.formData);
            SiteService.save($scope.formData,
                function () {
                    $scope.formData = {};
                    $scope.error.msg = "";
                    console.log('site is saved');
                    load();
                },
                function (response) {
                    console.log('site is saved WITH ERROR!', response);
                });

        };

        $scope.getParams = function (site) {
            site.params = 'грузятся...';
            Params.calculation({ site_id: site.id, key_words: $scope.formData.keyWords})
                .then(function (res) {
//                var url = 'files/' + site.path;
//                console.log(url);
//                $window.open(url);
                    console.log("параметры получены");
                    site.params = '';
                    for (var key in res.data) {
                        site.params += res.data[key].name + ': ' + res.data[key].val + '<br>';
                    }


                })
                .catch(function (err) {
                    console.log("параметры НЕ получены, ", err)
                    site.params = 'ошибка при получении';
                })
        }

    }]);


seoControllers.controller('MainCtrl', ['$scope', 'SiteService', 'Params', 'CaptchaModal',
    function ($scope, SiteService, Params, CaptchaModal) {

        $scope.formData = {keyWords: 'Добро пожаловать', site: null, url: ""};
        $scope.sites = [];
        $scope.params = [];
        $scope.loading = false;

        var load = function () {
            $scope.loading = true;
            SiteService.query({},
                function (result) {
                    console.log('sites are reseived');
                    $scope.sites = createTree(result);
                    $scope.loading = false;
                },
                function (response) {
                    console.log('get sites return ERROR!', response);
                    $scope.sites = [];
                    $scope.loading = false;
                });
        };
        load();

        var createTree = function (sites) {
            if (!sites) {
                return [];
            }
            var tree = [];
            for (var i = 0; i < sites.length; i++) {
                var f = function (site) {
                    //console.log("site", site);
                    var domen = sites[i].url.match(/(?:http:\/\/|https:\/\/|)(?:www.|)([^\/]+)\/?(.*)/)[1];
                    //console.log("domen", domen);
                    var result = tree.filter(function (v) {
                        return v.title === domen;
                    })
                    //console.log("match", result);
                    var s = {title: sites[i].url, nodes: [], id: sites[i].id, url: sites[i].url,
                        date_create: sites[i].date_create, raw_html: sites[i].raw_html};
                    if (result.length > 0) {
                        result[0].nodes.push(s);
                    } else {
                        tree.push({title: domen, nodes: [s]});
                    }
                };
                f(sites[i]);
            }
            //console.log(sites, tree);
            return tree;
        };

        $scope.getParams = function () {
            if (!$scope.formData.keyWords || !$scope.formData.site) {
                return;
            }
            $scope.loading = true;
            Params.calculation($scope.formData.site.id,  $scope.formData.keyWords)
                .then(function (res) {
//                var url = 'files/' + site.path;
//                console.log(url);
//                $window.open(url);
                    console.log("параметры получены");
                    $scope.params = res.data;
                    $scope.loading = false;
                })
                .catch(function (err) {
                    console.log("параметры НЕ получены, ", err)
                    $scope.params = [];
                    $scope.loading = false;
                })
        }

        $scope.remove = function (scope) {
            //console.log("remove");
            scope.remove();
        };

        $scope.toggle = function (scope) {
            //console.log("toggle");
            scope.toggle();
        };

        $scope.newSite = function () {
            //console.log("newSite");
            if (!$scope.formData.url) {
                return;
            }
            $scope.loading = true;
            SiteService.save({url: $scope.formData.url},
                function () {
                    $scope.formData.url = "";
                    console.log('site is saved');
                    load();
                    $scope.loading = false;
                },
                function (response) {
                    console.log('site is saved WITH ERROR!', response);
                    $scope.loading = false;
                }
            );
        };

        $scope.select = function (scope) {
            //console.log("select");
            var nodeData = scope.$modelValue;
            if (nodeData.id) {
                $scope.formData.site = nodeData;
                $scope.params = [];
            }
            ;
        };


    }]);

seoControllers.controller('CaptchaTestCtrl', ['$scope', 'CaptchaModal', 'Captcha',
    function ($scope, CaptchaModal, Captcha) {
        $scope.state = 'Ждем команды "Начать".'
        $scope.test_url = 'http://yandex.ru/yandsearch?text=погода';
        $scope.captcha = null;
        $scope.cookies = null;

        $scope.test = function () {
            $scope.state = "Посылаем запрос к яндексу"
            Captcha.test($scope.test_url, $scope.captcha, $scope.cookies )
                .then(function (res) {
                    console.log("первый результат", res.data)
                    $scope.cookies = res.data.cookies;

                    if (res.data.captcha){
                        $scope.captcha  = res.data.res;
                        $scope.state = "Получили капчу" + JSON.stringify($scope.captcha);

                        CaptchaModal.show($scope.captcha.img)
                            .then(function (result) {
                                if (result.answer && result.captcha) {
                                    $scope.state = 'Капча введена, посылаем повторно запрос.'

                                    $scope.captcha.rep = result.captcha;
                                    $scope.test();
                                } else {
                                    $scope.state = 'Вы не ввели капчу или нажали "Отмена". Попробуйте еще раз.'
                                }
                            })
                    } else {
                        $scope.captcha  = null;
                        $scope.state = "Запрос сервера завершен нормально" ;
                    }

                })
                .catch(function (err) {
                    $scope.captcha = null;
                    //$scope.cookies = null;
                    console.log("Ошбика получения результата", err)
                    $scope.state = "Какие-то проблемы. Попробуйте еще раз."
                })

        }
    }]);

