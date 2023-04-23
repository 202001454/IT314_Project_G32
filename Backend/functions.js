const User = require('../models/user');
const Payment = require('../models/payment');
const Paymenthistory = require('../models/paymenthistory');
const Feedback = require('../models/feedback');


const manager_view_get = async (req,res) => {
    try{
        const {username} = req.params;
        const manager = await User.findOne({username:username,role:'manager'});
        if(manager)
        {
            // res.render('manager/view',{manager:manager});
            res.send(manager);
        }
        else
        {
            res.send("Error occured!");
        }
    } catch(error) {
        res.send("Unable to find Manager");
    }

}

const manager_edit_get = async(req,res) => {
    try{
        const {username} = req.params;
        const manager = await User.findOne({username:username,role:'manager'});
        if(manager)
        {
            // res.render('manager/edit',{manager:manager});
            res.send(manager);
        }
        else
        {
            res.send("Error occured!");
        }
    } catch(error) {
        res.send("Unable to find Manager");
    }
}

const manager_edit_patch = async(req,res) => {
    try {
        const { username } = req.params; // use req.params.username to get the username
        const customer = await User.findOne({ username: username });

        customer.password = req.body.password;
        customer.fullname = req.body.fullname;
        customer.date = req.body.date;
        customer.email = req.body.email;
        customer.phone = req.body.phone;
        customer.gender = req.body.gender;
        // console.log(customer);
        // res.send(username);

        User.updateOne({ username: username },
            { $set: { password: req.body.password, fullname: req.body.fullname, date: req.body.date, email: req.body.email, phone: req.body.phone, gender: req.body.gender }, validate: true }).then((result) => {
                console.log(result);
                res.render('customer/index', { customer: customer });
            }).catch((err) => {
                console.log(err);
            }
            );

        // User.save().then((result) => {
        //     console.log(result);
        //     res.render('customer/index', { customer: customer });
        // }).catch((err) => {
        //     console.log(err);
        // }
        // );

       

    } catch (error) {
        console.log(error);
        res.send('An error occurred while finding the customer.');
    }
}