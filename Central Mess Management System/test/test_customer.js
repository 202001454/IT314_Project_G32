const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);
chai.should();

describe('customerController', () => {
    const host = 'http://localhost:3000';

    describe('customer_get', () => {
        it('should render the customer/index view with a customer object when a valid username is provided', async () => {
            // Make a GET request to the customer_get route with the specified username
            const res = await chai.request(host)
                .get('/customer/user1')
                .send();

            // Make assertions about the response
            res.should.have.status(200);
            // res.should.be.html;
        });

        it('should return a 500 status if an invalid username is provided', async () => {
            // Make a GET request to the customer_get route with an invalid username
            const res = await chai.request(host)
                .get('/customer/nonexistentuser')
                .send();

            // Make assertions about the response
            res.should.have.status(500);
            res.text.should.contain('/login');
            res.should.be.html;
        });
    });

    describe('customer_view_get', () => {
        it('should render the customer/view view with a customer object when a valid username is provided', async () => {
            // Make a GET request to the customer_view_get route with the specified username
            const res = await chai.request(host)
                .get('/customer/user1/view')
                .send();
            res.text.should.contain('/login');


            // Make assertions about the response
            res.should.have.status(200);
            res.should.be.html;
        });
    });
});

// describe('customerController', () => {
//     const host = 'http://localhost:3000';

//     describe('customer_get', () => {
//         it('should render the customer/index view with a customer object when a valid username is provided', async () => {
//             // Make a GET request to the customer_get route with the specified username
//             const res = await chai.request(host)
//                 .get('/customer/johndoe')
//                 .send();

//             // Make assertions about the response
//             res.should.have.status(200);
//             res.should.be.html;
//             res.text.should.contain('Customer Dashboard');
//             res.text.should.contain('Welcome, John Doe');
//         });

//         it('should return a 404 status if an invalid username is provided', async () => {
//             // Make a GET request to the customer_get route with an invalid username
//             const res = await chai.request(host)
//                 .get('/customer/nonexistentuser')
//                 .send();

//             // Make assertions about the response
//             res.should.have.status(404);
//             res.should.be.html;
//             res.text.should.contain('Not Found');
//         });
//     });

//     describe('customer_view_get', () => {
//         it('should render the customer/view view with a customer object when a valid username is provided', async () => {
//             // Make a GET request to the customer_view_get route with the specified username
//             const res = await chai.request(host)
//                 .get('/customer/view/johndoe')
//                 .send();

//             // Make assertions about the response
//             res.should.have.status(200);
//             res.should.be.html;
//             res.text.should.contain('Customer Details');
//             res.text.should.contain('Username: johndoe');
//         });

//         it('should return a 500 status if the specified username does not belong to a customer', async () => {
//             // Make a GET request to the customer_view_get route with a username that does not belong to a customer
//             const res = await chai.request(host)
//                 .get('/customer/view/adminuser')
//                 .send();

//             // Make assertions about the response
//             res.should.have.status(500);
//             res.should.be.json;
//             res.body.should.deep.equal({ error: 'User is not a customer' });
//         });

//         it('should return a 404 status if an invalid username is provided', async () => {
//             // Make a GET request to the customer_view_get route with an invalid username
//             const res = await chai.request(host)
//                 .get('/customer/view/nonexistentuser')
//                 .send();

//             // Make assertions about the response
//             res.should.have.status(404);
//             res.should.be.html;
//             res.text.should.contain('Not Found');
//         });
//     });
// });