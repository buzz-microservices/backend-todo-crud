const assert = require('assert');
const expect = require('chai').expect
const request = require('supertest');
const server = require('./server')

describe('Unit testing the /todos/health route', function() {

    it('should return OK status', function() {
      return request(server)
        .get('/todos/health')
        .then(function(response){
            assert.equal(response.status, 200)
        })
    });

});