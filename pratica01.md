# Exercicios

npm install
npm start
URL: http://localhost:3001/api-docs/

# Test Suite Overview

The file contains 60+ test cases organized into 8 test suites:

1. Happy Path - Basic Requests (5 tests)

* Default parameters, pagination, size filters, industry filters, and combined filters

2. Response Structure Validation (5 tests)

Customer object validation, address structure, contactInfo structure, and pageInfo validation
Size Filter Validation (6 tests)

Tests all 5 size categories (Small, Medium, Enterprise, Large Enterprise, Very Large Enterprise)
Plus the "All" default filter
Industry Filter Validation (6 tests)

Tests all 5 industries (Logistics, Retail, Technology, HR, Finance)
Plus the "All" default filter
Pagination (3 tests)

Limit parameter, page navigation, and page info consistency
Error Handling (10 tests)

Negative values, non-numeric values, zero values, float values for page/limit
Invalid size and industry filters
Case Sensitivity (2 tests)

Tests handling of lowercase filter values
Edge Cases (5 tests)

Empty result sets, null fields, large limits, and filter combinations
The tests verify all requirements including employee-based size categorization, proper error codes, and response structure compliance.
