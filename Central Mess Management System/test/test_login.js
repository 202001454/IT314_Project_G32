// Description: This file contains the test cases for the login route

let chai = require("chai");
let chaiHttp = require("chai-http");
chai.should();
chai.use(chaiHttp);
describe('Testing route /login', () => {
    const host = `http://localhost:3000`;
    const path = "/login";

    // Validating user
    it("User valid", (done) => {
        chai
            .request(host)
            .post(path)
            .send({
                username: 'deep9', password: 'working', role: 'manager'
            })
            .end(function (error, response, body) {
                response.should.have.status(201);
                done();
            });
    });
    it("User doesn't exist", (done) => {
        chai
            .request(host)
            .post(path)
            .send({
                username: 'gaurangggg', password: 'working', role: 'manager'
            })
            .end(function (error, response, body) {
                response.should.have.status(400);
                done();
            });
    });

    // password checking
    it("Password invalid", (done) => {
        chai
            .request(host)
            .post(path)
            .send({
                username: 'deep9', password: 'working22', role: 'manager'
            })
            .end(function (error, response, body) {
                response.should.have.status(400);
                done();
            });
    });

    // role checking
    it("Role invalid", (done) => {
        chai
            .request(host)
            .post(path)
            .send({
                username: 'vrund1', password: 'T4#s9A', role: 'cadet'
            })
            .end(function (error, response, body) {
                response.should.have.status(400);
                done();
            });
    });
    
    // credentials checking
    it("Credentials invalid", (done) => {
        chai
            .request(host)
            .post(path)
            .send({
                username: 'deep9', password: 'working333', role: 'cadet'
            })
            .end(function (error, response, body) {
                response.should.have.status(400);
                done();
            });
    });

    // null username
    it("Null Username", (done) => {
        chai
            .request(host)
            .post(path)
            .send({
                username: '', password: 'working', role: 'manager'
            })
            .end(function (error, response, body) {
                response.should.have.status(400);
                done();
            });
    });

});
