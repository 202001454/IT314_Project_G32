const { Router } = require('express');
const router = Router();
const authController = require('../controllers/authController');
const methodoverride = require('method-override');
const { requireAuth, checkUser } = require('../middleware/authMiddleware');
router.use(methodoverride('_method'));

router.get('*', checkUser);
router.patch('*', checkUser);
router.post('*', checkUser);



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

router.get('/customer/:username', requireAuth, authController.customer_get);

router.get('/customer/:username/edit', requireAuth, authController.customer_edit_get);
router.patch('/customer/:username/edit', requireAuth, authController.customer_edit_patch);

router.get('/customer/:username/view', requireAuth, authController.customer_view_get);

router.get('/customer/:username/changepassword', requireAuth, authController.customer_changepassword_get);
router.patch('/customer/:username/changepassword', requireAuth, authController.customer_changepassword_patch);

// router.patch('/customer/:username', authController.customer_patch);
router.get('/customer/:username/feedback', requireAuth, authController.customer_feedback_get);
router.post('/customer/:username/feedback', requireAuth, authController.customer_feedback_post);

router.get('/customer/:username/paymenthistory', requireAuth, authController.customer_paymenthistory_get);

router.get('/manager/:username', requireAuth, authController.manager_get);

router.get('/manager/:username/edit', requireAuth, authController.manager_edit_get);
router.patch('/manager/:username/edit', requireAuth, authController.manager_edit_patch);

router.get('/manager/:username/view', requireAuth, authController.manager_view_get);

router.get('/manager/:username/changepassword', requireAuth, authController.manager_changepassword_get);
router.patch('/manager/:username/changepassword', requireAuth, authController.manager_changepassword_patch);

router.get('/manager/:username/about', authController.manager_about_get);

router.get('/manager/:username/managercheck', authController.manager_managercheck_get);
router.post('/manager/:username/managercheck', authController.manager_managercheck_post);


router.get('/manager/:username/inventoryupgrade', authController.manager_inventoryupgrade_get);
router.patch('/manager/:username/inventoryupgrade', authController.manager_inventoryupgrade_patch);

router.get('/manager/:username/inventorydegrade', authController.manager_inventorydegrade_get);
router.patch('/manager/:username/inventorydegrade', authController.manager_inventorydegrade_patch);

router.get('/manager/:username/viewfeedback', requireAuth, authController.manager_viewfeedback_get);

router.get('/manager/:username/viewinventory', requireAuth, authController.manager_viewinventory_get);
router.get('/manager/:username/addpayment', requireAuth, authController.manager_addpayment_get);
router.post('/manager/:username/addpayment', requireAuth, authController.manager_addpayment_post);

router.get('/manager/:username/managercheck', requireAuth, authController.manager_managercheck_get);
router.post('/manager/:username/managercheck', requireAuth, authController.manager_managercheck_post);


router.get('/customer/:username/faq', authController.customer_faq_get);
router.get('/manager/:username/faq', authController.manager_faq_get);
router.get('/cadet/:username/faq', authController.cadet_faq_get);
router.get('/customer/:username/about', authController.customer_about_get);
router.get('/manager/:username/about', authController.manager_about_get);
router.get('/cadet/:username/about', authController.cadet_about_get);

router.get('/verify/:id', authController.verifyMail);

router.get('/add-user', requireAuth, authController.add_user_get);
router.get('/logout', authController.logout_get);
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