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

describe('PrivacySettings e2e test', () => {
  const privacySettingsPageUrl = '/privacy-settings';
  const privacySettingsPageUrlPattern = new RegExp('/privacy-settings(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const privacySettingsSample = {};

  let privacySettings;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/privacy-settings+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/privacy-settings').as('postEntityRequest');
    cy.intercept('DELETE', '/api/privacy-settings/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (privacySettings) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/privacy-settings/${privacySettings.id}`,
      }).then(() => {
        privacySettings = undefined;
      });
    }
  });

  it('PrivacySettings menu should load PrivacySettings page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('privacy-settings');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('PrivacySettings').should('exist');
    cy.url().should('match', privacySettingsPageUrlPattern);
  });

  describe('PrivacySettings page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(privacySettingsPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create PrivacySettings page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/privacy-settings/new$'));
        cy.getEntityCreateUpdateHeading('PrivacySettings');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', privacySettingsPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/privacy-settings',
          body: privacySettingsSample,
        }).then(({ body }) => {
          privacySettings = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/privacy-settings+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [privacySettings],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(privacySettingsPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details PrivacySettings page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('privacySettings');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', privacySettingsPageUrlPattern);
      });

      it('edit button click should load edit PrivacySettings page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('PrivacySettings');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', privacySettingsPageUrlPattern);
      });

      it('edit button click should load edit PrivacySettings page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('PrivacySettings');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', privacySettingsPageUrlPattern);
      });

      it('last delete button click should delete instance of PrivacySettings', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('privacySettings').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', privacySettingsPageUrlPattern);

        privacySettings = undefined;
      });
    });
  });

  describe('new PrivacySettings page', () => {
    beforeEach(() => {
      cy.visit(`${privacySettingsPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('PrivacySettings');
    });

    it('should create an instance of PrivacySettings', () => {
      cy.get(`[data-cy="settingsMap"]`).type('whether zuletzt bah');
      cy.get(`[data-cy="settingsMap"]`).should('have.value', 'whether zuletzt bah');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        privacySettings = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', privacySettingsPageUrlPattern);
    });
  });
});
