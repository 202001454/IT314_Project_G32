const User = require('../models/user');
const Payment = require('../models/payment');
const Paymenthistory = require('../models/paymenthistory');
const Feedback = require('../models/feedback');
const Managercheck = require('../models/managercheck');
const Inventory = require('../models/invontory');

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

const manager_managercheck_get = async (req,res) => {
    try{
        const username = req.params.username;
        const manager = await User.findOne({username:username, role:'manager'});
        if(manager)
        {
            const today = new Date();
            manager.currentDate = today;
            res.render('manager/managercheck',{manager});
        }
        else {
            res.status(404).send('Manager not found');
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal server error');
    }

    
    //when I amm requesting for the page , what I have to provide is the things
    // date from myside
    // username that I will get
    // and time duration that I will get
    //based on what I have to update the database

    

    //here is the html logic for the page that is going to be loaded
{/* <body>
    <label for="date">Choose a date:</label>
    <input type="date" id="date" name="date" value="<%= manager.currentDate.toISOString().slice(0,10) %>" />
    <% var hour = manager.currentDate.getHours(); %>
    <% if (hour >= 6 && hour < 10) { %>
      <p>It's breakfast time!</p>
    <% } else if (hour >= 10 && hour < 14) { %>
      <p>It's lunch time!</p>
    <% } else if (hour >= 14 && hour < 21) { %>
      <p>It's dinner time!</p>
    <% } else { %>
      <p>It's not meal time.</p>
    <% } %>
  </body> */}
}


const manager_managercheck_post = async (req,res) => {
    try{
        const username = req.params.username;
        const manager = await User.findOne({username:username, role:'manager'});
        if(manager)
        {
            const c_username = req.body.username;
            const c_date = req.body.date;
            const c_time = req.body.time.toLowerCase();

            //finding the customer from payment database
            const paymentofcustomer = await Payment.findone({username:c_username});
            if(paymentofcustomer)
            {
                // const _date = new Date();
                if(paymentofcustomer.enddate - c_date <0)
                {
                    res.send("payment is expired");
                }
                //payment is done!
                else {
                    const customer = await Managercheck.findOne({username:c_username,date:c_date});

                    if(customer)
                    {
                        if(c_time == 'breakfast')
                        {
                            if(customer.breakfast == Boolean(false))
                            {
                                Managercheck.updateOne({username:c_username,date:c_date},{$set: {breakfast: Boolean(true)}}).then((result) => {
                                res.render('manager/managercheck',{manager}); 
                                }).catch((err) => {
                                    console.log(err);
                                    res.send('cannot update');
                                });
                            }
                            else
                            {
                                res.send("Already checked for breakfast");
                            }

                        }
                        else if(c_time == 'lunch')
                        {
                            if(customer.lunch == Boolean(false))
                            {
                                Managercheck.updateOne({username:c_username,date:c_date},{$set: {lunch : Boolean(true)}}).then((result) => {
                                res.render('manager/managercheck',{manager}); 
                                }).catch((err) => {
                                    console.log(err);
                                    res.send('cannot update');
                                });
                            }
                            else
                            {
                                res.send("Already checked for lunch");
                            }

                        }
                        else 
                        {
                            if(customer.dinner == Boolean(false))
                            {
                                Managercheck.updateOne({username:c_username,date:c_date},{$set: {dinner : Boolean(true)}}).then((result) => {
                                res.render('manager/managercheck',{manager}); 
                                }).catch((err) => {
                                    console.log(err);
                                    res.send('cannot update');
                                });
                            }
                            else
                            {
                                res.send("Already checked for dinner");
                            }
                        }
                    }
                    else
                    {
                        //make new and save
                        let newcustomer = new Managercheck({username:c_username,date:c_date,breakfast:Boolean(false),lunch:Boolean(false),dinner:Boolean(false)});

                        if(c_time == 'breakfast')
                        {
                            newcustomer.breakfast = Boolean(true);
                        }
                        else if(c_time == 'lunch')
                        {
                            newcustomer.lunch = Boolean(true);
                        }
                        else
                        {
                            newcustomer.dinner = Boolean(true);
                        }
                        const register = await newcustomer.save();
                        res.render('manager/managercheck',{manager});

                    }
                }
            }
            else
            {
                res.send("Payment not found");
            }
            
        }
        else {
            res.status(404).send('Manager not found');
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal server error');
    }
}


const manager_changepassword_get = async (req, res) => {
    try {
        const username = req.params.username; // use req.params.username to get the username
        const manager = await User.findOne({ username: username, role: 'manager' });


        if (manager) {



            // res.render('manager/changepassword', { manager: manager });
            res.send(manager);
        } else {
            res.send('No manager found.');
        }
    } catch (error) {
        console.log(error);
        res.send('An error occurred while finding the manager.');
    }
}

// const manager_changepassword_patch = async (req, res) => {
//     try {
//         const { username } = req.params; // use req.params.username to get the username
//         const manager = await User.findOne({ username: username, role: 'manager' });
//         manager.password = req.body.password;
//         const cpassword = req.body.cpassword;

//         if (manager.password === cpassword && cpassword) {
//             User.updateOne({ username: username },
//                 { $set: { password: req.body.password }, validate: true }).then((result) => {
//                     console.log(result);
//                     res.render('manager/index', { manager: manager });
//                 }).catch((err) => {
//                     console.log(err);
//                     res.send(err);
//                 }
//                 );
//         }
//         else {
//             res.send("Password are not matching");
//         }
//     } catch (error) {
//         console.log(error);
//         res.send('An error occurred while finding the manager.');
//     }
// }

const manager_inventoryupgrade_get = async (req,res) => {
    try{
        const username = req.params.username;
        const manager = await User.findOne({username:username,role:'manager'});
        res.render('/manager/inventoryupgrade',{manager});

    } catch (error) {
        console.log(error);
    }
}

const manager_inventorydegrade_get = async (req,res) => {
    try{
        const username = req.params.username;
        const manager = await User.findOne({username:username,role:'manager'});
        res.render('/manager/inventorydegrade',{manager});

    } catch (error) {
        console.log(error);
    }
}

const manager_inventoryupgrade_patch = async (req,res) => {
    try{
        const item_ = req.body.item; //of item's
        const item = item_.toLowerCase();
        const quantity = req.body.quantity; //of item's quantity'of item's
        const username = req.params.username; //manager's
        const inventory = await Inventory.findOne({item:item});//finding inventory
        const manager = await User.findOne({username:username,role: 'manager'});
        if(inventory && manager)
        {
            //if both found
            Inventory.updateOne({item:item}, {$set : {quantity:inventory.quantity+quantity}})
            .then((result) => {
                console.log(result);
                // res.render('manager/inventoryupgrade', { manager: manager });
                res.send("Updated successfully");
            })
            .catch((error) => {
                console.log(error);
                res.send("In 1st catch");
            });
        }
        else if(manager && (!inventory))
        {
            const _inventory = new Inventory({
                item:item,
                quantity:quantity
            });
            const response = await _inventory.save();
            // res.render('manager/inventoryupgrade', { manager: manager });
            res.send("New added");
        }
        else
        {
            console.log("Error");
        }
    } catch (error) {
        console.log(error);
    }
}

const manager_inventorydegrade_patch = async (req,res) => {
    try{
        const item_ = req.body.item; //of item's
        const item = item_.toLowerCase();
        const quantity = req.body.quantity;// of item's

        const username = req.params.username; //manager's

        const inventory = await Inventory.findOne({item:item});//finding inventory
        const manager = await User.findOne({username:username,role: 'manager'});
        if(inventory && manager)
        {
            //if both found
            let qty = (inventory.quantity-quantity >= 0) ? inventory.quantity-quantity :0;
            
            Inventory.updateOne({item:item}, {$set : {quantity:qty}})
            .then((result) => {
                console.log(result);
                // res.render('manager/inventorydegrade', { manager: manager });
                res.send("Updated successfully");
            })
            .catch((error) => {
                console.log(error);
                res.send("In 1st catch");
            });
        }
        else
        {
            console.log("Error");
        }
    } catch (error) {
        console.log(error);
    }
}


//--> start from here
// const nodemailer = require("nodemailer");

// const sendVerifyMail = async (name, email, user_id, userrole) => {
//     try {
//       const transporter = nodemailer.createTransport({
//         host: 'smtp.gmail.com',
//         port: 587,
//         secure: false,
//         requireTLS: true,
//         auth: {
//           user: process.env.MAIL,
//           pass: process.env.PASS,
//         },
//       });
  
//       let mailOptions = {
//         from: process.env.MAIL,
//         to: email,
//         subject: '',
//         html: '',
//       };
//       const remaining = `/verify/${user_id}`; 
//       const protocol = req.protocol;
//       const hostname = req.headers.host;
//       const url_ = protocol + '://' + hostname + remaining;
//       if (userrole === 'customer') {
//         mailOptions.subject = 'For verification mail';
//         mailOptions.html = `<p>Hii '${name}', please click <a href="${url_}">here</a> to verify your mail</p>`;
//       } else if (userrole === 'manager') {
//         mailOptions.to = process.env.MANAGER_MAIL;
//         mailOptions.subject = `For verification mail for manager named ${name}`;
//         mailOptions.html = `<p>Dear Manager, ${name} wants to be a manager, please click <a href="${url_}">here</a> to verify their mail</p>`;
//       } else if (userrole === 'cadet') {
//         mailOptions.to = process.env.MANAGER_MAIL;
//         mailOptions.subject = `For verification mail for cadet named ${name}`;
//         mailOptions.html = `<p>Dear Manager, ${name} wants to be a cadet, please click <a href="${url_}">here</a> to verify their mail</p>`;
//       } else {
//         throw new Error(`Invalid user role: ${userrole}`);
//       }
  
//       const info = await transporter.sendMail(mailOptions);
//       console.log(`Email has been sent to ${email}: ${info.messageId}`);
//     } catch (error) {
//       console.error(error.message);
//     }
//   };

const nodemailer = require("nodemailer");

const sendVerifyMail = async (name, email, user_id, userrole, req) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.MAIL,
        pass: process.env.PASS,
      },
    });

    let mailOptions = {
      from: process.env.MAIL,
      to: email,
      subject: '',
      html: '',
    };
    const remaining = `/verify/${user_id}`; 
    const protocol = req.protocol || 'http';
    const hostname = req.headers.host || 'localhost:3000';
    const url_ = protocol + '://' + hostname + remaining;
    if (userrole === 'customer') {
      mailOptions.subject = 'For verification mail';
      mailOptions.html = `<p>Hii '${name}', please click <a href="${url_}">here</a> to verify your mail</p>`;
    } else if (userrole === 'manager') {
      mailOptions.to = process.env.MANAGER_MAIL;
      mailOptions.subject = `For verification mail for manager named ${name}`;
      mailOptions.html = `<p>Dear Manager, ${name} wants to be a manager, please click <a href="${url_}">here</a> to verify their mail</p>`;
    } else if (userrole === 'cadet') {
      mailOptions.to = process.env.MANAGER_MAIL;
      mailOptions.subject = `For verification mail for cadet named ${name}`;
      mailOptions.html = `<p>Dear Manager, ${name} wants to be a cadet, please click <a href="${url_}">here</a> to verify their mail</p>`;
    } else {
      throw new Error(`Invalid user role: ${userrole}`);
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email has been sent to ${email}: ${info.messageId}`);
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};


const verifyMail = async (req, res) => {
    try {
        const updateInfo = await User.updateOne({ _id: req.params.id }, { $set: { isVarified: Boolean(true) } });
        console.log(updateInfo);
        res.render('login');
    } catch (error) {
        console.log(error.message);
        res.send('Inside catch block of verifyMail');
    }
}

//-> update your below file in authController.js
const signup_post = async (req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.cpassword;

        //validate password
        const validpassword = validatepassword(password);
        if (!validpassword) {
            res.render('signup', { err: "Password must be between 6 to 16 characters and must contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character" });
        }

        if (password === cpassword) {
            const user = new User({
                fullname: req.body.fullname,
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                phone: req.body.phone,
                role: req.body.role,
                gender: req.body.gender,
                date: req.body.birthdate,
            });
            //verify username and email in the database if already exists

            const foundUser = await User.findOne({ username: user.username });
            console.log(foundUser);
            if (foundUser) {
                res.render('signup', { err: "Username already exists" });
            }
            const foundEmail = await User.findOne({ email: user.email });
            console.log(foundEmail);

            if (foundEmail) {
                res.render('signup', { err: "Email already exists" });
            }

            //if not exists then save the user in the database
            user.save().then(async (result) => {
                const sendMail = await sendVerifyMail(req.body.fullname,req.body.email,result._id,req.body.role,req);
                res.status(201).render('login');
            }).catch((err) => {
                console.log(err);
            }
            );
        } else {
            res.send("Password are not matching");
        }

    } catch (error) {
        res.status(400);
        res.send(error);
    }
}


//--> Update the route as below
router.get('/verify/:id', authController.verifyMail);

//--------------------------------------------------------------

//customer functionality for about and faq

const customer_about_get = async (req, res) => {
    try {
        const username = req.params.username;
        const customer = await User.findOne({ username: username, role: 'customer' });
        if (customer) {
            res.render('customer/about', { customer: customer });
        }
        else {
            res.send('An error occurred while finding the customer.');
        }
    } catch (error) {
        console.log(error);
        res.send('An error occurred while finding the customer.');
    }
}


const customer_faq_get = async (req, res) => {
    try{
        const username = req.params.username;
        const customer = await User.findOne({username:username,role: 'customer'});
        if(customer)
        {
            res.render('customer/faq', { customer: customer });
        }
        else
        {
            res.send("Customer not found");
        }
    } catch (error) {
        console.log(error);
    }
}

const manager_about_get = async (req, res) => {
    try {
        const username = req.params.username;
        const manager = await User.findOne({ username: username, role: 'manager' });
        if (manager) {
            res.render('manager/about', { manager: manager });
        }
        else {
            res.send('An error occurred while finding the manager.');
        }
    } catch (error) {
        console.log(error);
        res.send('An error occurred while finding the manager.');
    }
}


const manager_faq_get = async (req, res) => {
    try{
        const username = req.params.username;
        const manager = await User.findOne({username:username,role: 'manager'});
        if(manager)
        {
            res.render('manager/faq', { manager: manager });
        }
        else
        {
            res.send("Manager not found");
        }
    } catch (error) {
        console.log(error);
    }
}

const cadet_about_get = async (req, res) => {
    try {
        const username = req.params.username;
        const cadet = await User.findOne({ username: username, role: 'cadet' });
        if (cadet) {
            res.render('cadet/about', { cadet: cadet });
        }
        else {
            res.send('An error occurred while finding the cadet.');
        }
    } catch (error) {
        console.log(error);
        res.send('An error occurred while finding the cadet.');
    }
}


const cadet_faq_get = async (req, res) => {
    try{
        const username = req.params.username;
        const cadet = await User.findOne({username:username,role: 'cadet'});
        if(cadet)
        {
            res.render('cadet/faq', { cadet: cadet });
        }
        else
        {
            res.send("Cadet not found");
        }
    } catch (error) {
        console.log(error);
    }
}

// ----------------------------------------------------
// adding routes for customer, manager and cadet
routers.get('/customer/:username/faq', authController.customer_faq_get);
routers.get('/manager/:username/faq', authController.manager_faq_get);
router.get('/cadet/:username/faq', authController.cadet_faq_get);



/*
add payment --> get --> post
view feedback --> get
view inventory --> get
*/

const manager_addpayment_get = async (req,res) => {
    try {
        const username = req.params.username;
        const manager = await User.findOne({ username: username, role: 'manager' });
        if (manager) {
            res.render('manager/addpayment', { manager: manager });
        }
        else {
            res.send('An error occurred while finding the manager.');
        }
    } catch (error) {
        console.log(error);
    }

}

const manager_addpayment_post = async (req,res) => {
    try{
        const username = req.params.username;
        const manager = await User.findOne({username:username,role: 'manager'});
        if(manager)
        {
            const customerusername = req.body.username;
            const oldPayment = await Payment.findOne({username:customerusername});
            if(oldPayment)
            {
                oldPayment.startdate = req.body.startdate;
                oldPayment.enddate = req.body.enddate;
                oldPayment.amount = req.body.amount;

                const updated = await Payment.updateOne({username:customerusername},{$set : {startdate:oldPayment.startdate,enddate:oldPayment.enddate,amount:oldPayment.amount}, validate: true});
                if(updated)
                {
                    const updateHistory = new Paymenthistory({
                        username: customerusername,
                        startdate: oldPayment.startdate,
                        enddate: oldPayment.enddate,
                        amount: oldPayment.amount
                    });
                    const historysave = await updateHistory.save();
                    if(historysave)
                    {
                        res.status(201).render('manager/addpayment', { manager: manager });
                    }
                    else
                    {
                        res.send("An error occurred while updating the payment history.");
                    }
                }
                else
                {
                    res.send("An error occurred while updating the payment details.");
                }
            }
            else
            {
                const customer = User.findone({username:customerusername,role:'customer'});
                if(customer)
                {
                    const payment = new Payment({
                        username: req.body.username,
                        startdate: req.body.startdate,
                        enddate: req.body.enddate,
                        amount: req.body.amount
                    });
                    const customerpaymentadded = await payment.save();
                    if(customerpaymentadded)
                    {
                        const paymenthistory = new Paymenthistory({
                            username: customerusername,
                            startdate: req.body.startdate,
                            enddate: req.body.enddate,
                            amount: req.body.amount
                        });
                        const historysave = await paymenthistory.save();
                        if(historysave)
                        {
                            res.status(201).render('manager/addpayment', { manager: manager });
                        }
                        else
                        {
                            res.send("An error occurred while updating the payment history.");
                        }
                    }
                    else
                    {
                        res.send("An error occurred while updating the payment details.");
                    }
                    
                }
                else
                {
                    res.send("customer not found");
                }
            }
        }
    } catch(error) {
        console.log(error);
    }
}

const manager_viewfeedback_get = async (req,res) => {
    try{
        const username = req.params.username;
        const manager = User.findOne({username:username,role: 'manager'});
        if(manager)
        {
            const feedback = await Feedback.find();
            if(feedback)
            {
                res.render('manager/viewfeedback', { manager: manager, feedback: feedback });
            }
            else
            {
                res.send("No feedback found");
            }
        }
    } catch (error) {
        console.log(error);
    }
}

const manager_viewinventory_get = async (req,res) => {
    try{
        const username = req.params.username;
        const manager = User.findOne({username:username,role: 'manager'});
        if(manager)
        {
            const inventory = await Inventory.find();
            if(inventory)
            {
                res.render('manager/viewinventory', { manager: manager, inventory: inventory });
            }
            else
            {
                res.send("No inventory found");
            }
        }
    } catch (error) {
        console.log(error);
    }
}

// ----------------manager deletion functionalities---------------- //
const manager_deleteuser_get = async (req,res) => {
    const username = req.params.username;
    const manager = await User.findOne({username:username,role: 'manager'});
    if(manager)
    {
        res.render('manager/deleteuser', { manager: manager });
    }
    else
    {
        res.send("Manager not found");
    }
}

const manager_deleteuser_delete = async (req,res) => {
    const username = req.params.username;
    const manager = await User.findOne({username:username,role: 'manager'});
    if(manager)
    {
        const managerPass = req.body.password;
        const auth = await bcrypt.compare(managerPass, manager.password);
        if(auth)
        {
            const userusername = req.body.username;
            const _delete = await User.deleteOne({username:userusername,role:req.body.role});
            if(_delete)
            {
                res.status(201).render('manager/deleteuser', { manager: manager });
            }
            else
            {
                res.send("An error occurred while deleting the customer.");
            }
        }
        else
        {
            res.send("Password not matched for manager");

        }
    }
    else
    {
        res.send("Manager not found");
    }
}

//----------------------------------------------
const manager_paymenthistorygraph_get = async (req,res) => {
    try{

        const username = req.params.username;
        const manager = User.findOne({username:username, role:'manager'});
        if(manager)
        {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            const username = req.params.username;
            const manager = await User.findOne({username:username, role:'manager'});
            const payments = await Paymenthistory.aggregate([
            {
                $match: {
                enddate: {
                    $gte: sixMonthsAgo
                }
                }
            },
            {
                $group: {
                _id: {
                    $dateToString: {
                    format: "%Y-%m",
                    date: "$startdate"
                    }
                },
                totalAmount: {
                    $sum: "$amount"
                }
                }
            },
            {
                $project: {
                month: "$_id",
                totalAmount: "$totalAmount",
                _id: 0
                }
            },
            {
                $sort: {
                    month: 1
                }
            }
            ]);
        
            console.log(payments);
            res.render('manager/viewpaymenthistorygraph', {manager, payments });
        }
        else
        {
            res.send("No manager found");
        }
    }
    catch(error)
    {
        console.log(error);
    }
    // 
}


const manager_paymenthistorygraph_post = async (req, res) => {
    try{

        const username = req.params.username;
        const manager = User.findOne({username:username, role:'manager'});
        if(manager)
        {
            const monthsAgo = new Date();
            const month = Number(req.body.month);
            monthsAgo.setMonth(sixMonthsAgo.getMonth() - month);
            const username = req.params.username;
            const manager = await User.findOne({username:username, role:'manager'});
            const payments = await Paymenthistory.aggregate([
            {
                $match: {
                enddate: {
                    $gte: monthsAgo
                }
                }
            },
            {
                $group: {
                _id: {
                    $dateToString: {
                    format: "%Y-%m",
                    date: "$startdate"
                    }
                },
                totalAmount: {
                    $sum: "$amount"
                }
                }
            },
            {
                $project: {
                month: "$_id",
                totalAmount: "$totalAmount",
                _id: 0
                }
            },
            {
                $sort: {
                    month: 1
                }
            }
            ]);
        
            console.log(payments);
            res.render('manager/viewpaymenthistorygraph', {manager, payments });
        }
        else
        {
            res.send("No manager found");
        }
    }
    catch(error)
    {
        console.log(error);
    }
  }


  //cadet functionalities

const cadet_viewprofile_get = async (req,res) => {
    try{
        const username = req.params.username;
        const cadet = await User.findOne({username:username,role: 'cadet'});
        if(cadet)
        {
            res.render('cadet/viewprofile', { cadet: cadet });
        }
        else
        {
            res.send("Cadet not found");
        }
    } catch (error) {
        console.log(error);
    }
}

const cadet_changepassword_get = async (req, res) => {
    try {
        const username = req.params.username; // use req.params.username to get the username
        const cadet = await User.findOne({ username: username, role: 'cadet' });

        if (cadet) {

            res.render('cadet/changepassword', { cadet: cadet });
            // res.send(cadet);
        } else {
            res.send('No cadet found.');
        }
    } catch (error) {
        console.log(error);
        res.send('An error occurred while finding the cadet.');
    }
}

const cadet_changepassword_patch = async (req, res) => {
    try {
        const { username } = req.params; // use req.params.username to get the username
        let cadet = await User.findOne({ username: username, role: 'cadet' });
        // cadet.password = req.body.password;
        // const cpassword = req.body.cpassword;
        if(cadet)
        {
            if (req.body.password === req.body.cpassword && req.body.cpassword) {
            
            
            cadet.password = await bcrypt.hash(req.body.password, 12);
            User.updateOne({ username: username },
            { $set: { password: cadet.password }, validate: true }).then((result) => {
                console.log(result);
                res.render('cadet/index', { cadet: cadet });
            }).catch((err) => {
                console.log(err);
                res.send(err);
            });
            }
            else {
                res.send("Password are not matching");
            }
        }
        else {
            res.send('No cadet found.');
        }
        
    } catch (error) {
        console.log(error);
        res.send('An error occurred while finding the cadet.');
    }
}

const manager_changepassword_patch = async (req, res) => {
    try {
        const { username } = req.params; // use req.params.username to get the username
        let manager = await User.findOne({ username: username, role: 'manager' });
        // manager.password = req.body.password;
        // const cpassword = req.body.cpassword;
        if(manager)
        {
            if (req.body.password === req.body.cpassword && req.body.cpassword) {
                manager.password = await bcrypt.hash(req.body.password, 12);
                User.updateOne({ username: username },
                { $set: { password: manager.password }, validate: true }).then((result) => {
                    console.log(result);
                    res.render('manager/index', { manager: manager });
                }).catch((err) => {
                    console.log(err);
                    res.send(err);
                });
            }
            else {
                res.send("Password are not matching");
            }
        }
        else {
            res.send('No manager found.');
        }  
    } catch (error) {
        console.log(error);
        res.send('An error occurred while finding the manager.');
    }
}

const cadet_get = async (req, res) => {
    try {
        const username = req.params.username; // use req.params.username to get the username
        const cadet = await User.findOne({ username: username, role: 'cadet' });
        // console.log(cadet);
        if(cadet){

            res.render('cadet/index', { cadet: cadet });
        }
        else{
            res.send("No cadet found");
        }
    } catch (error) {
        console.log(error);
        res.send('An error occurred while finding the cadet.');
    }
}

const cadet_edit_get = async (req, res) => {
    try {
        const { username } = req.params;
        const cadet = await User.findOne({ username: username, role: 'cadet' });
        if (cadet) {
            res.render('cadet/edit', { cadet: cadet });
            // res.send(cadet);
        }
        else {
            res.send("Error occured!");
        }
    } catch (error) {
        res.send("Unable to find cadet");
    }
}

const cadet_edit_patch = async (req, res) => {
    try {
        const { username } = req.params; // use req.params.username to get the username
        const cadet = await User.findOne({ username: username, role: 'cadet' });

        if(cadet){
            // cadet.password = req.body.password;
            cadet.fullname = req.body.fullname;
            cadet.date = req.body.date;
            cadet.email = req.body.email;
            cadet.phone = req.body.phone;
            cadet.gender = req.body.gender;
            User.updateOne({ username: username, role: 'cadet' },
            { $set: { fullname: req.body.fullname, date: req.body.date, email: req.body.email, phone: req.body.phone, gender: req.body.gender }, validate: true })
            .then((result) => {
                console.log(result);
                res.render('cadet/index', { cadet: cadet });
            })
            .catch((err) => {
                console.log(err);
                res.send('cannot update');
            }
            );
        }
        else
        {
            res.send("No cadet found");
        }
        

    } catch (error) {
        console.log(error);
        res.send('An error occurred while finding the cadet.');
    }
}

const cadet_viewinventory_get = async (req, res) => {
    try {
        const username = req.params.username;
        const cadet = await User.findOne({ username: username, role: 'cadet' });
        if (cadet) {
            const inventory = await Inventory.find();
            if (inventory) {
                console.log(inventory);
                res.render('cadet/viewinventory', { cadet: cadet, inventory: inventory });
            }
            else {
                res.send("No inventory found");
            }
        }
    } catch (error) {
        console.log(error);
    }
}


const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, varifying_token, async (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.render('login' , {err: `error occured in authentication`});
            } else {
                // console.log("Vrund");
                // console.log("Vrund");
                // console.log(decodedToken);
                const username = req.params.username;
                console.log("deep");
                console.log(res.locals.user);
                console.log(username);
                console.log("deep");

                const fraud = await User.findOne({ username: username });
                if (fraud && fraud.username == res.locals.user.username) {
                    next();
                }
                else {
                    console.log("Bhai Bhai");
                    res.render('login' , {err: `Login required`});

                }
                // next();
            }
        });
    } else {
        console.log("User not logged in");
        res.render('login' , {err: `Login required`});
    }
}
