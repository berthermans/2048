var app = angular.module('puzzle', ['swipe']);


//HEIDI TODO
//1 - SLIDE ANIMATION
//2 - KEEPING SCORE
//3 - GAME OVER

app.controller('puzzleController', function ($scope, $timeout) {

	//HIGH SCORE
	//GAME OVER
	
	var settings = {
		gridWidth: 4,
		gridHeight: 4
	};

	// Used for delay in resetting blocks
	var timer;

	angular.extend(settings, {
		blockWidth: 100 / settings.gridWidth,
		blockHeight: 100 / settings.gridHeight,
		blockCount: settings.gridWidth * settings.gridHeight,

		// Score variables
		gameOver: false,
		gameStatus: "Current Score",
		keepScore: 0,
		highestBlock: 0,
		blocksPlaced: 0,

		// Shift settings for comparing blocks
		shift: {
			left : -1,
			right : 1,
			up : -settings.gridWidth,
			down : settings.gridWidth
		}
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

		// push block element to the blocks array
		$scope.blocks.push({
			val: 0,
			row: row,
			col: col,
			index: i
		});
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
		
		//console.log("direction", dir);
		var change;

		switch(dir){
			case "left" : 
				for(var i = 1; i < settings.blockCount; i++){

					// Skip most left column
					if(i%settings.gridWidth){
						setChange(changeBlock(dir, i, settings.shift[dir]));
					}
				}
				break;
			case "up" :
				for(var i = settings.gridWidth; i < settings.blockCount; i++){
					setChange(changeBlock(dir, i, settings.shift[dir]));
				}
				break;
			case "right" : 
				for(var i = settings.blockCount - 1; i >= 0; i--){

					// Skip most right column
					if((i+1)%settings.gridWidth){
						setChange(changeBlock(dir, i, settings.shift[dir]));
					}
				}
				break;
			case "down" :
				for(var i = settings.blockCount - settings.gridWidth - 1; i >= 0; i--){
					setChange(changeBlock(dir, i, settings.shift[dir]));
				}
				break;
		}

		function setChange(changeStatus){
			if(!change && changeStatus) change = changeStatus;
		}

		if(change) generateBlocks(1);

		// Check for gameover when there's no change and board is full
		else if($scope.blocksPlaced == settings.blockCount){

			// You dead? DIE THEN!
			if(checkGameOver()) gameOver();
		}

		// Reset done status on blocks for next move
		resetBlockStatus();
	}


	// Reset the whole thing for another go!
	$scope.reset = function(){

		// TODO: Make a initial settings object and copy it to the scope.
		// 		 Only manipulate the scope, so when you want to reset you 
		//		 only have to overwrite the scope with the original settings
		//		 again.
	};

	// Are you dead?
	function checkGameOver(){

		console.log("checking Game Over...");

		// Loop through all the blocks!
		for(var i = 0; i < settings.blockCount; i++){

			// Loop through the directions
			for(var dir in settings.shift){

				var block = $scope.blocks[i],
					shift = settings.shift[dir];

				// check if the comparison is not out of bounds
				if(!outOfBounds(dir, block)){

					var compareBlock = $scope.blocks[i + shift];

					var	status = compare(block, compareBlock);

					// As soon as there's a move possible, cancel loop and return gameover: false
					if(status != "stuck"){

						console.log("Keep on playing!");
						return false;
					}
				}
			};
		};

		console.log("No moves possible...");
		return true;
	}

	// You're dead mofo!
	function gameOver(){
		$scope.gameOver = true;
		$scope.gameStatus = "GAME OVER!";
	}

	// Random generation of block
	function generateBlocks(amount){
		var placed = 0,
			currentBlock;

		$scope.blocksPlaced += amount;
		
		do{
			// pick random block
			currentBlock = $scope.blocks[rand(settings.blockCount - 1)];
			
			// is block empty?
			if(currentBlock.val == 0){
				currentBlock.val = randPow(2);
				placed++;
			}
		} while(placed < amount);
	}

	function resetBlockStatus(){

		$timeout.cancel();

		// once all operations have been performed, reset block done status
		$timeout(function(){
			angular.forEach($scope.blocks, function(block, index){
				block.done = false;
			});
		}, 400, true);
	}

	function updateScore(val){

		//updates the highest score
		$scope.keepScore += val;
		if(val > $scope.highestBlock) $scope.highestBlock = val;
	}

	function changeBlock(dir, currentIndex, shift){

		var change = false;

		// Only perform check if value > 0
		if($scope.blocks[currentIndex].val > 0){

			do{
				var currentBlock = $scope.blocks[currentIndex],
					compareBlock = $scope.blocks[currentIndex + shift],
					status = compare(currentBlock, compareBlock);

					//console.log(currentIndex + " -> " + (currentIndex + shift), ":", currentBlock.val, compareBlock.val, status);

					// perform operation when status is returned
					switch(status){
						case "multiply" :

							// Make sure multiply is only performed once per move
							if(compareBlock.done) return;
							compareBlock.done = true;
							compareBlock.val *= 2;
							currentBlock.val = 0;
							
							// Reduce blocks placed by 1
							$scope.blocksPlaced--;

							// Update the score with the multiplied value
							updateScore(compareBlock.val);

							// Update change status
							change = true;

							break;

						case "shift" :
							compareBlock.val = currentBlock.val;
							currentBlock.val = 0;

							// Update change status
							change = true;

							break;
					}


					// if border has been reached, set status to stuck
					if(outOfBounds(dir, compareBlock)){
						//console.log("out of bounds, stop");
						status = "stuck";
					}

					// update the pointer to the recently compared block
					currentIndex+=shift;

			} while(status == "shift"); // Keep on comparing blocks as long as it can shift
		}

		return change;
	}

	function outOfBounds(dir, compareBlock){
		if(	(dir == "left" && compareBlock.col-1 < 0) ||
			(dir == "right" && compareBlock.col+1 >= settings.gridWidth) ||
			(dir == "up" && compareBlock.row-1 < 0) ||
			(dir == "down" && compareBlock.row+1 >= settings.gridHeight)){

			return true;
		}

		return false;
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