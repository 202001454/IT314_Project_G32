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

router.get('/logout', authController.logout_get);

router.use((req, res) => {
    res.status(404);
    res.render('404', { title: '404' });
});

module.exports = router;