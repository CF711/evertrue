'use strict';

angular.module('evertrue', ['ngRoute', 'duScroll'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'index.html',
    controller: 'EvertrueCtrl'
  });
}])

.controller('EvertrueCtrl', ['$scope', '$http', function($scope, $http) {

	$scope.height = 0;

	String.prototype.capitalizeFirstLetter = function() {
		return this.charAt(0).toUpperCase() + this.slice(1);
	}

	String.prototype.formatString = function() {
		var strParts = this.split("_");
		for (var i in strParts) {
			var val = strParts[i];
			strParts[i] = (typeof (val) !== "number" && Math.floor(val) !== val) ? val.capitalizeFirstLetter() : val; 
		}
		return strParts.join(" ");
	}

	angular.element(document).ready(function () {
        $scope.getJson();
        $scope.setHeights();
    });

	// When a new dropdown is selected it opens it at the top
	$scope.$watch(function () {
		return $('.dataView').height()
	}, function (newValue, oldValue) {
		if (newValue !== undefined) {
			if ($scope.currentSection !== undefined && $scope.height !== oldValue) {
				angular.element(document.getElementById('groups-container')).scrollTo(0, 0, 2000);
				$scope.setActiveClass($scope.currentSection.id_name, $scope.currentSection.fields[0].evertruefieldname);
				$scope.height = newValue;
			}
		}
	})

	$scope.setHeights = function() {
		var height = $(document).height();
		$(document.getElementById('groups-container')).css('height', height);
		$(document.getElementById('panel-container')).css('height', height);
	}

	$scope.getJson = function() {
		$http.get('components/data/schema.json').success(function(data) {
			$scope.setUpData(data);
		});
	}

	$scope.setUpData = function(data) {
		var formattedData = {
			general_info: {
				name:"General Info",
				id_name: 'general_info',
				fields: []
			}
		};
		for (var x in data) {
			if (data[x].data_type !== "list") {
				var field = $scope.populateFieldObject(data[x]);
				formattedData.general_info.fields.push(field);
			} else if (data[x].data_type === "list") {
				formattedData[data[x].containing_object.name] = {
					name: data[x].containing_object.name.formatString(),
					id_name: data[x].containing_object.name,
					fields: []
				};
				var properties = data[x].containing_object.properties;
				for (var y in properties) {
					var field = $scope.populateFieldObject(properties[y]);
					formattedData[data[x].containing_object.name].fields.push(field);
				}
			}
		}
   		$scope.groups = formattedData;
	}

	$scope.setDefaultSection = function(key, data) {
		$scope.currentSection = data[key];
		$(document.getElementById(key)).addClass('in');
	}

	$scope.populateFieldObject = function(data) {
		for (var i in data.app_keys) {
			data.app_keys[i] = data.app_keys[i].formatString();
		}
		return {
			type: data.data_type.formatString(),
			usage: data.app_keys,
			display_name: data.name.formatString(),
			evertruefieldname: data.name
		};
	}

	// Have to do since angular uses # to navigate
	$scope.openAccordion = function(groupName) {
		var domObject = $('#'+ groupName +"-panel");
		if(!domObject.hasClass('in')) {
			$('.panel-collapse').removeClass('in');
			$('.panel-heading').removeClass('active-group');
			domObject.addClass('in');
			$scope.setCurrentSection(groupName);
			$(document.getElementById(groupName)).addClass('active-group');
		}
	}

	$scope.setCurrentSection = function (groupName) {
		$scope.currentSection = $scope.groups[groupName];
		$('.container').trigger('contentchanged');
	}

	$scope.scrollTarget = function(target, groupName) {
		$scope.scrollActive = true;
		$scope.setActiveClass(groupName, target);
		var scrollSection = angular.element(document.getElementById(target));

		angular.element(document.getElementById('groups-container')).scrollTo(scrollSection, 0, 2000);
		$scope.scrollActive = false;
	}

	$scope.setActiveClass = function(groupName, target) {
		$scope.removeActiveClass();
		$(document.getElementById(("panel-" + groupName + "-" + target))).addClass('active');
	}

	$scope.removeActiveClass = function() {
		$(".panel-body").removeClass("active");
	}

}]);