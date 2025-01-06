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

describe('KeyTable e2e test', () => {
  const keyTablePageUrl = '/key-table';
  const keyTablePageUrlPattern = new RegExp('/key-table(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const keyTableSample = {};

  let keyTable;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/key-tables+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/key-tables').as('postEntityRequest');
    cy.intercept('DELETE', '/api/key-tables/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (keyTable) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/key-tables/${keyTable.id}`,
      }).then(() => {
        keyTable = undefined;
      });
    }
  });

  it('KeyTables menu should load KeyTables page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('key-table');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('KeyTable').should('exist');
    cy.url().should('match', keyTablePageUrlPattern);
  });

  describe('KeyTable page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(keyTablePageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create KeyTable page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/key-table/new$'));
        cy.getEntityCreateUpdateHeading('KeyTable');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', keyTablePageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/key-tables',
          body: keyTableSample,
        }).then(({ body }) => {
          keyTable = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/key-tables+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [keyTable],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(keyTablePageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details KeyTable page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('keyTable');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', keyTablePageUrlPattern);
      });

      it('edit button click should load edit KeyTable page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('KeyTable');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', keyTablePageUrlPattern);
      });

      it('edit button click should load edit KeyTable page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('KeyTable');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', keyTablePageUrlPattern);
      });

      it('last delete button click should delete instance of KeyTable', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('keyTable').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', keyTablePageUrlPattern);

        keyTable = undefined;
      });
    });
  });

  describe('new KeyTable page', () => {
    beforeEach(() => {
      cy.visit(`${keyTablePageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('KeyTable');
    });

    it('should create an instance of KeyTable', () => {
      cy.get(`[data-cy="key"]`).type('where');
      cy.get(`[data-cy="key"]`).should('have.value', 'where');

      cy.get(`[data-cy="created"]`).type('2024-07-22T04:06');
      cy.get(`[data-cy="created"]`).blur();
      cy.get(`[data-cy="created"]`).should('have.value', '2024-07-22T04:06');

      cy.get(`[data-cy="modified"]`).type('2024-07-22T19:43');
      cy.get(`[data-cy="modified"]`).blur();
      cy.get(`[data-cy="modified"]`).should('have.value', '2024-07-22T19:43');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        keyTable = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', keyTablePageUrlPattern);
    });
  });
});
