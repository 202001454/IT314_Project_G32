const User = require('../models/user');
const Payment = require('../models/payment');
const Paymenthistory = require('../models/paymenthistory');
const Feedback = require('../models/feedback');
const Customercheck = require('../models/customercheck');

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
        const manager = await User.findOne({ username: username ,role : 'manager' });

        // manager.password = req.body.password;
        manager.fullname = req.body.fullname;
        manager.date = req.body.date;
        manager.email = req.body.email;
        manager.phone = req.body.phone;
        manager.gender = req.body.gender;
        // console.log(manager);
        // res.send(username);

        User.updateOne({ username: username,role:'manager'},
            { $set: { fullname: req.body.fullname, date: req.body.date, email: req.body.email, phone: req.body.phone, gender: req.body.gender }, validate: true })
            .then((result) => {
                console.log(result);
                res.render('manager/index', { manager: manager });
            })
            .catch((err) => {
                console.log(err);
                res.send('cannot update');
            }
            );
       
    } catch (error) {
        console.log(error);
        res.send('An error occurred while finding the manager.');
    }
}

const manager_customercheck_get = async (req,res) => {
    const today = new Date();
    const data = { currentDate: today };
    //when I amm requesting for the page , what I have to provide is the things
    // date from myside
    // username that I will get
    // and time duration that I will get
    //based on what I have to update the database


    

}