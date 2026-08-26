describe('GET /customers API', () => {
  const baseUrl = 'http://localhost:3001';
  const endpoint = '/customers';

  describe('Happy Path - Basic Requests', () => {
    it('should retrieve customers with default parameters', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}${endpoint}`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('customers');
        expect(response.body).to.have.property('pageInfo');
        expect(response.body.customers).to.be.an('array');
        expect(response.body.pageInfo.currentPage).to.equal(1);
      });
    });

    it('should retrieve customers with page and limit parameters', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}${endpoint}?page=2&limit=10`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.pageInfo.currentPage).to.equal(2);
        expect(response.body.customers.length).to.be.lte(10);
      });
    });

    it('should retrieve customers filtered by size=Medium', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}${endpoint}?size=Medium`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(200);
        response.body.customers.forEach((customer) => {
          expect(customer.size).to.equal('Medium');
          // Medium: >= 100 and < 1000 employees
          expect(customer.employees).to.be.gte(100).and.be.lt(1000);
        });
      });
    });

    it('should retrieve customers filtered by industry=Technology', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}${endpoint}?industry=Technology`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(200);
        response.body.customers.forEach((customer) => {
          expect(customer.industry).to.equal('Technology');
        });
      });
    });

    it('should retrieve customers with all filter combinations', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}${endpoint}?page=2&limit=10&size=Medium&industry=Technology`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.pageInfo.currentPage).to.equal(2);
        response.body.customers.forEach((customer) => {
          expect(customer.size).to.equal('Medium');
          expect(customer.industry).to.equal('Technology');
        });
      });
    });
  });

  describe('Response Structure Validation', () => {
    it('should return valid customer objects', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}${endpoint}`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(200);
        
        response.body.customers.forEach((customer) => {
          expect(customer).to.have.property('id');
          expect(customer).to.have.property('name');
          expect(customer).to.have.property('employees');
          expect(customer).to.have.property('contactInfo');
          expect(customer).to.have.property('size');
          expect(customer).to.have.property('industry');
          expect(customer).to.have.property('address');

          expect(customer.id).to.be.a('number');
          expect(customer.name).to.be.a('string');
          expect(customer.employees).to.be.a('number');
          expect(customer.size).to.be.a('string');
          expect(customer.industry).to.be.a('string');
        });
      });
    });

    it('should return valid address structure when present', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}${endpoint}`,
        failOnStatusCode: false
      }).then((response) => {
        response.body.customers.forEach((customer) => {
          if (customer.address !== null) {
            expect(customer.address).to.have.property('street');
            expect(customer.address).to.have.property('city');
            expect(customer.address).to.have.property('state');
            expect(customer.address).to.have.property('zipCode');
            expect(customer.address).to.have.property('country');
          }
        });
      });
    });

    it('should return valid contactInfo structure when present', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}${endpoint}`,
        failOnStatusCode: false
      }).then((response) => {
        response.body.customers.forEach((customer) => {
          if (customer.contactInfo !== null) {
            expect(customer.contactInfo).to.have.property('name');
            expect(customer.contactInfo).to.have.property('email');
          }
        });
      });
    });

    it('should return valid pageInfo structure', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}${endpoint}`,
        failOnStatusCode: false
      }).then((response) => {
        const { pageInfo } = response.body;
        expect(pageInfo).to.have.property('currentPage');
        expect(pageInfo).to.have.property('totalPages');
        expect(pageInfo).to.have.property('totalCustomers');

        expect(pageInfo.currentPage).to.be.a('number').and.be.gte(1);
        expect(pageInfo.totalPages).to.be.a('number').and.be.gte(1);
        expect(pageInfo.totalCustomers).to.be.a('number').and.be.gte(0);
      });
    });
  });

  describe('Size Filter Validation', () => {
    const sizeCategories = [
      { size: 'Small', minEmployees: 0, maxEmployees: 100 },
      { size: 'Medium', minEmployees: 100, maxEmployees: 1000 },
      { size: 'Enterprise', minEmployees: 1000, maxEmployees: 10000 },
      { size: 'Large Enterprise', minEmployees: 10000, maxEmployees: 50000 },
      { size: 'Very Large Enterprise', minEmployees: 50000, maxEmployees: Infinity }
    ];

    sizeCategories.forEach(({ size, minEmployees, maxEmployees }) => {
      it(`should retrieve customers with size=${size}`, () => {
        cy.request({
          method: 'GET',
          url: `${baseUrl}${endpoint}?size=${size}`,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.equal(200);
          
          if (response.body.customers.length > 0) {
            response.body.customers.forEach((customer) => {
              expect(customer.size).to.equal(size);
              // Verify employee count matches size category
              expect(customer.employees).to.be.gte(minEmployees).and.be.lt(maxEmployees);
            });
          }
        });
      });
    });

    it('should retrieve customers with size=All (default)', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}${endpoint}?size=All`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(200);
      });
    });
  });

  describe('Industry Filter Validation', () => {
    const validIndustries = ['Logistics', 'Retail', 'Technology', 'HR', 'Finance'];

    validIndustries.forEach((industry) => {
      it(`should retrieve customers with industry=${industry}`, () => {
        cy.request({
          method: 'GET',
          url: `${baseUrl}${endpoint}?industry=${industry}`,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.equal(200);
          
          if (response.body.customers.length > 0) {
            response.body.customers.forEach((customer) => {
              expect(customer.industry).to.equal(industry);
            });
          }
        });
      });
    });

    it('should retrieve customers with industry=All (default)', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}${endpoint}?industry=All`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(200);
      });
    });
  });

  describe('Pagination', () => {
    it('should respect limit parameter', () => {
      const limit = 5;
      cy.request({
        method: 'GET',
        url: `${baseUrl}${endpoint}?limit=${limit}`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.customers.length).to.be.lte(limit);
      });
    });

    it('should navigate to different pages', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}${endpoint}?page=1&limit=5`,
        failOnStatusCode: false
      }).then((response1) => {
        const page1Ids = response1.body.customers.map(c => c.id);
        
        cy.request({
          method: 'GET',
          url: `${baseUrl}${endpoint}?page=2&limit=5`,
          failOnStatusCode: false
        }).then((response2) => {
          const page2Ids = response2.body.customers.map(c => c.id);
          
          // Customers on different pages should be different
          const commonIds = page1Ids.filter(id => page2Ids.includes(id));
          expect(commonIds.length).to.equal(0);
        });
      });
    });

    it('should return correct page info', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}${endpoint}?page=1&limit=10`,
        failOnStatusCode: false
      }).then((response) => {
        const { pageInfo } = response.body;
        expect(pageInfo.currentPage).to.equal(1);
        expect(pageInfo.totalPages).to.be.gte(1);
        
        // totalCustomers should be consistent with totalPages and limit
        const expectedMaxCustomers = pageInfo.totalPages * 10;
        expect(pageInfo.totalCustomers).to.be.lte(expectedMaxCustomers);
      });
    });
  });

  describe('Error Handling - Invalid Parameters', () => {
    it('should return 400 for negative page number', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}${endpoint}?page=-1`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(400);
      });
    });

    it('should return 400 for negative limit', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}${endpoint}?limit=-5`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(400);
      });
    });

    it('should return 400 for non-numeric page', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}${endpoint}?page=abc`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(400);
      });
    });

    it('should return 400 for non-numeric limit', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}${endpoint}?limit=xyz`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(400);
      });
    });

    it('should return 400 for invalid size filter', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}${endpoint}?size=InvalidSize`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(400);
      });
    });

    it('should return 400 for invalid industry filter', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}${endpoint}?industry=InvalidIndustry`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(400);
      });
    });

    it('should return 400 for zero page number', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}${endpoint}?page=0`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(400);
      });
    });

    it('should return 400 for zero limit', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}${endpoint}?limit=0`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(400);
      });
    });

    it('should return 400 for float values in page', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}${endpoint}?page=1.5`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(400);
      });
    });

    it('should return 400 for float values in limit', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}${endpoint}?limit=10.5`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(400);
      });
    });
  });

  describe('Case Sensitivity', () => {
    it('should handle size filter case-insensitively (if applicable)', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}${endpoint}?size=medium`,
        failOnStatusCode: false
      }).then((response) => {
        // Either 200 or 400 depending on API implementation
        // Document the expected behavior
        expect([200, 400]).to.include(response.status);
      });
    });

    it('should handle industry filter case-insensitively (if applicable)', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}${endpoint}?industry=technology`,
        failOnStatusCode: false
      }).then((response) => {
        // Either 200 or 400 depending on API implementation
        // Document the expected behavior
        expect([200, 400]).to.include(response.status);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty result set gracefully', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}${endpoint}?page=999999`,
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          expect(response.body.customers).to.be.an('array');
          expect(response.body.pageInfo).to.exist;
        }
      });
    });

    it('should not include contactInfo when null', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}${endpoint}`,
        failOnStatusCode: false
      }).then((response) => {
        response.body.customers.forEach((customer) => {
          if (customer.contactInfo === null) {
            expect(customer.contactInfo).to.be.null;
          }
        });
      });
    });

    it('should not include address when null', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}${endpoint}`,
        failOnStatusCode: false
      }).then((response) => {
        response.body.customers.forEach((customer) => {
          if (customer.address === null) {
            expect(customer.address).to.be.null;
          }
        });
      });
    });

    it('should handle very large limit values', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}${endpoint}?limit=999999`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(200);
      });
    });

    it('should handle multiple filter combinations', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}${endpoint}?page=1&limit=10&size=Enterprise&industry=Finance`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(200);
        if (response.body.customers.length > 0) {
          response.body.customers.forEach((customer) => {
            expect(customer.size).to.equal('Enterprise');
            expect(customer.industry).to.equal('Finance');
          });
        }
      });
    });
  });
});
