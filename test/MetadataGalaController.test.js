const app = require("../app");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const supertest = require("supertest");
require("dotenv").config();


const payload1 = {
  "name" : "The Lab1",
  "description" : "Precision is a form of madness allied with the physics of movement solving the improbable equation to the symphony of a ‘swish.’1",
  "image" : "https://luna-bucket.s3.us-east-2.amazonaws.com/The_Lab1.png",
  "externalUrl": "currybrand.com",
  "animationUrl": "https://luna-bucket.s3.us-east-2.amazonaws.com/The_Lab1.mp4",
  "feeRecipient":"0xBbF1abFA6a5Cee3103f6ea44341c014631A11AF7",
  "tokenId" : "1"
}

const payload2 = {
  "name" : "The Lab1",
  "description" : "Precision is a form of madness allied with the physics of movement solving the improbable equation to the symphony of a ‘swish.’2",
  "image" : "https://luna-bucket.s3.us-east-2.amazonaws.com/The_Lab2.png",
  "externalUrl": "currybrand.com",
  "animationUrl": "https://luna-bucket.s3.us-east-2.amazonaws.com/The_Lab2.mp4",
  "feeRecipient":"0xBbF1abFA6a5Cee3103f6ea44341c014631A11AF7",
  "tokenId" : "2"
}

const payload3 = {
  "name" : "The Lab3",
  "description" : "Precision is a form of madness allied with the physics of movement solving the improbable equation to the symphony of a ‘swish.’3",
  "image" : "https://luna-bucket.s3.us-east-2.amazonaws.com/The_Lab3.png",
  "externalUrl": "currybrand.com",
  "animationUrl": "https://luna-bucket.s3.us-east-2.amazonaws.com/The_Lab3.mp4",
  "feeRecipient":"0xBbF1abFA6a5Cee3103f6ea44341c014631A11AF7",
  "tokenId" : "3"
}
describe("MetadataD1", () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();

    await mongoose.connect(mongoServer.getUri());
    
    await supertest(app).post('/api/metadata/gala/create').send(payload1);
    await supertest(app).post('/api/metadata/gala/create').send(payload2);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });

  describe("get metadata by id", () => {
    describe("given the metadata does not exist", () => {
      it("should return a empty array", async () => {
        const tokenId = 999999999;

        const { body, statusCode } = await supertest(app).get(`/api/metadata/gala/get/${tokenId}`);
        expect(statusCode).toBe(200);
        expect(body).toEqual({});
      });
    });
    describe("given the metadata does exist", () => {
      it("should return a 200 status and the metadata", async () => {
        const tokenId = 1;

        const { body, statusCode } = await supertest(app).get(`/api/metadata/gala/get/${tokenId}`);
        expect(statusCode).toBe(200);
        expect(body.tokenId).toEqual(payload1.tokenId);
        expect(body.description).toEqual(payload1.description);
      });
    });
  });

  describe("get all metadata", () => {
    it("should return a 200 status and all the metadata", async () => {

      const { body, statusCode } = await supertest(app).get(`/api/metadata/gala/getAll`);
      expect(statusCode).toBe(200);
      expect(body.length).toBe(2);
      expect(body[0].tokenId).toEqual("1");
      expect(body[1].tokenId).toEqual("2");
    });
  });

  describe("create metadata", () => {
    // describe("given the metadata does exist", () => {
    //   it("should return a 500 status", async () => {
    //     await supertest(app).post('/api/metadata/gala/create').send(payload1).expect(500);
    //   });
    // });

    describe("given the metadata does not exist", () => {
      it("success to create metadata", async () => {
        await supertest(app).post('/api/metadata/gala/create').send(payload3).expect(200);
        const { body, statusCode } = await supertest(app).get(`/api/metadata/gala/get/3`);
        expect(statusCode).toBe(200);
        expect(body).toEqual({
          "_id":expect.any(String),
          "name":"The Lab3",
          "description":"Precision is a form of madness allied with the physics of movement solving the improbable equation to the symphony of a ‘swish.’3",
          "image" : "https://luna-bucket.s3.us-east-2.amazonaws.com/The_Lab3.png",
          "external_url": "currybrand.com",
          "animation_url": "https://luna-bucket.s3.us-east-2.amazonaws.com/The_Lab3.mp4",
          "tokenId":"3",
          "fee_recipient":"0xBbF1abFA6a5Cee3103f6ea44341c014631A11AF7",
          "createdAt":expect.any(String),
          "updatedAt":expect.any(String),
          "__v":0
        });
      });
    });
  });

});
