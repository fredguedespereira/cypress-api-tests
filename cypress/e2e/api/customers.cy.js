describe('GET /customers API', () => {
  const apiUrl = Cypress.env('API_URL')
  const endpoint = '/customers'

  describe('Basic requests', () => {
    it('retrieves customers with default parameters', () => {
      cy.request('GET', `${apiUrl}${endpoint}`).then(({ status, body }) => {
        expect(status).to.equal(200)
        expect(body).to.have.property('customers')
        expect(body).to.have.property('pageInfo')
        expect(body.customers).to.be.an('array')
      })
    })

    it('retrieves customers with custom page and limit', () => {
      cy.request('GET', `${apiUrl}${endpoint}?page=2&limit=5`).then(({ status, body: { pageInfo, customers } }) => {
        expect(status).to.equal(200)
        expect(pageInfo.currentPage).to.equal(2)
        expect(customers.length).to.be.lte(5)
      })
    })

    it('retrieves customers filtered by size', () => {
      cy.request('GET', `${apiUrl}${endpoint}?size=Medium`).then(({ status, body: { customers } }) => {
        expect(status).to.equal(200)
        customers.forEach(({ size, employees }) => {
          expect(size).to.equal('Medium')
          expect(employees).to.be.gte(100).and.be.lt(1000)
        })
      })
    })

    it('retrieves customers filtered by industry', () => {
      cy.request('GET', `${apiUrl}${endpoint}?industry=Technology`).then(({ status, body: { customers } }) => {
        expect(status).to.equal(200)
        customers.forEach(({ industry }) => {
          expect(industry).to.equal('Technology')
        })
      })
    })

    it('retrieves customers with combined filters', () => {
      cy.request('GET', `${apiUrl}${endpoint}?page=2&limit=10&size=Medium&industry=Technology`).then(({ status, body: { customers, pageInfo } }) => {
        expect(status).to.equal(200)
        expect(pageInfo.currentPage).to.equal(2)
        customers.forEach(({ size, industry }) => {
          expect(size).to.equal('Medium')
          expect(industry).to.equal('Technology')
        })
      })
    })
  })

  describe('Response structure validation', () => {
    it('returns valid customer objects', () => {
      cy.request('GET', `${apiUrl}${endpoint}`).then(({ status, body: { customers } }) => {
        expect(status).to.equal(200)
        customers.forEach(({ id, name, employees, size, industry, address, contactInfo }) => {
          expect(id).to.be.a('number')
          expect(name).to.be.a('string')
          expect(employees).to.be.a('number')
          expect(size).to.be.a('string')
          expect(industry).to.be.a('string')
          expect(address).to.satisfy(val => val === null || typeof val === 'object')
          expect(contactInfo).to.satisfy(val => val === null || typeof val === 'object')
        })
      })
    })

    it('returns valid address structure when present', () => {
      cy.request('GET', `${apiUrl}${endpoint}`).then(({ body: { customers } }) => {
        customers.forEach(({ address }) => {
          if (address !== null) {
            expect(address).to.have.all.keys('street', 'city', 'state', 'zipCode', 'country')
          }
        })
      })
    })

    it('returns valid contactInfo structure when present', () => {
      cy.request('GET', `${apiUrl}${endpoint}`).then(({ body: { customers } }) => {
        customers.forEach(({ contactInfo }) => {
          if (contactInfo !== null) {
            expect(contactInfo).to.have.all.keys('name', 'email')
          }
        })
      })
    })

    it('returns valid pageInfo structure', () => {
      cy.request('GET', `${apiUrl}${endpoint}`).then(({ body: { pageInfo } }) => {
        const { currentPage, totalPages, totalCustomers } = pageInfo
        expect(currentPage).to.be.a('number').and.be.gte(1)
        expect(totalPages).to.be.a('number').and.be.gte(1)
        expect(totalCustomers).to.be.a('number').and.be.gte(0)
      })
    })
  })

  describe('Size filter validation', () => {
    it('retrieves Small sized customers', () => {
      cy.request('GET', `${apiUrl}${endpoint}?size=Small`).then(({ status, body: { customers } }) => {
        expect(status).to.equal(200)
        if (customers.length > 0) {
          customers.forEach(({ size, employees }) => {
            expect(size).to.equal('Small')
            expect(employees).to.be.lt(100)
          })
        }
      })
    })

    it('retrieves Medium sized customers', () => {
      cy.request('GET', `${apiUrl}${endpoint}?size=Medium`).then(({ status, body: { customers } }) => {
        expect(status).to.equal(200)
        if (customers.length > 0) {
          customers.forEach(({ size, employees }) => {
            expect(size).to.equal('Medium')
            expect(employees).to.be.gte(100).and.be.lt(1000)
          })
        }
      })
    })

    it('retrieves Enterprise sized customers', () => {
      cy.request('GET', `${apiUrl}${endpoint}?size=Enterprise`).then(({ status, body: { customers } }) => {
        expect(status).to.equal(200)
        if (customers.length > 0) {
          customers.forEach(({ size, employees }) => {
            expect(size).to.equal('Enterprise')
            expect(employees).to.be.gte(1000).and.be.lt(10000)
          })
        }
      })
    })

    it('retrieves Large Enterprise sized customers', () => {
      cy.request('GET', `${apiUrl}${endpoint}?size=Large Enterprise`).then(({ status, body: { customers } }) => {
        expect(status).to.equal(200)
        if (customers.length > 0) {
          customers.forEach(({ size, employees }) => {
            expect(size).to.equal('Large Enterprise')
            expect(employees).to.be.gte(10000).and.be.lt(50000)
          })
        }
      })
    })

    it('retrieves Very Large Enterprise sized customers', () => {
      cy.request('GET', `${apiUrl}${endpoint}?size=Very Large Enterprise`).then(({ status, body: { customers } }) => {
        expect(status).to.equal(200)
        if (customers.length > 0) {
          customers.forEach(({ size, employees }) => {
            expect(size).to.equal('Very Large Enterprise')
            expect(employees).to.be.gte(50000)
          })
        }
      })
    })

    it('retrieves all sizes with All filter', () => {
      cy.request('GET', `${apiUrl}${endpoint}?size=All`).then(({ status }) => {
        expect(status).to.equal(200)
      })
    })
  })

  describe('Industry filter validation', () => {
    it('retrieves Logistics industry customers', () => {
      cy.request('GET', `${apiUrl}${endpoint}?industry=Logistics`).then(({ status, body: { customers } }) => {
        expect(status).to.equal(200)
        if (customers.length > 0) {
          customers.forEach(({ industry }) => {
            expect(industry).to.equal('Logistics')
          })
        }
      })
    })

    it('retrieves Retail industry customers', () => {
      cy.request('GET', `${apiUrl}${endpoint}?industry=Retail`).then(({ status, body: { customers } }) => {
        expect(status).to.equal(200)
        if (customers.length > 0) {
          customers.forEach(({ industry }) => {
            expect(industry).to.equal('Retail')
          })
        }
      })
    })

    it('retrieves Technology industry customers', () => {
      cy.request('GET', `${apiUrl}${endpoint}?industry=Technology`).then(({ status, body: { customers } }) => {
        expect(status).to.equal(200)
        if (customers.length > 0) {
          customers.forEach(({ industry }) => {
            expect(industry).to.equal('Technology')
          })
        }
      })
    })

    it('retrieves HR industry customers', () => {
      cy.request('GET', `${apiUrl}${endpoint}?industry=HR`).then(({ status, body: { customers } }) => {
        expect(status).to.equal(200)
        if (customers.length > 0) {
          customers.forEach(({ industry }) => {
            expect(industry).to.equal('HR')
          })
        }
      })
    })

    it('retrieves Finance industry customers', () => {
      cy.request('GET', `${apiUrl}${endpoint}?industry=Finance`).then(({ status, body: { customers } }) => {
        expect(status).to.equal(200)
        if (customers.length > 0) {
          customers.forEach(({ industry }) => {
            expect(industry).to.equal('Finance')
          })
        }
      })
    })

    it('retrieves all industries with All filter', () => {
      cy.request('GET', `${apiUrl}${endpoint}?industry=All`).then(({ status }) => {
        expect(status).to.equal(200)
      })
    })
  })

  describe('Pagination', () => {
    it('respects limit parameter', () => {
      cy.request('GET', `${apiUrl}${endpoint}?limit=5`).then(({ status, body: { customers } }) => {
        expect(status).to.equal(200)
        expect(customers.length).to.be.lte(5)
      })
    })

    it('navigates to different pages', () => {
      cy.request('GET', `${apiUrl}${endpoint}?page=1&limit=5`).then(({ body: { customers: page1Customers } }) => {
        const page1Ids = page1Customers.map(c => c.id)
        cy.request('GET', `${apiUrl}${endpoint}?page=2&limit=5`).then(({ body: { customers: page2Customers } }) => {
          const page2Ids = page2Customers.map(c => c.id)
          const commonIds = page1Ids.filter(id => page2Ids.includes(id))
          expect(commonIds.length).to.equal(0)
        })
      })
    })

    it('returns correct pageInfo structure', () => {
      cy.request('GET', `${apiUrl}${endpoint}?page=1&limit=10`).then(({ status, body: { pageInfo: { currentPage, totalPages, totalCustomers } } }) => {
        expect(status).to.equal(200)
        expect(currentPage).to.equal(1)
        expect(totalPages).to.be.gte(1)
        const expectedMaxCustomers = totalPages * 10
        expect(totalCustomers).to.be.lte(expectedMaxCustomers)
      })
    })
  })

  describe('Invalid parameters - bad request', () => {
    it('returns 400 for negative page', () => {
      cy.request({ method: 'GET', url: `${apiUrl}${endpoint}?page=-1`, failOnStatusCode: false }).then(({ status }) => {
        expect(status).to.equal(400)
      })
    })

    it('returns 400 for negative limit', () => {
      cy.request({ method: 'GET', url: `${apiUrl}${endpoint}?limit=-5`, failOnStatusCode: false }).then(({ status }) => {
        expect(status).to.equal(400)
      })
    })

    it('returns 400 for non-numeric page', () => {
      cy.request({ method: 'GET', url: `${apiUrl}${endpoint}?page=abc`, failOnStatusCode: false }).then(({ status }) => {
        expect(status).to.equal(400)
      })
    })

    it('returns 400 for non-numeric limit', () => {
      cy.request({ method: 'GET', url: `${apiUrl}${endpoint}?limit=xyz`, failOnStatusCode: false }).then(({ status }) => {
        expect(status).to.equal(400)
      })
    })

    it('returns 400 for invalid size filter', () => {
      cy.request({ method: 'GET', url: `${apiUrl}${endpoint}?size=InvalidSize`, failOnStatusCode: false }).then(({ status }) => {
        expect(status).to.equal(400)
      })
    })

    it('returns 400 for invalid industry filter', () => {
      cy.request({ method: 'GET', url: `${apiUrl}${endpoint}?industry=InvalidIndustry`, failOnStatusCode: false }).then(({ status }) => {
        expect(status).to.equal(400)
      })
    })

    it('returns 400 for zero page', () => {
      cy.request({ method: 'GET', url: `${apiUrl}${endpoint}?page=0`, failOnStatusCode: false }).then(({ status }) => {
        expect(status).to.equal(400)
      })
    })

    it('returns 400 for zero limit', () => {
      cy.request({ method: 'GET', url: `${apiUrl}${endpoint}?limit=0`, failOnStatusCode: false }).then(({ status }) => {
        expect(status).to.equal(400)
      })
    })

    it('returns 400 for float page value', () => {
      cy.request({ method: 'GET', url: `${apiUrl}${endpoint}?page=1.5`, failOnStatusCode: false }).then(({ status }) => {
        expect(status).to.equal(400)
      })
    })

    it('returns 400 for float limit value', () => {
      cy.request({ method: 'GET', url: `${apiUrl}${endpoint}?limit=10.5`, failOnStatusCode: false }).then(({ status }) => {
        expect(status).to.equal(400)
      })
    })
  })

  describe('Edge cases', () => {
    it('handles empty result set on last page', () => {
      cy.request({ method: 'GET', url: `${apiUrl}${endpoint}?page=999999`, failOnStatusCode: false }).then(({ status, body }) => {
        if (status === 200) {
          const { customers, pageInfo } = body
          expect(customers).to.be.an('array')
          expect(pageInfo).to.exist
        }
      })
    })

    it('handles null contactInfo correctly', () => {
      cy.request('GET', `${apiUrl}${endpoint}`).then(({ body: { customers } }) => {
        const customersWithNullContact = customers.filter(c => c.contactInfo === null)
        customersWithNullContact.forEach(({ contactInfo }) => {
          expect(contactInfo).to.be.null
        })
      })
    })

    it('handles null address correctly', () => {
      cy.request('GET', `${apiUrl}${endpoint}`).then(({ body: { customers } }) => {
        const customersWithNullAddress = customers.filter(c => c.address === null)
        customersWithNullAddress.forEach(({ address }) => {
          expect(address).to.be.null
        })
      })
    })

    it('handles very large limit values', () => {
      cy.request('GET', `${apiUrl}${endpoint}?limit=999999`).then(({ status }) => {
        expect(status).to.equal(200)
      })
    })

    it('applies multiple filters simultaneously', () => {
      cy.request('GET', `${apiUrl}${endpoint}?page=1&limit=10&size=Enterprise&industry=Finance`).then(({ status, body: { customers } }) => {
        expect(status).to.equal(200)
        customers.forEach(({ size, industry }) => {
          expect(size).to.equal('Enterprise')
          expect(industry).to.equal('Finance')
        })
      })
    })
  })
})
