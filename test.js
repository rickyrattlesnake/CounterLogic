var request = require('supertest');
var app = require('./app');

var redis = require('redis');
var client = redis.createClient();

client.select((process.env.NODE_ENV || 'test').length);
client.flushdb();

describe('Requests to the root path', function() {
    it('Returns a 200 status code', function(done) {
        request(app)
            .get('/')
            .expect(200)
            .end(function (error) {
                if (error) {
                    throw error;
                }
                done();
            });
    });

    it('Returns an HTML format', function (done) {
        request(app)
            .get('/')
            .expect('Content-Type', /html/, done);
    });
});

describe('Listing Categories on /categories', function () {
    it('Returns a 200 status code.', function (done) {
        request(app)
            .get('/categories')
            .expect(200)
            .end(function (error) {
                if (error) {
                    throw error;
                }
                done();
            });
    });

    it('Returns JSON format', function (done) {
        request(app)
            .get('/categories')
            .expect('Content-Type', /json/)
            .end(function (error) {
                if (error) {
                    throw error;
                }
                done();
            });
    });

    it('Returns initial categories', function (done) {
        request(app)
            .get('/categories')
            .expect(JSON.stringify([]),
                done);
    });
});

describe('Creating new cities', function () {
    it('Returns a 201 status code', function (done) {
        request(app)
            .post('/categories')
            .send('name=Hello&description=just+saying+hi')
            .expect(201, done);
    });

    it('Returns the category name', function (done) {
        request(app)
            .post('/categories')
            .send('name=Hello&description=just+saying+hi')
            .expect('Content-Type', /json/)
            .expect(JSON.stringify('Hello'), done);
    });

    it('validates category names and description', function (done) {
        request(app)
            .post('/categories')
            .send('name=&description=just+saying+hi')
            .expect(400)
            .expect('Content-Type', /json/)
            .expect(JSON.stringify('Invalid Category Name'), done);

        request(app)
            .post('/categories')
            .send('name=helloo&description=')
            .expect(400)
            .expect('Content-Type', /json/)
            .expect(JSON.stringify('Invalid Description'), done);
    });
});

describe('Deleting Categories', function() {
    before(function() {
        client.hset('categories', 'Poop', 'its not only smellz');
    });

    after(function() {
        client.flushdb();
    });

    it('Returns a 204 status code', function(done) {
        request(app)
            .delete('/categories/Poop')
            .expect(204, done);
    });
});