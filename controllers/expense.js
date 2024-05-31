const Expense = require('../models/expenses');
const User = require('../models/users');
const sequelize = require('../util/database');

const addexpense = async (req, res) => {
    const { expenseamount, description, category } = req.body;

    if(expenseamount == undefined || expenseamount.length === 0) {
        return res.status(400).json({success: false, message: 'parameters missing'} );
    }

    if(description == undefined || description.length === 0) {
        return res.status(400).json({success: false, message: 'parameters missing'} );
    }

    if(category == undefined || category.length === 0) {
        return res.status(400).json({success: false, message: 'parameters missing'} );
    }

    const t = await sequelize.transaction();

    try {
        // Create expense
        const expense = await Expense.create({ expenseamount, description, category, userId: req.user.id }, { transaction: t });

        // Update totalExpenses for the user
        const totalExpense = Number(req.user.totalExpenses) + Number(expenseamount);
        await User.update(
            { totalExpenses: totalExpense },
            { where: { id: req.user.id }, transaction: t }
        );

        // Commit transaction
        await t.commit();

        // Send response
        return res.status(200).json({ expense });
    } catch (err) {
        // Rollback transaction in case of error
        await t.rollback();
        console.error(err);
        return res.status(500).json({ success: false, error: err.message });
    }
}

const getexpenses = async (req, res) => {
    Expense.findAll().then(expenses => {
        return res.status(200).json({expenses, success: true})
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({success: false, error: err})
        
    })
}

const deleteexpense = async (req, res) => {
    const expenseid = req.params.expenseid;
    if(expenseid == undefined || expenseid.length === 0) {
        return res.status(400).json({ success: false, message: "Expense ID is missing" });
    }

    const t = await sequelize.transaction();

    try {
        // Find the expense to delete
        const expense = await Expense.findOne({ where: { id: expenseid, userId: req.user.id } });

        if (!expense) {
            return res.status(404).json({ success: false, message: "Expense not found or does not belong to the user" });
        }

        // Delete the expense
        await expense.destroy({ transaction: t });

        // Update totalExpenses for the user
        const totalExpense = Number(req.user.totalExpenses) - Number(expense.expenseamount);
        await User.update(
            { totalExpenses: totalExpense },
            { where: { id: req.user.id }, transaction: t }
        );

        // Commit transaction
        await t.commit();

        // Send response
        return res.status(200).json({ success: true, message: "Expense deleted successfully" });
    } catch (err) {
        // Rollback transaction in case of error
        await t.rollback();
        console.error(err);
        return res.status(500).json({ success: false, error: err.message });
    }
}

module.exports = {
    addexpense,
    getexpenses,
    deleteexpense
}
