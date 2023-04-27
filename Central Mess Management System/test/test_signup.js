const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);
chai.should();

describe('Testing route /signup', () => {
    const host = `http://localhost:3000`;
    const path = "/signup";

    it('should return status 500 if password is invalid', (done) => {
        chai.request(host)
            .post('/signup')
            .send({ fullname: 'Deep Kanani', username: 'dk007', email: 'dk12121@gmail.com', password: 'invalid', cpassword: 'invalid', phone: '1234567890', role: 'customer', gender: 'male', birthdate: '2000-01-01' })
            .end((err, res) => {
                res.should.have.status(500);
                done();
            });
    });

    it('should return status 500 if passwords do not match', (done) => {
        chai.request(host)
            .post('/signup')
            .send({ fullname: 'Deep Kanani', username: 'dk007', email: 'dk12121@gmail.com', password: '#Dk@1234', cpassword: '#Dk@1235', phone: '1234567890', role: 'customer', gender: 'male', birthdate: '2000-01-01' })
            .end((err, res) => {
                res.should.have.status(500);
                done();
            });
    });

    it('should return status 500 if username already exists', (done) => {
        chai.request(host)
            .post('/signup')
            .send({ fullname: 'Deep Kanani', username: 'dk', email: 'dk12121@gmail.com', password: '#Dk@1234', cpassword: '#Dk@1234', phone: '1234567890', role: 'manager', gender: 'male', birthdate: '2000-01-01' })
            .end((err, res) => {
                res.should.have.status(500);
                done();
            });
    });

    it('should return status 500 if email already exists', (done) => {
        chai.request(host)
            .post('/signup')
            .send({ fullname: 'Deep Kanani', username: 'dk007', email: '202001454@daiict.ac.in', password: '#Dk@1234', cpassword: '#Dk@1234', phone: '1234567890', role: 'manager', gender: 'male', birthdate: '2000-01-01' })
            .end((err, res) => {
                res.should.have.status(500);
                done();
            });
    });
});