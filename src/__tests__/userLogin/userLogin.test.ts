// src/__tests__/userRegister.test.ts
import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import router from "../../routes/user.auth"; // your router file
import { UserModel } from "../../models/user.model"; // your Mongoose User model
import * as crudService from "../../utils/handleCrudOperation";
import * as passwordUtils from "../../utils/passwordUtils";
import * as validator from "../../utils/userValidation";

const app = express();
app.use(express.json());
app.use("/api/auth", router);

// -------------------- UNIT TEST SETUP --------------------
jest.mock("../../utils/handleCrudOperation");
jest.mock("../../utils/passwordUtils");
jest.mock("../../utils/userValidation");
beforeEach(() => {
    jest.clearAllMocks();
});

// -------------------- INTEGRATION TEST SETUP --------------------
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await UserModel.deleteMany({});
});


//unit test cases of loginUser 
describe('UNIT TEST - POST /userLogin', () => {
    it("should return 400 if request body empty", async () => {
        const response = await request(app).post('/api/auth/userLogin').send({ params: {} })
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ success: false, status: 400, message: "params are required", data: [] });
    })

    it("shoulb user Found are not in DB", async () => {
        (crudService.handleCrudOperation as jest.Mock).mockResolvedValue({
            success: true,
            data: [{
                "email": "prathap.developer@example.com",
                "password": "StrongPassword@123"
            }]
        });
        const userFoundAreNot = await request(app).post('/api/auth/userLogin').send({ params: { "email": "prathap.developer@example.com", "password": "StrongPassword@123" } })
        console.log("userFoundAreNot", userFoundAreNot.status)
        // expect(userFoundAreNot.status).toBe(200);

    })
})