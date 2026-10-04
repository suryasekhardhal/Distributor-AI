import { Customer } from "../models/customer.model.js";
import { Company } from "../models/company.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const createCustomer = asyncHandler(async (req, res) => {
  const { name, phone, email, address } = req.body;

  if (!name || !phone) {
    throw new ApiError(400, "Name and phone are required");
  }

  const companyId = req.user.companyId;

  if (!companyId) {
    throw new ApiError(401, "Company information not found");
  }

  // Check duplicate phone inside the same company
  const existingCustomer = await Customer.findOne({
    companyId,
    phone: phone.trim(),
  });

  if (existingCustomer) {
    throw new ApiError(409, "Customer with this phone number already exists");
  }

  const customer = await Customer.create({
    companyId,
    name: name.trim(),
    phone: phone.trim(),
    email: email?.trim().toLowerCase(),
    address: address?.trim(),
  });

  return res
    .status(201)
    .json(new ApiResponse(201, customer, "Customer created successfully"));
});

export const getCustomers = asyncHandler(async (req, res) => {
  //const companyId = req.user.companyId;
  const companyId = "6a8ef1f9a322ec474b207a8b";

  if (!companyId) {
    throw new ApiError(401, "Company information not found");
  }

  const customers = await Customer.find({
    companyId,
    isActive: true,
  }).sort({ createdAt: -1 });
    console.log("Customers Found:", customers.length);
  console.log("Customer Data:", customers);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        count: customers.length,
        customers,
      },
      "Customers fetched successfully",
    ),
  );
});

export const getCustomerById = asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  const companyId = req.user.companyId;

  if (!companyId) {
    throw new ApiError(401, "Company information not found");
  }

  const customer = await Customer.findOne({
    _id: customerId,
    companyId,
    isActive: true,
  });

  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, customer, "Customer fetched successfully"));
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  const companyId = req.user.companyId;

  if (!companyId) {
    throw new ApiError(401, "Company information not found");
  }

  const { name, phone, email, address } = req.body;

  const customer = await Customer.findOne({
    _id: customerId,
    companyId,
    isActive: true,
  });

  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  // If phone is being changed, check duplicate
  if (phone && phone.trim() !== customer.phone) {
    const existingCustomer = await Customer.findOne({
      companyId,
      phone: phone.trim(),
      _id: { $ne: customerId },
    });

    if (existingCustomer) {
      throw new ApiError(
        409,
        "Another customer with this phone number already exists",
      );
    }

    customer.phone = phone.trim();
  }

  if (name !== undefined) {
    customer.name = name.trim();
  }

  if (email !== undefined) {
    customer.email = email?.trim().toLowerCase();
  }

  if (address !== undefined) {
    customer.address = address?.trim();
  }

  await customer.save();

  return res
    .status(200)
    .json(new ApiResponse(200, customer, "Customer updated successfully"));
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  const companyId = req.user.companyId;

  if (!companyId) {
    throw new ApiError(401, "Company information not found");
  }

  const customer = await Customer.findOne({
    _id: customerId,
    companyId,
    isActive: true,
  });

  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  customer.isActive = false;

  await customer.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Customer deleted successfully"));
});

export const searchCustomers = asyncHandler(async (req, res) => {
  const companyId = req.user.companyId;
  const { q } = req.query;

  if (!companyId) {
    throw new ApiError(401, "Company information not found");
  }

  if (!q || !q.trim()) {
    throw new ApiError(400, "Search query is required");
  }

  const searchQuery = q.trim();

  const customers = await Customer.find({
    companyId,
    isActive: true,
    $or: [
      {
        name: {
          $regex: searchQuery,
          $options: "i",
        },
      },
      {
        phone: {
          $regex: searchQuery,
          $options: "i",
        },
      },
      {
        email: {
          $regex: searchQuery,
          $options: "i",
        },
      },
    ],
  }).sort({ name: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, customers, "Customers searched successfully"));
});
