var productApp = angular.module('productApp', ['ngMaterial']);

productApp.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.withCredentials = true;
}])

productApp.factory('productService', ['$http', '$q', function ($http, $q) {
    return {
        getProductList: function () {
            var config = {
                'header': {
                    'Access-Control-Allow-Credentials': true
                }
            };
            // return $http.get('products.json').then(function (response) {
            return $http.get('https://s3.amazonaws.com/open-to-cors/assignment.json', config).then(function (response) {
                if (response && response.status === 200 && response.data) {
                    return response.data;
                }
                else {
                    return $q.reject(response);
                }
            });
        },
        sortProducts: function (objToSort, propertyName, sortOrder) {

            function findValue(obj) {
                var val = obj;
                val = val[propertyName];
                if (val === undefined) {
                    val = 0;
                }
                if (propertyName !== 'title') {
                    return parseInt(val);
                }
                else {
                    return val.toLowerCase();
                }

            }

            function sortProductsAsc(a, b) {
                var valueA = findValue(a);
                var valueB = findValue(b);
                if (valueA < valueB)
                    return -1;
                if (valueA > valueB)
                    return 1;
                return 0;
            }

            function sortProductsDsc(a, b) {
                var valueA = findValue(a);
                var valueB = findValue(b);
                if (valueA < valueB)
                    return 1;
                if (valueA > valueB)
                    return -1;
                return 0;
            }

            if (!sortOrder || sortOrder === 'dsc') {
                return objToSort.sort(sortProductsDsc);
            }
            else if (sortOrder === 'asc') {
                return objToSort.sort(sortProductsAsc);
            }
        }
    }
}]);

productApp.controller('homePageController', ['productService', function (productService) {
    var self = this;

    self.toggleColumn = function (columnType) {
        toggleColumn(columnType);
    };

    self.onChangeSearchTitle = function () {
        onChangeSearchTitle();
    }

    self.onChangePriceParam = function () {
        onChangePriceParam();
    };


    var originalProductList = [];
    self.productList = [];
    self.productListLoading = false;
    self.sortOrder = '';
    self.searchText = '';
    self.searchParams = {};
    self.priceParams = {};
    self.toggleProperty = 'popularity';

    function initController() {
        getProductList();
    }

    function getProductList() {
        self.productListLoading = true;
        productService.getProductList().then(function (productList) {
            self.productListLoading = false;
            if (productList && productList.products && angular.toJson(productList.products) !== '{}') {
                prepareProductList(productList.products);
            }
        }, function () {
            self.productListLoading = false;
        });
    }

    function prepareProductList(products) {
        var productList = [];
        for (var productId in products) {
            if (products.hasOwnProperty(productId)) {
                productList.push(products[productId]);
            }
        }
        originalProductList = productList;
        self.productList = productList;
        toggleColumn(self.toggleProperty);
    }

    function toggleColumn(columnType) {
        self.toggleProperty = columnType;
        self.sortOrder = self.sortOrder === 'dsc' ? 'asc' : 'dsc';
        self.productList = productService.sortProducts(self.productList, columnType, self.sortOrder);
    }

    function onChangeSearchTitle_old() {
        var result = angular.copy(originalProductList);
        function replaceLogicalOperators(searchStringParts) {
            var evalArray = angular.copy(searchStringParts);
            var evalArrayLength = evalArray.length;
            for (var a = 0; a < evalArrayLength; a++) {
                if (evalArray[a] === 'and') {
                    evalArray[a] = '&&';
                }
                if (evalArray[a] === 'or') {
                    evalArray[a] = '||';
                }
            }
            return evalArray;
        }
        function replaceLogicalOperators(searchStringParts) {
            var evalArray = angular.copy(searchStringParts);
            var evalArrayLength = evalArray.length;
            for (var a = 0; a < evalArrayLength; a++) {
                if (evalArray[a] === 'and') {
                    evalArray[a] = '&&';
                }
                if (evalArray[a] === 'or') {
                    evalArray[a] = '||';
                }
            }
            return evalArray;
        }
        function prepareSearchString(searchText) {
            var searchObj = {
                'valid': true
            }
            var comparisonOperator = '';
            if (searchText.includes('BELOW')) {
                comparisonOperator = 'BELOW';
            }
            else if (searchText.includes('ABOVE')) {
                comparisonOperator = 'BELOW';
            }
            if (comparisonOperator) {
                var operations = searchText.split(comparisonOperator);
                operations.map(opertion => opertion.trim());
                searchObj.logicalOperation = operations[0];
                searchObj.comparisonValue = operations[1];
                searchObj.comparisonOperator = comparisonOperator;
                if (searchObj.comparisonValue === undefined || searchObj.comparisonValue === '') {
                    searchObj.valid = false;
                }
            }
            else {
                searchObj.logicalOperation = searchText;
            }
            if (searchObj.valid === true) {
                var logicalOperationParts = searchObj.logicalOperation.split(' ');
                var logicalOperatorsFound = (logicalOperationParts.indexOf('AND') !== -1 || logicalOperationParts.indexOf('OR') !== -1) && logicalOperationParts[logicalOperationParts.length - 1] !== 'AND' && logicalOperationParts[logicalOperationParts.length - 1] !== 'OR';
                if (logicalOperatorsFound !== true) {
                    searchObj.valid = false;
                }
            }
        }
        if (self.searchText) {
            var filteredResult = []
            var searchObj = prepareSearchString(self.searchText);
            filteredResult = result.filter(function (productObj) {
                var titleParts = productObj.title.split(' '), searchStringParts = self.searchText.split(' '), searchStringPartsLength = searchStringParts.length;
                titleParts = titleParts.map(title => title.toLowerCase());
                var logicalOperatorsFound = (searchStringParts.indexOf('AND') !== -1 || searchStringParts.indexOf('OR') !== -1) && searchStringParts[searchStringParts.length - 1] !== 'AND' && searchStringParts[searchStringParts.length - 1] !== 'OR';
                var comparisonOperatorsFound = (searchStringParts.indexOf('ABOVE') !== -1 || searchStringParts.indexOf('BELOW') !== -1) && searchStringParts[searchStringParts.length - 1] !== 'ABOVE' && searchStringParts[searchStringParts.length - 1] !== 'BELOW';
                if (comparisonOperatorsFound) {
                    logical
                }

                searchStringParts = searchStringParts.map(text => text.toLowerCase());
                for (var index = searchStringPartsLength - 1; index >= 0; index--) {
                    if (!searchStringParts[index]) {
                        searchStringParts.splice(index, 1);
                    }
                }
                searchStringPartsLength = searchStringParts.length;
                if (searchStringParts.indexOf('') !== -1) {
                    searchStringParts.splice(searchStringParts.indexOf(''), 1);
                }

                if (logicalOperatorsFound === true) {
                    searchStringParts = replaceLogicalOperators(searchStringParts);

                    for (var a = 0; a < searchStringPartsLength; a++) {
                        if (searchStringParts[a] !== '&&' && searchStringParts[a] !== '||') {
                            searchStringParts[a] = titleParts.indexOf(searchStringParts[a]) !== -1;
                        }
                    }
                    evalString = searchStringParts.join('');
                    if (eval(evalString)) {
                        return productObj;
                    }
                }
                else {
                    var matchedKeyWords = 0;
                    for (var a = 0; a < searchStringPartsLength; a++) {
                        if (titleParts.indexOf(searchStringParts[a].toLowerCase()) !== -1) {
                            matchedKeyWords += 1;
                        }
                    }
                    if (matchedKeyWords === searchStringPartsLength) {
                        return productObj;
                    }
                }
            });
            result = angular.copy(filteredResult);
        }
        self.productList = angular.copy(result);
    }

    function onChangeSearchTitle() {
        var result = angular.copy(originalProductList);

        function prepareSearchString(searchText) {
            var searchObj = {
                'valid': true
            }
            var comparisonOperatorHash = {
                'BELOW': '<',
                'ABOVE': '>'
            };
            var logicalOperatorHash = {
                'AND': '&&',
                'OR': '||'
            };

            var comparisonOperator = '';
            if (searchText.includes('BELOW')) {
                comparisonOperator = 'BELOW';
            }
            else if (searchText.includes('ABOVE')) {
                comparisonOperator = 'ABOVE';
            }
            if (comparisonOperator) {
                var operations = searchText.split(comparisonOperator);
                operations = operations.map(opertion => opertion.trim());
                searchObj.searchString = operations[0];
                searchObj.searchTextParts = searchObj.searchString.split(/AND | OR/);
                var searchTextPartsLength = searchObj.searchTextParts.length;
                for (var a = searchTextPartsLength - 1; a >= 0; a--) {
                    if (searchObj.searchTextParts[a] === '') {
                        searchObj.searchTextParts.splice(a, 1);
                    }
                }
                searchObj.searchTextParts = searchObj.searchTextParts.map(searchText => searchText.trim());
                searchObj.comparisonValue = operations[1];
                searchObj.comparisonOperator = comparisonOperatorHash[comparisonOperator];
                if (searchObj.comparisonValue === undefined || searchObj.comparisonValue === '') {
                    searchObj.valid = false;
                }
            }
            else {
                searchObj.searchString = searchText;
            }
            if (searchObj.valid === true) {
                searchObj.searchTextParts = searchObj.searchString.split(/AND | OR/);
                var searchTextPartsLength = searchObj.searchTextParts.length;
                for (var a = searchTextPartsLength - 1; a >= 0; a--) {
                    if (searchObj.searchTextParts[a] === '') {
                        searchObj.searchTextParts.splice(a, 1);
                    }
                }
                searchObj.searchTextParts = searchObj.searchTextParts.map(searchText => searchText.trim());
                searchObj.logicalOperators = [];
                var logicalOperationParts = searchObj.searchString.split(' ');
                var logicalOperationPartsLength = logicalOperationParts.length;
                for (var index = logicalOperationPartsLength - 1; index >= 0; index--) {
                    if (!logicalOperationParts[index]) {
                        logicalOperationParts.splice(index, 1);
                    }
                    // if (logicalOperationParts[index] === 'AND' || logicalOperationParts[index] === 'OR') {
                    //     searchObj.logicalOperators.push(logicalOperatorHash[logicalOperationParts[index]]);
                    // }
                }
                var logicalOperationPartsLength = logicalOperationParts.length;
                for (var index = logicalOperationPartsLength - 1; index >= 0; index--) {
                    if (logicalOperationParts[index] === 'AND' || logicalOperationParts[index] === 'OR') {
                        searchObj.logicalOperators.push(logicalOperatorHash[logicalOperationParts[index]]);
                    }
                }
                searchObj.logicalOperators.reverse();
                searchObj.valid = searchObj.logicalOperators.length > 0 && searchObj.logicalOperators.length === searchObj.searchTextParts.length - 1;
            }
            return searchObj;
        }

        function checkQueryString(queryString, titleParts) {
            var searchTextParts = queryString.split(' '), searchStringPartsLength = searchTextParts.length;
            var matchedKeyWords = 0;
            for (var a = 0; a < searchStringPartsLength; a++) {
                if (titleParts.indexOf(searchTextParts[a].toLowerCase()) !== -1) {
                    matchedKeyWords += 1;
                }
            }
            return matchedKeyWords === searchStringPartsLength;
        }

        if (self.searchText) {
            var filteredResult = []
            var searchObj = prepareSearchString(self.searchText);
            console.log(searchObj);
            filteredResult = result.filter(function (productObj) {
                var titleParts = productObj.title.split(' ');
                titleParts = titleParts.map(title => title.toLowerCase());

                if (searchObj.valid === true) {
                    var searchTextPartsLength = searchObj.searchTextParts.length, evalString = '';
                    for (var a = 0; a < searchTextPartsLength; a++) {
                        // evalString += titleParts.indexOf(searchObj.searchTextParts[a].toLowerCase()) !== -1;
                        evalString += checkQueryString(searchObj.searchTextParts[a], titleParts);
                        if (a < searchTextPartsLength - 1) {
                            evalString += searchObj.logicalOperators[a];
                        }
                    }
                    if (eval(evalString)) {
                        if (searchObj.comparisonValue !== undefined && searchObj.comparisonValue !== '' && searchObj.comparisonOperator) {
                            evalString = '';
                            evalString = parseInt(productObj.price) + ' ' + searchObj.comparisonOperator + ' ' + parseInt(searchObj.comparisonValue);
                            if (eval(evalString)) {
                                return productObj;
                            }
                        }
                        else {
                            return productObj;
                        }
                    }
                }
                else {
                    var searchTextParts = searchObj.searchTextParts[0].split(' '), searchStringPartsLength = searchTextParts.length;
                    var matchedKeyWords = 0;
                    for (var a = 0; a < searchStringPartsLength; a++) {
                        if (titleParts.indexOf(searchTextParts[a].toLowerCase()) !== -1) {
                            matchedKeyWords += 1;
                        }
                    }
                    if (matchedKeyWords === searchStringPartsLength) {
                        // if (checkQueryString(searchObj.searchTextParts[0], titleParts)) {
                        if (searchObj.comparisonOperator) {
                            if (searchObj.comparisonValue !== undefined && searchObj.comparisonValue !== '') {
                                evalString = '';
                                evalString = parseInt(productObj.price) + ' ' + searchObj.comparisonOperator + ' ' + parseInt(searchObj.comparisonValue);
                                if (eval(evalString)) {
                                    return productObj;
                                }
                            }
                        }
                        else {
                            return productObj;
                        }
                    }
                }
            });
            result = angular.copy(filteredResult);
        }
        self.productList = angular.copy(result);
    }

    function onChangePriceParam() {
        var comparisonOperatorHash = {
            'BELOW': '<',
            'ABOVE': '>'
        };
        onChangeSearchTitle();
        var result = angular.copy(self.productList);
        if (self.priceParams.range && self.priceParams.value !== undefined && self.priceParams.value !== '' && self.priceParams.value !== null) {
            var filteredResult = []
            filteredResult = result.filter(function (productObj) {
                if (isNaN(productObj.price) !== true) {
                    var evalString = parseInt(productObj.price) + ' ' + comparisonOperatorHash[self.priceParams.range] + ' ' + self.priceParams.value;
                    if (eval(evalString)) {
                        return productObj;
                    }
                }
            });
            result = angular.copy(filteredResult);
        }
        self.productList = angular.copy(result);
    }

    initController();
}]);
