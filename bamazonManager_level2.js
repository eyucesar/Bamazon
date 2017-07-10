var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
	host: "localhost",
	port: 8889,
	user: "root",
	password: "root",
	database: "bamazon"
});

connection.connect(function(err) {
	  if (err) throw err;
	  // console.log("connected as id " + connection.threadId + "\n");
	  showMenu();
});

function showMenu() {
	inquirer
    	.prompt({
     		name: "action",
      		type: "list",
      		message: "\nWhat would you like to do today?",
      		choices: [
        		"View products for sale",
        		"View low inventory",
        		"Add to inventory",
        		"Add new product"
      		]
    }).then(function(answer) {
    	switch (answer.action) {
	        case "View products for sale":
	          viewProducts();
	          break;

	        case "View low inventory":
	          viewLow();
	          break;

	        case "Add to inventory":
	          addInventory();
	          break;

	        case "Add new product":
	          addProduct();
	          break;
	    }
    });
}

function viewProducts() {
	console.log("Showing all products...\n");
		connection.query("SELECT * FROM products", function(err, res) {
			if (err) throw err;
    		for (var i = 0; i < res.length; i++) {
    			console.log("\nProduct id: " + res[i].item_id + "\n" + "Product name: " + res[i].product_name + "\n" + "Product price: $" + res[i].price + "\n" + "Product quantity: " + res[i].product_quantity +"\n" + "-------------------");
    		}
    	askAgain();
	});
}

function viewLow() {
	console.log("\nShowing products with low inventory...\n");
		connection.query("SELECT * FROM products", function(err, res) {
			if (err) throw err;
	    		for (var i = 0; i < res.length; i++) {
	    			if (res[i].product_quantity < 5) {
	    				console.log("Product id: " + res[i].item_id + "\n" + "Product name: " + res[i].product_name + "\n" + "Product price: $" + res[i].price + "\n" + "Product quantity: " + res[i].product_quantity +"\n" + "-------------------");
	    		}
    		}
    	askAgain();
	});
}

function addInventory() {
	console.log("\nShowing the inventory...\n");
		connection.query("SELECT * FROM products", function(err, res) {	
		if (err) throw err;
			inquirer
				.prompt([
					{
						name: "choice",
						type: "list",
						message: "Which item would you like to add to?",
						choices: function(value) {
							var choicesArray = [];
							for (var i = 0; i < res.length; i++) {
								choicesArray.push("Product: " + res[i].product_name + " --- Product quantity: " + res[i].product_quantity);
							}
						return choicesArray;
						}
					},
					{
						name: "quantity",
						type: "input",
						message: "How many items would you like to add?"
					}
				]).then(function(answer) {
					var chosenItem = {};
					
					for (var i = 0; i < res.length; i++) {
						if (answer.choice === ("Product: " + res[i].product_name + " --- Product quantity: " + res[i].product_quantity)) {
							chosenItem = res[i];
						}
					}
					// console.log(answer.choice);
					// console.log(answer.number);
					var quantity = parseInt(chosenItem.product_quantity) + parseInt(answer.quantity)
					connection.query("UPDATE products SET ? WHERE ?",
							[
								{
									product_quantity: quantity
								},
								{
									item_id: chosenItem.item_id
								}
							],function(err, res) {
              					if (err) throw err;
              					console.log("\nNew inventory added successfully! Now you have " + quantity + " " + chosenItem.product_name + " in the inventory.\n");
              					askAgain();
            				}
						)
				});
	});

}

function addProduct() {
	console.log("\n");
	inquirer
			.prompt([
				{
					name:"productName",
					type: "input",
					message: "What is the name of the item you would like to add?"
				},
				{
					name:"departmentName",
					type: "input",
					message: "Which department does this item belong to?"
				},
				{
					name: "price",
					type: "input",
					message: "How much is this item?",
					validate: function(value) {
			        	if (isNaN(value) === false) {
			        		return true;
			        	}
			        		return false;
			        }
				},
				{
					name: "quantity",
					type: "input",
					message: "How many items are you adding to the inventory?",
					validate: function(value) {
			        	if (isNaN(value) === false) {
			        		return true;
			        	}
			        		return false;
			        }
				}
			]).then(function(answer) {
				connection.query("INSERT into products SET ?",
							[
								{
									product_name: answer.productName,
									department_name: answer.departmentName,
									price: answer.price,
									product_quantity: answer.quantity
								},
							],function(err, res) {
              					if (err) throw err;
              					console.log("\nNew item added successfully. Now you have " + answer.quantity + " " + answer.productName + " in your store!\n");
              					askAgain();
            				}
						)

			});
}

function askAgain() {
	inquirer
			.prompt([
				{
					name:"question",
					type: "confirm",
					message: "Would you like to see menu options again?"
				}
			]).then(function(answer) {
				if(answer.question === true) {
					showMenu();
				} else {
					console.log("\nGoodbye!");
				}
			});
}