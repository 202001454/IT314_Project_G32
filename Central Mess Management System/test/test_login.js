// Description: This file contains the test cases for the login route

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.should();
chai.use(chaiHttp);

describe('Testing route /login', function () {
    const host = `http://localhost:3000`;
    const path = "/login";

    // Test for invalid login details
    it('should return an error message on invalid login', function (done) {
        chai.request(host)
            .post(path)
            .send({ username: 'invaliduser', password: 'invalidpassword', role: 'customer' })
            .end(function (err, res) {
                expect(res).to.have.status(500);
                expect(res).to.be.html;
                expect(res.text).to.include('Invalid Login Details');
                done();
            });
    });

    // Test for unverified customer
    it('should return an error message for unverified customer', function (done) {
        chai.request(host)
            .post(path)
            .send({ username: 'unverifieduser', password: 'Un12@3', role: 'customer' })
            .end(function (err, res) {
                expect(res).to.have.status(500);
                expect(res).to.be.html;
                expect(res.text).to.include('Please verify your mail to login');
                done();
            });
    });

    // Test for successful login
    it('should return a success message on valid login', function (done) {
        chai.request(host)
            .post(path)
            .send({ username: 'user1', password: 'Us12@3', role: 'customer' })
            .end(function (err, res) {
                expect(res).to.have.status(201);
                expect(res).to.be.html;
                expect(res.text).to.include('Welcome');
                done();
            });
    });

    // Test for JWT token creation on successful login for customer
    it('should create a JWT token and redirect to the customer dashboard upon successful login', (done) => {
        chai.request(host)
            .post(path)
            .send({
                username: 'user1',
                password: 'Us12@3',
                role: 'customer'
            })
            .end((err, res) => {
                res.should.have.status(201);
                res.should.be.html;
                res.text.should.contain('/login');
                res.header['set-cookie'][0].should.include('jwt');
                done();
            });
    });
});