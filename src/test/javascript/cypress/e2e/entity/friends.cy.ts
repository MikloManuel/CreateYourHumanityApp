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

describe('Friends e2e test', () => {
  const friendsPageUrl = '/friends';
  const friendsPageUrlPattern = new RegExp('/friends(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const friendsSample = {};

  let friends;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/friends+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/friends').as('postEntityRequest');
    cy.intercept('DELETE', '/api/friends/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (friends) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/friends/${friends.id}`,
      }).then(() => {
        friends = undefined;
      });
    }
  });

  it('Friends menu should load Friends page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('friends');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Friends').should('exist');
    cy.url().should('match', friendsPageUrlPattern);
  });

  describe('Friends page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(friendsPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Friends page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/friends/new$'));
        cy.getEntityCreateUpdateHeading('Friends');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', friendsPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/friends',
          body: friendsSample,
        }).then(({ body }) => {
          friends = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/friends+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [friends],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(friendsPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details Friends page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('friends');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', friendsPageUrlPattern);
      });

      it('edit button click should load edit Friends page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Friends');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', friendsPageUrlPattern);
      });

      it('edit button click should load edit Friends page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Friends');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', friendsPageUrlPattern);
      });

      it('last delete button click should delete instance of Friends', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('friends').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', friendsPageUrlPattern);

        friends = undefined;
      });
    });
  });

  describe('new Friends page', () => {
    beforeEach(() => {
      cy.visit(`${friendsPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Friends');
    });

    it('should create an instance of Friends', () => {
      cy.get(`[data-cy="connectDate"]`).type('2024-07-22T23:53');
      cy.get(`[data-cy="connectDate"]`).blur();
      cy.get(`[data-cy="connectDate"]`).should('have.value', '2024-07-22T23:53');

      cy.get(`[data-cy="friendId"]`).type('circa');
      cy.get(`[data-cy="friendId"]`).should('have.value', 'circa');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        friends = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', friendsPageUrlPattern);
    });
  });
});
