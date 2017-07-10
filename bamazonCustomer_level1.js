var mysql = require("mysql");
var inquirer = require("inquirer");
require('console.table');

var connection = mysql.createConnection({
	host: "localhost",
	port: 8889,
	user: "root",
	password: "root",
	database: "bamazon"
});

connection.connect(function(err) {
	  if (err) throw err;
	  showAll();
});

function showAll() {
	console.log("Showing all products...\n");
		connection.query("SELECT * FROM products", function(err, res) {
			if (err) throw err;
    		for (var i = 0; i < res.length; i++) {
    			console.table("Product id: " + res[i].item_id + "\n" + "Product name: " + res[i].product_name + "\n" + "Product price: $" + res[i].price + "\n" + "-------------------\n");
    		}
	});

	askQuestion();
}

function askQuestion() {
	connection.query("SELECT * FROM products", function(err, res) {	
		if (err) throw err;
			inquirer
				.prompt([
					{
						name: "choice",
						type: "list",
						message: "Which item would you like to buy?",
						choices: function(value) {
							var choicesArray = [];
							for (var i = 0; i < res.length; i++) {
								choicesArray.push(res[i].product_name);
							}
						return choicesArray;
						}
					},
					{
						name: "quantity",
						type: "input",
						message: "How many items would you like to buy?"
					}
				])
				.then(function(answer) {
					var chosenItem = {};
					
					for (var i = 0; i < res.length; i++) {
						if (answer.choice === res[i].product_name) {
							chosenItem = res[i];
						}
					}

					if (parseInt(answer.quantity) <= parseInt(chosenItem.product_quantity)) {
						var quantity = parseInt(chosenItem.product_quantity) - parseInt(answer.quantity)
						connection.query(
							"UPDATE products SET ? WHERE ?",
							[
								{
									product_quantity: quantity
								},
								{
									item_id: chosenItem.item_id
								}
							],
							function(err, res) {
              					if (err) throw err;
              					console.log("\nProduct bought successfully! Total price: $" + (answer.quantity * chosenItem.price) + "\n");
              					askAgain();
            				}
          				);
					} else {
						console.log("\nRequest cannot be completed. Out of stock!\n");
						askAgain();
					}
				});
	});
}

function askAgain() {
	inquirer
			.prompt([
				{
					name:"question",
					type: "confirm",
					message: "Would you like to make another purchase?"
				}
			]).then(function(answer) {
				if(answer.question === true) {
					showAll();
				} else {
					console.log("\nThank you for shopping with us. Come back again!\n");
				}


			});
}


