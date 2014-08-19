var app = angular.module('puzzle', []);

app.controller('puzzleController', function ($scope) {

	var settings = {
		gridSize: 4
	}

	settings.blockWidth = 100 / settings.gridSize;
	settings.blockHeight = 100 / settings.gridSize;
	settings.blockCount = Math.pow(settings.gridSize, 2);

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
				val: (row < 4 && col < 4) ? rand(2) : 0,
				row: row,
				col: col
			};

			$scope.grid[row + ":" + col] = block;
		}
	}

	$scope.move = function(dir){
		$scope.operand = dir;

		// default loop
		if(dir == "up" || dir == "left"){

			angular.forEach($scope.grid, function(block, key){

				// Only process blocks with value
				if(block.val){

					// Only loop through 2nd row and higher
					if(dir == "up" && block.row > 0){
						var compareBlock = $scope.grid[(block.row - 1) + ":" + block.col];
						
						compare(block, compareBlock);
					}
					// Only loop through 2nd column and higher
					else if(dir == "left" && block.col > 0){
						var compareBlock = $scope.grid[block.row + ":" + (block.col - 1)];
						
						compare(block, compareBlock);
					}
				}
			});
		}
	}

	function compare(block, compareBlock){

		// Check if current block value is equal to prevBlock value
		if(block.val == compareBlock.val){

			// Clear current block
			block.val = 0;

			// Multiply prevBlock value by 2
			compareBlock.val *= 2;
		}

		// In case compareBlock is empty
		else if(compareBlock.val == 0){

			// Update empty block with current block value
			compareBlock.val = block.val;

			// Clear current block
			block.val = 0;
		}
	}
});

// Create random number between 2 and 2^(pow)
function rand(pow){
	return Math.pow(2, 1 + Math.floor(Math.random() * pow));
}