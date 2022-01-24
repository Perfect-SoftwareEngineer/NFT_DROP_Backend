const app = require("../app");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const supertest = require("supertest");

const Web3 = require("web3");

require("dotenv").config();


let jwtMock = jest.fn();
let web3Mock = jest.fn();


jest.mock("@sendgrid/mail", () => ({
  setApiKey : jest.fn(),
  send : jest.fn()
}));

// jest.mock("Web3", () => jest.fn(() => ({
//   eth : jest.fn(() => ({
//     Contract : jest.fn()
//   })),
//   providers : jest.fn(() => ({
//     HttpProvider : jest.fn()
//   }))
// })));

jest.mock('../src/Middleware/MiddlewareAuth', () => (request, response, next) => {
  request.email = "test@gmail.com";
  return next();
});

web3Mock.mockImplementation(() => ({
  eth : jest.fn(() => ({
    Contract : jest.fn()
  })),
  providers : jest.fn(() => ({
    HttpProvider : jest.fn()
  }))
}))

const payload = {
  email : "test@gmail.com",
  wallet : "0xBbF1abFA6a5Cee3103f6ea44341c014631A11AF7",
  ip : "1.1.1.1",
  country_name : "china",
  date : "2021-12-19T15:20:54.000Z"
}

const payload1 = {
  email : "test@gmail.com",
  wallet : "0xBbF1abFA6a5Cee3103f6ea44341c014631A11AF7",
  ip : "1.1.1.2",
  country_name : "US",
  date : "2021-12-19T15:20:54.000Z"
}

var id;

describe("PaymentInfo", () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();

    await mongoose.connect(mongoServer.getUri());
    const {body} = await supertest(app).post('/api/paymentinfo/create').send(payload);
    id = body;
    
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });

  describe("get payment info by id", () => {
    describe("given the payment info does not exist", () => {
      it("should return a empty array", async () => {
        const _id = "61bf942681ace31e5325a76b";

        const { body, statusCode } = await supertest(app).get(`/api/paymentinfo/get/${_id}`);
        expect(statusCode).toBe(200);
        expect(body).toEqual({});
      });
    });
    describe("given the payment info does exist", () => {
      it("should return a 200 status and the payment info", async () => {

        const { body, statusCode } = await supertest(app).get(`/api/paymentinfo/get/${id}`);
        expect(statusCode).toBe(200);
        expect(body).toEqual({
          "_id": id,
          "email": "test@gmail.com",
          "wallet": "0xbbf1abfa6a5cee3103f6ea44341c014631a11af7",
          "status": "pending",
          "ip": "1.1.1.1",
          "country_name": "china",
          "date": "2021-12-19T15:20:54.000Z",
          "createdAt": expect.any(String),
          "updatedAt": expect.any(String),
          "__v": 0,
        });
      });
    });
  });

  describe("get all payment info", () => {
    it("should return a 200 status and all the payment info", async () => {

      const { body, statusCode } = await supertest(app).get(`/api/paymentinfo/getAll`);
      expect(statusCode).toBe(200);
      expect(body.length).toBe(1);
    });
  });

  describe("create payment info", () => {

    it("success to create metadata", async () => {
      const { body } = await supertest(app).post('/api/paymentinfo/create').send(payload1).expect(200);
      const response = await supertest(app).get(`/api/paymentinfo/get/${body}`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        "_id": body,
        "email": "test@gmail.com",
        "wallet": "0xbbf1abfa6a5cee3103f6ea44341c014631a11af7",
        "status": "pending",
        "ip": "1.1.1.2",
        "country_name": "US",
        "date": "2021-12-19T15:20:54.000Z",
        "createdAt": expect.any(String),
        "updatedAt": expect.any(String),
        "__v": 0,
      });
    });
  });

  describe("get payment info", () => {

    it("success to get payment info count", async () => {
      const {text} = await supertest(app).get('/api/paymentinfo/getCount').send().expect(200);
      expect(text).toEqual("{\"count\":2}");
    });
  });

});
