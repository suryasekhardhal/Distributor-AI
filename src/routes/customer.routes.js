import { Router } from "express";

import {
    createCustomer,
    getCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
    searchCustomers,
} from "../controllers/customer.controller.js";

import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.post("/create", createCustomer);

router.get("/", getCustomers);

router.get("/search", searchCustomers);

router.get("/:customerId", getCustomerById);

router.patch("/:customerId", updateCustomer);

router.delete("/:customerId", deleteCustomer);

export default router;
