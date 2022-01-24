const app = require("../app");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const supertest = require("supertest");
require("dotenv").config();


describe("MetadataD1", () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();

    await mongoose.connect(mongoServer.getUri());
    
    await supertest(app).post('/api/subscribe/email/save').send({email : "test@gmail.com"});
    await supertest(app).post('/api/subscribe/email/save').send({email : "test1@gmail.com"});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });

  describe("get all email for subscribe", () => {
    it("should return a 200 status and all the email", async () => {

      const { body, statusCode } = await supertest(app).get(`/api/subscribe/email/getAll`);
      expect(statusCode).toBe(200);
      expect(body.length).toBe(2);
      expect(body[0].email).toEqual("test@gmail.com");
      expect(body[1].email).toEqual("test1@gmail.com");
    });
  });

  describe("create email", () => {

    describe("given the email does not exist", () => {
      it("success to create email", async () => {
        await supertest(app).post('/api/subscribe/email/save').send({email : "test2@gmail.com"}).expect(200);
        const { body, statusCode } = await supertest(app).get(`/api/subscribe/email/getAll`);
        expect(statusCode).toBe(200);
        expect(body.length).toBe(3);
      });
    });

    describe("given the email does exist", () => {
      it("don't create new email.", async () => {
        await supertest(app).post('/api/subscribe/email/save').send({email : "test2@gmail.com"}).expect(200);
        const { body, statusCode } = await supertest(app).get(`/api/subscribe/email/getAll`);
        expect(statusCode).toBe(200);
        expect(body.length).toBe(3);
      });
    });

  });

});
