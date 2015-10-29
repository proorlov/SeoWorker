function RatingCtrl($scope) {
    var data = [
        { domen: "google.com", page: "google.com/search"}
    ];

    $scope.gridOptions = {
        rowHeight: 300,
        enableHorizontalScrollbar: 0,
        enableVerticalScrollbar: 0
    };
    $scope.gridOptions.columnDefs = [
        {   field:'domen', displayName: 'Домен', width:  150},
        {   field:'page', displayName: 'Страница', width:  150 },
        {
            field: 'spark',
            displayName: 'График',
            cellTemplate: '<div class="ui-grid-cell-contents">' +
                            '<nvd3 options="row.entity.spark.options" data="row.entity.spark.data"></nvd3>' +
                            '</div>'
        }
    ];
    data.forEach(function (d, num) {
        d.spark = {
            options: {
                chart: {
                    type: 'multiChart',
                    margin: {
                        top: 30,
                        right: 80,
                        bottom: 50,
                        left: 70,
                    },
                    tooltip: {
                        /*headerFormatter: function (d) {
                            return d3.time.format('%d/%m/%Y')(d);
                        },
                        valueFormatter: function(d) {
                            console.log(d);
                            return Math.round(d);
                        },
                        keyFormatter: function(d) {
                            return d;
                        },*/
                        contentGenerator: function(data){
                            var key = data.series[0].key,
                                x =  d3.time.format('%d/%m/%Y')(data.point.x),
                                y = key === 'Продвинутость' ? data.point.y + ' %'
                                                            : data.point.y + ' место';
                            return '<h3>' + x + '</h3>' +
                                    '<p>' + key + ': ' + y + '</p>';
                        }
                    },
                    xAxis: {
                        tickFormat: function(d){
                            return  d3.time.format('%d/%m/%Y')(new Date(d));
                        }
                    },
                    yAxis1: {
                        rotateYLabel: true,
                        axisLabelDistance: -10,
                        axisLabel: 'Продвинутость(%)',
                        tickFormat: function(d){
                            return Math.round(d);
                        }
                    },
                    yAxis2: {
                        tickFormat: function(d){
                            return Math.round(d);
                        },
                        axisLabel: 'Место в выдаче',
                        rotateYLabel: true
                    },
                    yDomain2: [50, 1],
                    yDomain1: [0, 100],
                    x: function (xd) {
                        return xd.x;
                    },
                    y: function (xd) {
                        return Math.round(xd.y);
                    }
                },
                styles: {
                    classes: {
                        rating: true
                    }
                }
            },
            data: dataEx(num)
        };
    });
    $scope.gridOptions.data = data;

    function dataEx() {
        var d1 = [],d2 = [], date = [], i = 1;

        for(i; i < 32; i += 1){
            date.push(new Date('2015-09-'+i));
        }
        date.forEach(function (date) {
            d1.push({x: date, y: 100*Math.random()});
            d2.push({x: date, y: 20*Math.random()});
        });


        //Line chart data should be sent as an array of series objects.
        return [
            {
                values: d1,      //values - represents the array of {x,y} data points
                key: 'Продвинутость', //key  - the name of the series.
                color: '#ff7f0e',  //color - optional: choose your own line color.
                type: 'line',
                yAxis: 1
            },
            {
                values: d2,
                key: 'Место в выдаче',
                color: '#7777ff',
                type: 'line',
                yAxis: 2
            }
        ];
    };
}

angular.module('seoControllers').controller('RatingCtrl', RatingCtrl);
