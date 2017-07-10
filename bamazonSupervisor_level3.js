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
	  // console.log("connected as id " + connection.threadId + "\n");
	  showMenu();
});

function showMenu() {
	console.log("\n");
	inquirer
    	.prompt({
     		name: "action",
      		type: "list",
      		message: "What would you like to do today?\n",
      		choices: [
        		"View products sales by department",
        		"Create new department"
      		]
    }).then(function(answer) {
    	switch (answer.action) {
	        case "View products sales by department":
	          viewProducts();
	          break;

	        case "Create new department":
	          createDepartment();
	          break;
	    }
    });
}

function viewProducts() {
	var query = "SELECT departments.department_id, departments.department_name, departments.over_head_costs, SUM(products.product_sales) AS product_sales, (SUM(products.product_sales) - departments.over_head_costs) AS total_profit FROM departments INNER JOIN products ON departments.department_name = products.department_name GROUP BY departments.department_id, departments.department_name, departments.over_head_costs";
	connection.query(query,function(err,result) {
			if (err) throw err;
			console.log("\nHere are products sales by department...\n");
			console.table(result);
			showMenu();
	});

}

function createDepartment() {
	inquirer
			.prompt([
				{
					name:"deptName",
					type: "input",
					message: "What is the name of the department you would like to add?"
				},
				{
					name:"overHeadCost",
					type: "input",
					message: "How much is the overhead cost?"
					// validate: function(value) {
			  //       	if (isNaN(value) === false) {
			  //       		return true;
			  //       	}
			  //       		return false;
			  //       }
				}
			]).then(function(answer) {
				connection.query("INSERT into departments SET ?",
							[
								{
									department_name: answer.deptName,
									over_head_costs: answer.overHeadCost,
								},
							],function(err, res) {
              					if (err) throw err;
              					console.log("\nNew department added successfully. Now you have a " + answer.deptName + " department in your store!\n");
              					showMenu();
            				}
						)

			});
}







