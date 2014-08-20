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
				val: (row < 3 && col < 3) ? rand(2) : 0,
				row: row,
				col: col
			};

			$scope.grid[row + ":" + col] = block;
		}
	}

	//
	// Move
	// 
	// Iterate through all blocks and create comparisons
	// 
	// Usage: ... (todo)
	// 
	// @TODO
	// - Lot of redundant code, need to minimize
	// - Down and Right need reverse looping
	// 

	$scope.move = function(dir){
		$scope.operand = dir;

		// default loop
		if(dir == "up" || dir == "left"){

			angular.forEach($scope.grid, function(block, key){

				// Only process blocks with value
				if(block.val){

					// Only loop through 2nd row and higher
					if(dir == "up" && block.row > 0){

						var compareRow = block.row - 1,
							iterate = true;

						// Check for a compareBlock if the value is higher than 0
						do{
							var compareBlock = $scope.grid[compareRow + ":" + block.col];
							var status = compare(block, compareBlock);

							if(status == "multiply" || status == "stuck" || compareRow == 0){
								iterate = false;
							} else {
								block = status;
								compareRow--;
							}

						} while(iterate);
					}
					// Only loop through 2nd column and higher
					else if(dir == "left" && block.col > 0){

						var compareCol = block.col -1,
							iterate = true;

						// Check for a compareBlock if the value is higher than 0
						do{
							var compareBlock = $scope.grid[block.row + ":" + compareCol];
							var status = compare(block, compareBlock);

							if(status == "multiply" || status == "stuck" || compareCol == 0){
								iterate = false;
							} else {
								block = status;
								compareCol--;
							}

						} while(iterate);

					}
				}
			});
		}
	}

	// 
	// Compare
	// 
	// Compare blocks and perform operation when needed
	// 
	// Usage: ... (todo)
	// 
	// @TODO
	// Compare should do only that, not perform operations
	// Have Move() perform the actual operation, compare only returns status
	// 

	function compare(block, compareBlock){

		// Check if current block value is equal to prevBlock value
		if(block.val == compareBlock.val){

			// Clear current block
			block.val = 0;

			// Multiply prevBlock value by 2
			compareBlock.val *= 2;

			// Return end status
			return "multiply";
		}

		// In case compareBlock is empty, shift
		else if(compareBlock.val == 0){

			// Update empty block with current block value
			compareBlock.val = block.val;

			// Clear current block
			block.val = 0;

			// Return shifted block for another iteration
			return compareBlock;
		}

		// Return end status
		else return "stuck";
	}
});

// Create rounded random number between 0 and limit
function rand(limit){
	return Math.round(Math.random() * limit);
}

// Create random number between 2 and 2^(pow)
function randPow(pow){
	return Math.pow(2, 1 + Math.floor(Math.random() * pow));
}