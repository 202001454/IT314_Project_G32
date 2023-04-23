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

const manager_changepassword_patch = async (req, res) => {
    try {
        const { username } = req.params; // use req.params.username to get the username
        const manager = await User.findOne({ username: username, role: 'manager' });
        manager.password = req.body.password;
        const cpassword = req.body.cpassword;

        if (manager.password === cpassword && cpassword) {
            User.updateOne({ username: username },
                { $set: { password: req.body.password }, validate: true }).then((result) => {
                    console.log(result);
                    res.render('manager/index', { manager: manager });
                }).catch((err) => {
                    console.log(err);
                    res.send(err);
                }
                );
        }
        else {
            res.send("Password are not matching");
        }
    } catch (error) {
        console.log(error);
        res.send('An error occurred while finding the manager.');
    }
}

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
const nodemailer = require("nodemailer");
const sendVerifyMail = async (name, email, user_id, userrole) => {
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
  
      if (userrole === 'customer') {
        mailOptions.subject = 'For verification mail';
        mailOptions.html = `<p>Hii '${name}', please click <a href="http://localhost:3000/verify/${user_id}">here</a> to verify your mail</p>`;
      } else if (userrole === 'manager') {
        mailOptions.to = process.env.MANAGER_MAIL;
        mailOptions.subject = `For verification mail for manager named ${name}`;
        mailOptions.html = `<p>Dear Manager, ${name} wants to be a manager, please click <a href="http://localhost:3000/verify/${user_id}">here</a> to verify their mail</p>`;
      } else if (userrole === 'cadet') {
        mailOptions.to = process.env.MANAGER_MAIL;
        mailOptions.subject = `For verification mail for cadet named ${name}`;
        mailOptions.html = `<p>Dear Manager, ${name} wants to be a cadet, please click <a href="http://localhost:3000/verify/${user_id}">here</a> to verify their mail</p>`;
      } else {
        throw new Error(`Invalid user role: ${userrole}`);
      }
  
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email has been sent to ${email}: ${info.messageId}`);
    } catch (error) {
      console.error(error.message);
    }
  };

  const verifyMail = async (req, res) => {
    try {
        const updateInfo = await User.updateOne({ _id: req.params.id }, { $set: { isVarified: Boolean(true) } });
        console.log(updateInfo);
        res.render('home');
    } catch (error) {
        console.log(error.message);
    }
}

//-> update your below file in authController.js
