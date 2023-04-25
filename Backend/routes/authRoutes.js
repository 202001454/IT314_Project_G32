const { Router } = require('express');
const router = Router();
const authController = require('../controllers/authController');
const methodoverride = require('method-override');
const { requireAuth, checkUser } = require('../middleware/authMiddleware');
router.use(methodoverride('_method'));

router.get('*', checkUser);
router.patch('*', checkUser);
router.post('*', checkUser);

router.get('/', (req, res) => {
    res.render('home', { title: 'Home' });
});

router.get('/home', (req, res) => {
    res.render('home', { title: 'Home' });
});

router.get('/login', authController.login_get);
router.post('/login', authController.login_post);

router.get('/signup', authController.signup_get);
router.post('/signup', authController.signup_post);

router.get('/customer/:username', requireAuth, authController.customer_get);

router.get('/customer/:username/edit', requireAuth, authController.customer_edit_get);
router.patch('/customer/:username/edit', requireAuth, authController.customer_edit_patch);

router.get('/customer/:username/view', requireAuth, authController.customer_view_get);

router.get('/customer/:username/changepassword', requireAuth, authController.customer_changepassword_get);
router.patch('/customer/:username/changepassword', requireAuth, authController.customer_changepassword_patch);

router.get('/customer/:username/feedback', requireAuth, authController.customer_feedback_get);
router.post('/customer/:username/feedback', requireAuth, authController.customer_feedback_post);

router.get('/customer/:username/paymenthistory', requireAuth, authController.customer_paymenthistory_get);

router.get('/logout', authController.logout_get);

router.use((req, res) => {
    res.status(404);
    res.render('404', { title: '404' });
});

module.exports = router;