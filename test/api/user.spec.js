const _ = require('lodash');
const server = require('../../src/server');
const { User } = require('../../src/models');
const data = require('../util/data');
const expect = require('expect');

describe('User API', () => {

  describe('POST /api/user', () => {
    beforeEach(async () => {
      await User.remove({});
    });

    ['first_name', 'last_name', 'email'].forEach(field => {
      it(`should fail if ${field} not present`, done => {
        chai.request(server)
          .post('/api/user')
          .send(_.omit(data.user, field))
          .end(err => {
            expect(err).toExist;
            expect(err.status).toEqual(409);
            done();
          });
      });
    });

    it('should fail if passwords do not match', done => {
      const user = Object.assign({}, data.user, { password: '__different__' });
      chai.request(server)
        .post('/api/user')
        .send(user)
        .end(err => {
          expect(err).toExist;
          expect(err.status).toEqual(409);
          done();
        });
    });

    it('should fail if user already exists', done => {
      User.create(data.user)
        .then(() => {
          chai.request(server)
            .post('/api/user')
            .send(data.user)
            .end(err => {
              expect(err).toExist;
              expect(err.status).toEqual(409);
              done();
            });
        })
        .catch(err => {
          throw err;
        });
    });

    it('should deliver user and token if successful', done => {
      chai.request(server)
        .post('/api/user')
        .send(data.user)
        .end((err, res) => {
          expect(err).not.toExist;
          expect(res.status).toEqual(201);
          expect(res.body.success).toBe(true);
          expect(res.body.user).toBeA('object');
          expect(res.body.user.id).toBeA('string');
          expect(res.body.token).toBeA('string');
          done();
        });
    });
  });

  describe('POST /api/login', () => {
    beforeEach(async () => {
      await User.remove({});
      await chai.request(server)
        .post('/api/user')
        .send(data.user);
    });

    it('should fail if email not found', done => {
      chai.request(server)
        .post('/api/login')
        .send({ email: 'notfound@email.com', password: data.password })
        .end(err => {
          expect(err).toExist;
          expect(err.status).toEqual(401);
          done();
        });
    });

    it('should fail if password invalid', done => {
      chai.request(server)
        .post('/api/login')
        .send({ email: data.email, password: '__wrong__' })
        .end(err => {
          expect(err).toExist;
          expect(err.status).toEqual(401);
          done();
        });
    });

    it('should deliver user and token if successful', done => {
      chai.request(server)
        .post('/api/login')
        .send({ email: data.email, password: data.password })
        .end((err, res) => {
          expect(err).not.toExist;
          expect(res.status).toEqual(200);
          expect(res.body.success).toBe(true);
          expect(res.body.user).toBeA('object');
          expect(res.body.user.id).toBeA('string');
          expect(res.body.token).toBeA('string');
          done();
        });
    });
  });

  describe('PUT /api/user/:userId', () => {
    let loggedInUser;

    beforeEach(async () => {
      await User.remove({});
      loggedInUser = await chai.request(server)
        .post('/api/user')
        .send(data.user)
        .then(res => res.body.user);
    });

    it('should update the user data', (done) => {
      const updatedUser = Object.assign({}, data.user, { first_name: 'Elon', last_name: 'Musk' });
      chai.request(server)
        .put(`/api/user/${loggedInUser.id}`)
        .send(updatedUser)
        .end((err, res) => {
          expect(err).not.to.exist;
          expect(res.status).toEqual(200);
          expect(res.body.success).toBe(true);
          expect(res.body.user).toBeA('object');
          expect(res.body.user.id).toBeA('string');
          expect(res.body.user.first_name).toEqual('Elon');
          expect(res.body.user.last_name).toEqual('Musk');
          done();
        });
    });
  });
});
