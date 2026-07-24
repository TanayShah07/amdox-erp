import express from "express";
import pool from "../db.js";

const router = express.Router();


router.get("/", async(req,res)=>{

try{

const employees = await pool.query(
"SELECT COUNT(*) FROM employees"
);


const projects = await pool.query(
"SELECT COUNT(*) FROM projects"
);


const inventory = await pool.query(
`
SELECT 
SUM(quantity * unit_price) AS value
FROM inventory
`
);


const invoices = await pool.query(
`
SELECT 
SUM(amount) AS value
FROM invoices
`
);


const ledger = await pool.query(
`
SELECT 
SUM(
CASE 
WHEN type='Credit' THEN amount
ELSE -amount
END
) AS balance
FROM ledger
`
);


res.json({

employees:employees.rows[0].count,

projects:projects.rows[0].count,

inventoryValue:
inventory.rows[0].value || 0,

invoiceValue:
invoices.rows[0].value || 0,

ledgerBalance:
ledger.rows[0].balance || 0

});


}
catch(err){

console.log(err);

res.status(500).json({
message:"Report Error"
});

}

});


export default router;