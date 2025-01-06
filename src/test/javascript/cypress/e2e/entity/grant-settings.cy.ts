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

describe('GrantSettings e2e test', () => {
  const grantSettingsPageUrl = '/grant-settings';
  const grantSettingsPageUrlPattern = new RegExp('/grant-settings(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const grantSettingsSample = {};

  let grantSettings;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/grant-settings+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/grant-settings').as('postEntityRequest');
    cy.intercept('DELETE', '/api/grant-settings/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (grantSettings) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/grant-settings/${grantSettings.id}`,
      }).then(() => {
        grantSettings = undefined;
      });
    }
  });

  it('GrantSettings menu should load GrantSettings page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('grant-settings');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('GrantSettings').should('exist');
    cy.url().should('match', grantSettingsPageUrlPattern);
  });

  describe('GrantSettings page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(grantSettingsPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create GrantSettings page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/grant-settings/new$'));
        cy.getEntityCreateUpdateHeading('GrantSettings');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', grantSettingsPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/grant-settings',
          body: grantSettingsSample,
        }).then(({ body }) => {
          grantSettings = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/grant-settings+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [grantSettings],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(grantSettingsPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details GrantSettings page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('grantSettings');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', grantSettingsPageUrlPattern);
      });

      it('edit button click should load edit GrantSettings page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('GrantSettings');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', grantSettingsPageUrlPattern);
      });

      it('edit button click should load edit GrantSettings page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('GrantSettings');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', grantSettingsPageUrlPattern);
      });

      it('last delete button click should delete instance of GrantSettings', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('grantSettings').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', grantSettingsPageUrlPattern);

        grantSettings = undefined;
      });
    });
  });

  describe('new GrantSettings page', () => {
    beforeEach(() => {
      cy.visit(`${grantSettingsPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('GrantSettings');
    });

    it('should create an instance of GrantSettings', () => {
      cy.get(`[data-cy="grantMap"]`).type('gosh instead');
      cy.get(`[data-cy="grantMap"]`).should('have.value', 'gosh instead');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        grantSettings = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', grantSettingsPageUrlPattern);
    });
  });
});
