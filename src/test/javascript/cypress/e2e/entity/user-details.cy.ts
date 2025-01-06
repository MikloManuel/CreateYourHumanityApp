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

describe('UserDetails e2e test', () => {
  const userDetailsPageUrl = '/user-details';
  const userDetailsPageUrlPattern = new RegExp('/user-details(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const userDetailsSample = {};

  let userDetails;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/user-details+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/user-details').as('postEntityRequest');
    cy.intercept('DELETE', '/api/user-details/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (userDetails) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/user-details/${userDetails.id}`,
      }).then(() => {
        userDetails = undefined;
      });
    }
  });

  it('UserDetails menu should load UserDetails page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('user-details');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('UserDetails').should('exist');
    cy.url().should('match', userDetailsPageUrlPattern);
  });

  describe('UserDetails page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(userDetailsPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create UserDetails page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/user-details/new$'));
        cy.getEntityCreateUpdateHeading('UserDetails');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', userDetailsPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/user-details',
          body: userDetailsSample,
        }).then(({ body }) => {
          userDetails = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/user-details+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [userDetails],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(userDetailsPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details UserDetails page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('userDetails');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', userDetailsPageUrlPattern);
      });

      it('edit button click should load edit UserDetails page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('UserDetails');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', userDetailsPageUrlPattern);
      });

      it('edit button click should load edit UserDetails page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('UserDetails');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', userDetailsPageUrlPattern);
      });

      it('last delete button click should delete instance of UserDetails', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('userDetails').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', userDetailsPageUrlPattern);

        userDetails = undefined;
      });
    });
  });

  describe('new UserDetails page', () => {
    beforeEach(() => {
      cy.visit(`${userDetailsPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('UserDetails');
    });

    it('should create an instance of UserDetails', () => {
      cy.get(`[data-cy="dob"]`).type('2024-07-22T08:23');
      cy.get(`[data-cy="dob"]`).blur();
      cy.get(`[data-cy="dob"]`).should('have.value', '2024-07-22T08:23');

      cy.get(`[data-cy="created"]`).type('2024-07-22T10:46');
      cy.get(`[data-cy="created"]`).blur();
      cy.get(`[data-cy="created"]`).should('have.value', '2024-07-22T10:46');

      cy.get(`[data-cy="modified"]`).type('2024-07-22T21:47');
      cy.get(`[data-cy="modified"]`).blur();
      cy.get(`[data-cy="modified"]`).should('have.value', '2024-07-22T21:47');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        userDetails = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', userDetailsPageUrlPattern);
    });
  });
});
