var app = angular.module('puzzle', []);


//HEIDI TODO
//1 - SLIDE ANIMATION
//2 - KEEPING SCORE
//3 - GAME OVER

app.controller('puzzleController', function ($scope) {

	//HIGH SCORE
	//GAME OVER

	$scope.gameOver = false;
	$scope.gameStatus = "Current Score";
	$scope.keepScore = 0;

	
	var settings = {
		gridWidth: 4,
		gridHeight: 4
	};

	angular.extend(settings, {
		blockWidth: 100 / settings.gridWidth,
		blockHeight: 100 / settings.gridHeight,
		blockCount: settings.gridWidth * settings.gridHeight
	});

	// make settings public to the scope
	angular.extend($scope, settings);

	// create empty blocks array
	$scope.blocks = [];

	// initial operand
	$scope.operand = "awaiting input...";

	var row = 0,
		col = 0;

	for(var i = 0; i < settings.blockCount; i++){

		if(i > 0 && i%settings.gridWidth == 0) row++;
		col = i%settings.gridWidth;

		var block = {
			// create random value
			// val: (i == 0 || i == 8 || i == 12) ? randPow(2) : 0,
			val: 0, //randPow(2),
			row: row,
			col: col,
			index: i
		};

		// push block element to the blocks array
		$scope.blocks.push(block);
	}

	//ON INITIATION, GENERATE 3 BLOCKS
	generateBlocks(3);

	//
	// Move
	// 
	// Iterate through all blocks and create comparisons
	// 
	// Usage: ... (todo)
	// 

	$scope.move = function(dir){
		$scope.operand = dir;
		console.log("dir", dir);
		var jump = {
			left : -1,
			right : 1,
			up : -settings.gridWidth,
			down : settings.gridWidth
		}

		switch(dir){
			case "left" : 
				for(var i = 1; i < settings.blockCount; i++){

					// Skip most left column
					if(i%settings.gridWidth) operateBlock(dir, i, jump[dir]);
				}
				break;
			case "up" :
				for(var i = settings.gridWidth; i < settings.blockCount; i++){
					operateBlock(dir, i, jump[dir]);
				}
				break;
			case "right" : 
				for(var i = settings.blockCount - 1; i >= 0; i--){

					// Skip most right column
					if((i+1)%settings.gridWidth) operateBlock(dir, i, jump[dir]);
				}
				break;
			case "down" :
				for(var i = settings.blockCount - settings.gridWidth - 1; i >= 0; i--){
					operateBlock(dir, i, jump[dir]);
				}
				break;
		}

		resetBlocks();
		generateBlocks(1);
		updateScore();
	}

	// Random generation of block
	function generateBlocks(amount){
		var placed = 0,
			currentBlock;

		do{
			currentBlock = $scope.blocks[rand(settings.blockCount - 1)];
			
			if(currentBlock.val == 0){
				currentBlock.val = randPow(2);
				placed++;
			}
		} while(placed < amount);

		if (placed == settings.blockCount) {
			$scope.gameOver = true;
			$scope.gameStatus = "Game Over! Final Score"; 
		}
	}

	function resetBlocks(){

		// once all operations have been performed, reset block done status
		angular.forEach($scope.blocks, function(block, index){
			block.done = false;
		});
	}

	function updateScore(){
		//updates the highest score
		if (compareBlock.val > keepScore) {
			keepScore = compareBlock.val;
		}
	}

	function operateBlock(dir, currentIndex, jump){

		// Only perform check if value > 0
		if($scope.blocks[currentIndex].val > 0){

			do{
				var currentBlock = $scope.blocks[currentIndex],
					compareBlock = $scope.blocks[currentIndex + jump],
					status = compare(currentBlock, compareBlock);

					console.log(currentIndex + " -> " + (currentIndex + jump), ":", currentBlock.val, compareBlock.val, status);

					// perform operation when status is returned
					switch(status){
						case "multiply" :

							// Make sure multiply is only performed once per move
							if(compareBlock.done) return;
							compareBlock.done = true;
							compareBlock.val *= 2;
							currentBlock.val = 0

							break;

						case "shift" :
							compareBlock.val = currentBlock.val;
							currentBlock.val = 0;
							break;
					}


					// if border has been reached, set status to stuck
					if(
						(dir == "left" && compareBlock.col-1 < 0) ||
						(dir == "right" && compareBlock.col+1 >= settings.gridWidth) ||
						(dir == "up" && compareBlock.row-1 < 0) ||
						(dir == "down" && compareBlock.row+1 >= settings.gridHeight)){

						console.log("out of bounds, stop");
						status = "stuck";
					}

					// update the pointer to the recently compared block
					currentIndex+=jump;

			} while(status == "shift"); // Keep on comparing blocks as long as it can shift
		}
	}

	// 
	// Compare
	// 
	// Compare blocks and return status
	// 
	// Usage: ... (todo)
	// 
	// 

	function compare(block, compareBlock){

		// Check if current block value is equal to prevBlock value
		if(block.val == compareBlock.val){

			// Return end status
			return "multiply";
		}

		// In case compareBlock is empty, shift
		else if(compareBlock.val == 0){

			// Return shifted block for another iteration
			return "shift";
		}

		// Return end status
		return "stuck";
	}

	// Bind keypress to move function
	angular.element(document).on("keydown", function(e){
		
		var keyMapping = {
			"37" : "left",
			"38" : "up",
			"39" : "right",
			"40" : "down"
		}

		if(!keyMapping[e.keyCode]) return;

		$scope.move(keyMapping[e.keyCode]);
		$scope.$apply();

	});
});

// Create rounded random number between 0 and limit
function rand(limit){
	return Math.round(Math.random() * limit);
}

// Create random number between 2 and 2^(pow)
function randPow(pow){
	return Math.pow(2, 1 + Math.floor(Math.random() * pow));
}