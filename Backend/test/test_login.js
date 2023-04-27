const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const expect = chai.expect;
chai.use(chaiHttp);

describe('Testing route /login', function () {
    const host = `http://localhost:3000`;
    const path = "/login";

    // Test for invalid login details
    it('should return an error message on invalid login', function (done) {
        chai.request(app)
            .post('/login')
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
        chai.request(app)
            .post('/login')
            .send({ username: 'unverifieduser', password: 'unverifiedpassword', role: 'customer' })
            .end(function (err, res) {
                expect(res).to.have.status(500);
                expect(res).to.be.html;
                expect(res.text).to.include('Please verify your mail to login');
                done();
            });
    });

    // Test for non-existing user
    it('should return a 404 error for non-existing user', function (done) {
        chai.request(app)
            .post('/login')
            .send({ username: 'nonexistinguser', password: 'nonexistingpassword', role: 'customer' })
            .end(function (err, res) {
                expect(res).to.have.status(404);
                expect(res).to.be.html;
                expect(res.text).to.include("User Doesn't Exist");
                done();
            });
    });

    // Test for successful login
    it('should return a success message on valid login', function (done) {
        chai.request(app)
            .post('/login')
            .send({ username: 'testuser', password: 'testpassword', role: 'customer' })
            .end(function (err, res) {
                expect(res).to.have.status(201);
                expect(res).to.be.html;
                expect(res.text).to.include('Welcome');
                done();
            });
    });

    // Test for JWT token creation on successful login for customer
    it('should create a JWT token and redirect to the customer dashboard upon successful login', (done) => {
        chai.request(app)
            .post('/login')
            .send({
                username: 'testuser',
                password: 'testpassword',
                role: 'customer'
            })
            .end((err, res) => {
                res.should.have.status(201);
                res.should.be.html;
                res.text.should.contain('/customer/index');
                res.header['set-cookie'][0].should.include('jwt');
                done();
            });
    });

    // Test for JWT token creation on successful login for manager
    it('should create a JWT token and redirect to the manager dashboard upon successful login', (done) => {
        chai.request(app)
            .post('/login')
            .send({
                username: 'testmanager',
                password: 'testpassword',
                role: 'manager'
            })
            .end((err, res) => {
                res.should.have.status(201);
                res.should.be.html;
                res.text.should.contain('/manager/index');
                res.header['set-cookie'][0].should.include('jwt');
                done();
            });
    });

    // Test for JWT token creation on successful login for cadet
    it('should create a JWT token and redirect to the cadet dashboard upon successful login', (done) => {
        chai.request(app)
            .post('/login')
            .send({
                username: 'testcadet',
                password: 'testpassword',
                role: 'cadet'
            })
            .end((err, res) => {
                res.should.have.status(201);
                res.should.be.html;
                res.text.should.contain('/cadet/index');
                res.header['set-cookie'][0].should.include('jwt');
                done();
            });
    });
});
