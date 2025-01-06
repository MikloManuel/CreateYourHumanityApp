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

describe('FormulaData e2e test', () => {
  const formulaDataPageUrl = '/formula-data';
  const formulaDataPageUrlPattern = new RegExp('/formula-data(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const formulaDataSample = {};

  let formulaData;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/formula-data+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/formula-data').as('postEntityRequest');
    cy.intercept('DELETE', '/api/formula-data/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (formulaData) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/formula-data/${formulaData.id}`,
      }).then(() => {
        formulaData = undefined;
      });
    }
  });

  it('FormulaData menu should load FormulaData page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('formula-data');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('FormulaData').should('exist');
    cy.url().should('match', formulaDataPageUrlPattern);
  });

  describe('FormulaData page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(formulaDataPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create FormulaData page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/formula-data/new$'));
        cy.getEntityCreateUpdateHeading('FormulaData');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', formulaDataPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/formula-data',
          body: formulaDataSample,
        }).then(({ body }) => {
          formulaData = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/formula-data+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [formulaData],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(formulaDataPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details FormulaData page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('formulaData');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', formulaDataPageUrlPattern);
      });

      it('edit button click should load edit FormulaData page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('FormulaData');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', formulaDataPageUrlPattern);
      });

      it('edit button click should load edit FormulaData page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('FormulaData');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', formulaDataPageUrlPattern);
      });

      it('last delete button click should delete instance of FormulaData', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('formulaData').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', formulaDataPageUrlPattern);

        formulaData = undefined;
      });
    });
  });

  describe('new FormulaData page', () => {
    beforeEach(() => {
      cy.visit(`${formulaDataPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('FormulaData');
    });

    it('should create an instance of FormulaData', () => {
      cy.get(`[data-cy="map"]`).type('eigentlich leichtfüssig unverwundbar');
      cy.get(`[data-cy="map"]`).should('have.value', 'eigentlich leichtfüssig unverwundbar');

      cy.get(`[data-cy="created"]`).type('2024-07-22T11:54');
      cy.get(`[data-cy="created"]`).blur();
      cy.get(`[data-cy="created"]`).should('have.value', '2024-07-22T11:54');

      cy.get(`[data-cy="modified"]`).type('2024-07-22T06:28');
      cy.get(`[data-cy="modified"]`).blur();
      cy.get(`[data-cy="modified"]`).should('have.value', '2024-07-22T06:28');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        formulaData = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', formulaDataPageUrlPattern);
    });
  });
});
