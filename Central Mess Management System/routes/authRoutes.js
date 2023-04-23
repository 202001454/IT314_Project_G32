const { Router } = require('express');
const router = Router();
const authController = require('../controllers/authController');
const methodoverride = require('method-override');

router.use(methodoverride('_method'));



router.get('/login', authController.login_get);
router.post('/login', authController.login_post);
// router.post('/login', async (req, res) => {
//     const { username, password, role } = req.body;
//     res.send({ username, password, role });

//     // verify username password and role in the User database
//     // redirect to the .ejs page according to role

// });

router.get('/signup', authController.signup_get);
router.post('/signup', authController.signup_post);

router.get('/customer/:username', authController.customer_get);

router.get('/customer/:username/edit', authController.customer_edit_get);
router.patch('/customer/:username/edit', authController.customer_edit_patch);

router.get('/customer/:username/view', authController.customer_view_get);

router.get('/customer/:username/changepassword', authController.customer_changepassword_get);
router.patch('/customer/:username/changepassword', authController.customer_changepassword_patch);

// router.patch('/customer/:username', authController.customer_patch);
router.get('/customer/:username/feedback', authController.customer_feedback_get);
router.post('/customer/:username/feedback', authController.customer_feedback_post);

router.get('/customer/:username/paymenthistory', authController.customer_paymenthistory_get);

router.get('/add-user', authController.add_user_get);
router.get('/', (req, res) => {
    res.render('home', { title: 'Home' });
}
);

router.get('/home', (req, res) => {
    res.render('home', { title: 'Home' });
}
);




router.use((req, res) => {
    res.status(404);
    res.render('404', { title: '404' });
}
);

module.exports = router;