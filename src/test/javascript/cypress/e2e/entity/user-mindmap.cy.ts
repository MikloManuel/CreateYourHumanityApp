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

describe('UserMindmap e2e test', () => {
  const userMindmapPageUrl = '/user-mindmap';
  const userMindmapPageUrlPattern = new RegExp('/user-mindmap(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const userMindmapSample = {};

  let userMindmap;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/user-mindmaps+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/user-mindmaps').as('postEntityRequest');
    cy.intercept('DELETE', '/api/user-mindmaps/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (userMindmap) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/user-mindmaps/${userMindmap.id}`,
      }).then(() => {
        userMindmap = undefined;
      });
    }
  });

  it('UserMindmaps menu should load UserMindmaps page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('user-mindmap');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('UserMindmap').should('exist');
    cy.url().should('match', userMindmapPageUrlPattern);
  });

  describe('UserMindmap page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(userMindmapPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create UserMindmap page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/user-mindmap/new$'));
        cy.getEntityCreateUpdateHeading('UserMindmap');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', userMindmapPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/user-mindmaps',
          body: userMindmapSample,
        }).then(({ body }) => {
          userMindmap = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/user-mindmaps+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [userMindmap],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(userMindmapPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details UserMindmap page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('userMindmap');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', userMindmapPageUrlPattern);
      });

      it('edit button click should load edit UserMindmap page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('UserMindmap');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', userMindmapPageUrlPattern);
      });

      it('edit button click should load edit UserMindmap page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('UserMindmap');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', userMindmapPageUrlPattern);
      });

      it('last delete button click should delete instance of UserMindmap', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('userMindmap').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', userMindmapPageUrlPattern);

        userMindmap = undefined;
      });
    });
  });

  describe('new UserMindmap page', () => {
    beforeEach(() => {
      cy.visit(`${userMindmapPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('UserMindmap');
    });

    it('should create an instance of UserMindmap', () => {
      cy.get(`[data-cy="text"]`).type('yum wegen gebildet');
      cy.get(`[data-cy="text"]`).should('have.value', 'yum wegen gebildet');

      cy.get(`[data-cy="modified"]`).type('2024-07-22T09:12');
      cy.get(`[data-cy="modified"]`).blur();
      cy.get(`[data-cy="modified"]`).should('have.value', '2024-07-22T09:12');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        userMindmap = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', userMindmapPageUrlPattern);
    });
  });
});
