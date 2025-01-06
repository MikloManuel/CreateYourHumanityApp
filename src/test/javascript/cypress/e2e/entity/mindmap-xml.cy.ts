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

describe('MindmapXml e2e test', () => {
  const mindmapXmlPageUrl = '/mindmap-xml';
  const mindmapXmlPageUrlPattern = new RegExp('/mindmap-xml(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const mindmapXmlSample = {};

  let mindmapXml;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/mindmap-xmls+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/mindmap-xmls').as('postEntityRequest');
    cy.intercept('DELETE', '/api/mindmap-xmls/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (mindmapXml) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/mindmap-xmls/${mindmapXml.id}`,
      }).then(() => {
        mindmapXml = undefined;
      });
    }
  });

  it('MindmapXmls menu should load MindmapXmls page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('mindmap-xml');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('MindmapXml').should('exist');
    cy.url().should('match', mindmapXmlPageUrlPattern);
  });

  describe('MindmapXml page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(mindmapXmlPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create MindmapXml page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/mindmap-xml/new$'));
        cy.getEntityCreateUpdateHeading('MindmapXml');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', mindmapXmlPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/mindmap-xmls',
          body: mindmapXmlSample,
        }).then(({ body }) => {
          mindmapXml = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/mindmap-xmls+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [mindmapXml],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(mindmapXmlPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details MindmapXml page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('mindmapXml');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', mindmapXmlPageUrlPattern);
      });

      it('edit button click should load edit MindmapXml page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('MindmapXml');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', mindmapXmlPageUrlPattern);
      });

      it('edit button click should load edit MindmapXml page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('MindmapXml');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', mindmapXmlPageUrlPattern);
      });

      it('last delete button click should delete instance of MindmapXml', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('mindmapXml').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', mindmapXmlPageUrlPattern);

        mindmapXml = undefined;
      });
    });
  });

  describe('new MindmapXml page', () => {
    beforeEach(() => {
      cy.visit(`${mindmapXmlPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('MindmapXml');
    });

    it('should create an instance of MindmapXml', () => {
      cy.get(`[data-cy="text"]`).type('lechzen allgemach so');
      cy.get(`[data-cy="text"]`).should('have.value', 'lechzen allgemach so');

      cy.get(`[data-cy="modified"]`).type('2024-07-23T02:04');
      cy.get(`[data-cy="modified"]`).blur();
      cy.get(`[data-cy="modified"]`).should('have.value', '2024-07-23T02:04');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        mindmapXml = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', mindmapXmlPageUrlPattern);
    });
  });
});
