import {
  entityTableSelector,
  entityDetailsButtonSelector,
  entityDetailsBackButtonSelector,
  entityCreateButtonSelector,
  entityCreateSaveButtonSelector,
  entityCreateCancelButtonSelector,
  entityEditButtonSelector,
  entityDeleteButtonSelector,
  entityConfirmDeleteButtonSelector,
} from '../../support/entity';

describe('Friendrequest e2e test', () => {
  const friendrequestPageUrl = '/friendrequest';
  const friendrequestPageUrlPattern = new RegExp('/friendrequest(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const friendrequestSample = {};

  let friendrequest;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/friendrequests+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/friendrequests').as('postEntityRequest');
    cy.intercept('DELETE', '/api/friendrequests/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (friendrequest) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/friendrequests/${friendrequest.id}`,
      }).then(() => {
        friendrequest = undefined;
      });
    }
  });

  it('Friendrequests menu should load Friendrequests page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('friendrequest');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Friendrequest').should('exist');
    cy.url().should('match', friendrequestPageUrlPattern);
  });

  describe('Friendrequest page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(friendrequestPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Friendrequest page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/friendrequest/new$'));
        cy.getEntityCreateUpdateHeading('Friendrequest');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', friendrequestPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/friendrequests',
          body: friendrequestSample,
        }).then(({ body }) => {
          friendrequest = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/friendrequests+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [friendrequest],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(friendrequestPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details Friendrequest page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('friendrequest');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', friendrequestPageUrlPattern);
      });

      it('edit button click should load edit Friendrequest page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Friendrequest');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', friendrequestPageUrlPattern);
      });

      it('edit button click should load edit Friendrequest page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Friendrequest');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', friendrequestPageUrlPattern);
      });

      it('last delete button click should delete instance of Friendrequest', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('friendrequest').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', friendrequestPageUrlPattern);

        friendrequest = undefined;
      });
    });
  });

  describe('new Friendrequest page', () => {
    beforeEach(() => {
      cy.visit(`${friendrequestPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Friendrequest');
    });

    it('should create an instance of Friendrequest', () => {
      cy.get(`[data-cy="requestDate"]`).type('2024-07-22T20:42');
      cy.get(`[data-cy="requestDate"]`).blur();
      cy.get(`[data-cy="requestDate"]`).should('have.value', '2024-07-22T20:42');

      cy.get(`[data-cy="requestUserId"]`).type('während');
      cy.get(`[data-cy="requestUserId"]`).should('have.value', 'während');

      cy.get(`[data-cy="info"]`).type('../fake-data/blob/hipster.txt');
      cy.get(`[data-cy="info"]`).invoke('val').should('match', new RegExp('../fake-data/blob/hipster.txt'));

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        friendrequest = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', friendrequestPageUrlPattern);
    });
  });
});
