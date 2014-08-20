var app = angular.module('puzzle', []);

app.controller('puzzleController', function ($scope) {

	var settings = {
		gridSize: 4
	}

	settings.blockWidth = 100 / settings.gridSize;
	settings.blockHeight = 100 / settings.gridSize;

	// make settings public to the scope
	angular.extend($scope, settings);

	// create empty grid object
	$scope.grid = {};

	// initial operand
	$scope.operand = "awaiting input...";

	// create row loop
	for(var row = 0; row < settings.gridSize; row++){

		// create column loop
		for(var col = 0; col < settings.gridSize; col++){
			var block = {

				// create random value for top 4 blocks
				val: (row < 3 && col < 3) ? rand(2) : 0,
				row: row,
				col: col
			};

			$scope.grid[row + ":" + col] = block;
		}
	}

	$scope.left = function(){	$scope.operand = "left"; }
	$scope.right = function(){	$scope.operand = "right"; }
	$scope.up = function(){		$scope.operand = "up"; }
	$scope.down = function(){	$scope.operand = "down"; }
});

// Create random number between 2 and 2^(pow)
function rand(pow){
	return Math.pow(2, 1 + Math.floor(Math.random() * pow));
}