const cadet_get = async (req, res) => {
    try {
        const username = req.params.username; // use req.params.username to get the username
        const cadet = await User.findOne({ username: username });
        console.log(cadet);
        res.render('cadet/index', { cadet: cadet });
    } catch (error) {
        console.log(error);
        res.send('An error occurred while finding the cadet.');
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

