package space.createyourhumanity.app.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static space.createyourhumanity.app.domain.GrantSettingsAsserts.*;
import static space.createyourhumanity.app.web.rest.TestUtil.createUpdateProxyForBean;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import org.assertj.core.util.IterableUtil;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.util.Streamable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import space.createyourhumanity.app.IntegrationTest;
import space.createyourhumanity.app.domain.GrantSettings;
import space.createyourhumanity.app.repository.GrantSettingsRepository;
import space.createyourhumanity.app.repository.UserRepository;
import space.createyourhumanity.app.repository.search.GrantSettingsSearchRepository;

/**
 * Integration tests for the {@link GrantSettingsResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class GrantSettingsResourceIT {

    private static final String DEFAULT_GRANT_MAP = "AAAAAAAAAA";
    private static final String UPDATED_GRANT_MAP = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/grant-settings";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";
    private static final String ENTITY_SEARCH_API_URL = "/api/grant-settings/_search";

    @Autowired
    private ObjectMapper om;

    @Autowired
    private GrantSettingsRepository grantSettingsRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GrantSettingsSearchRepository grantSettingsSearchRepository;

    @Autowired
    private MockMvc restGrantSettingsMockMvc;

    private GrantSettings grantSettings;

    private GrantSettings insertedGrantSettings;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static GrantSettings createEntity() {
        GrantSettings grantSettings = new GrantSettings().grantMap(DEFAULT_GRANT_MAP);
        return grantSettings;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static GrantSettings createUpdatedEntity() {
        GrantSettings grantSettings = new GrantSettings().grantMap(UPDATED_GRANT_MAP);
        return grantSettings;
    }

    @BeforeEach
    public void initTest() {
        grantSettings = createEntity();
    }

    @AfterEach
    public void cleanup() {
        if (insertedGrantSettings != null) {
            grantSettingsRepository.delete(insertedGrantSettings);
            grantSettingsSearchRepository.delete(insertedGrantSettings);
            insertedGrantSettings = null;
        }
        userRepository.deleteAll();
    }

    @Test
    void createGrantSettings() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(grantSettingsSearchRepository.findAll());
        // Create the GrantSettings
        var returnedGrantSettings = om.readValue(
            restGrantSettingsMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(grantSettings))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            GrantSettings.class
        );

        // Validate the GrantSettings in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertGrantSettingsUpdatableFieldsEquals(returnedGrantSettings, getPersistedGrantSettings(returnedGrantSettings));

        await()
            .atMost(5, TimeUnit.SECONDS)
            .untilAsserted(() -> {
                int searchDatabaseSizeAfter = IterableUtil.sizeOf(grantSettingsSearchRepository.findAll());
                assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore + 1);
            });

        insertedGrantSettings = returnedGrantSettings;
    }

    @Test
    void createGrantSettingsWithExistingId() throws Exception {
        // Create the GrantSettings with an existing ID
        grantSettings.setId("existing_id");

        long databaseSizeBeforeCreate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(grantSettingsSearchRepository.findAll());

        // An entity with an existing ID cannot be created, so this API call must fail
        restGrantSettingsMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(grantSettings)))
            .andExpect(status().isBadRequest());

        // Validate the GrantSettings in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(grantSettingsSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void getAllGrantSettings() throws Exception {
        // Initialize the database
        insertedGrantSettings = grantSettingsRepository.save(grantSettings);

        // Get all the grantSettingsList
        restGrantSettingsMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(grantSettings.getId())))
            .andExpect(jsonPath("$.[*].grantMap").value(hasItem(DEFAULT_GRANT_MAP)));
    }

    @Test
    void getGrantSettings() throws Exception {
        // Initialize the database
        insertedGrantSettings = grantSettingsRepository.save(grantSettings);

        // Get the grantSettings
        restGrantSettingsMockMvc
            .perform(get(ENTITY_API_URL_ID, grantSettings.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(grantSettings.getId()))
            .andExpect(jsonPath("$.grantMap").value(DEFAULT_GRANT_MAP));
    }

    @Test
    void getNonExistingGrantSettings() throws Exception {
        // Get the grantSettings
        restGrantSettingsMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    void putExistingGrantSettings() throws Exception {
        // Initialize the database
        insertedGrantSettings = grantSettingsRepository.save(grantSettings);

        long databaseSizeBeforeUpdate = getRepositoryCount();
        grantSettingsSearchRepository.save(grantSettings);
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(grantSettingsSearchRepository.findAll());

        // Update the grantSettings
        GrantSettings updatedGrantSettings = grantSettingsRepository.findById(grantSettings.getId()).orElseThrow();
        updatedGrantSettings.grantMap(UPDATED_GRANT_MAP);

        restGrantSettingsMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedGrantSettings.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedGrantSettings))
            )
            .andExpect(status().isOk());

        // Validate the GrantSettings in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedGrantSettingsToMatchAllProperties(updatedGrantSettings);

        await()
            .atMost(5, TimeUnit.SECONDS)
            .untilAsserted(() -> {
                int searchDatabaseSizeAfter = IterableUtil.sizeOf(grantSettingsSearchRepository.findAll());
                assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
                List<GrantSettings> grantSettingsSearchList = Streamable.of(grantSettingsSearchRepository.findAll()).toList();
                GrantSettings testGrantSettingsSearch = grantSettingsSearchList.get(searchDatabaseSizeAfter - 1);

                assertGrantSettingsAllPropertiesEquals(testGrantSettingsSearch, updatedGrantSettings);
            });
    }

    @Test
    void putNonExistingGrantSettings() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(grantSettingsSearchRepository.findAll());
        grantSettings.setId(UUID.randomUUID().toString());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restGrantSettingsMockMvc
            .perform(
                put(ENTITY_API_URL_ID, grantSettings.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(grantSettings))
            )
            .andExpect(status().isBadRequest());

        // Validate the GrantSettings in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(grantSettingsSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void putWithIdMismatchGrantSettings() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(grantSettingsSearchRepository.findAll());
        grantSettings.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restGrantSettingsMockMvc
            .perform(
                put(ENTITY_API_URL_ID, UUID.randomUUID().toString())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(grantSettings))
            )
            .andExpect(status().isBadRequest());

        // Validate the GrantSettings in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(grantSettingsSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void putWithMissingIdPathParamGrantSettings() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(grantSettingsSearchRepository.findAll());
        grantSettings.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restGrantSettingsMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(grantSettings)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the GrantSettings in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(grantSettingsSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void partialUpdateGrantSettingsWithPatch() throws Exception {
        // Initialize the database
        insertedGrantSettings = grantSettingsRepository.save(grantSettings);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the grantSettings using partial update
        GrantSettings partialUpdatedGrantSettings = new GrantSettings();
        partialUpdatedGrantSettings.setId(grantSettings.getId());

        restGrantSettingsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedGrantSettings.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedGrantSettings))
            )
            .andExpect(status().isOk());

        // Validate the GrantSettings in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertGrantSettingsUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedGrantSettings, grantSettings),
            getPersistedGrantSettings(grantSettings)
        );
    }

    @Test
    void fullUpdateGrantSettingsWithPatch() throws Exception {
        // Initialize the database
        insertedGrantSettings = grantSettingsRepository.save(grantSettings);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the grantSettings using partial update
        GrantSettings partialUpdatedGrantSettings = new GrantSettings();
        partialUpdatedGrantSettings.setId(grantSettings.getId());

        partialUpdatedGrantSettings.grantMap(UPDATED_GRANT_MAP);

        restGrantSettingsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedGrantSettings.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedGrantSettings))
            )
            .andExpect(status().isOk());

        // Validate the GrantSettings in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertGrantSettingsUpdatableFieldsEquals(partialUpdatedGrantSettings, getPersistedGrantSettings(partialUpdatedGrantSettings));
    }

    @Test
    void patchNonExistingGrantSettings() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(grantSettingsSearchRepository.findAll());
        grantSettings.setId(UUID.randomUUID().toString());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restGrantSettingsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, grantSettings.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(grantSettings))
            )
            .andExpect(status().isBadRequest());

        // Validate the GrantSettings in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(grantSettingsSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void patchWithIdMismatchGrantSettings() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(grantSettingsSearchRepository.findAll());
        grantSettings.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restGrantSettingsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, UUID.randomUUID().toString())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(grantSettings))
            )
            .andExpect(status().isBadRequest());

        // Validate the GrantSettings in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(grantSettingsSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void patchWithMissingIdPathParamGrantSettings() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(grantSettingsSearchRepository.findAll());
        grantSettings.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restGrantSettingsMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(grantSettings))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the GrantSettings in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(grantSettingsSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void deleteGrantSettings() throws Exception {
        // Initialize the database
        insertedGrantSettings = grantSettingsRepository.save(grantSettings);
        grantSettingsRepository.save(grantSettings);
        grantSettingsSearchRepository.save(grantSettings);

        long databaseSizeBeforeDelete = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(grantSettingsSearchRepository.findAll());
        assertThat(searchDatabaseSizeBefore).isEqualTo(databaseSizeBeforeDelete);

        // Delete the grantSettings
        restGrantSettingsMockMvc
            .perform(delete(ENTITY_API_URL_ID, grantSettings.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(grantSettingsSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore - 1);
    }

    @Test
    void searchGrantSettings() throws Exception {
        // Initialize the database
        insertedGrantSettings = grantSettingsRepository.save(grantSettings);
        grantSettingsSearchRepository.save(grantSettings);

        // Search the grantSettings
        restGrantSettingsMockMvc
            .perform(get(ENTITY_SEARCH_API_URL + "?query=id:" + grantSettings.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(grantSettings.getId())))
            .andExpect(jsonPath("$.[*].grantMap").value(hasItem(DEFAULT_GRANT_MAP)));
    }

    protected long getRepositoryCount() {
        return grantSettingsRepository.count();
    }

    protected void assertIncrementedRepositoryCount(long countBefore) {
        assertThat(countBefore + 1).isEqualTo(getRepositoryCount());
    }

    protected void assertDecrementedRepositoryCount(long countBefore) {
        assertThat(countBefore - 1).isEqualTo(getRepositoryCount());
    }

    protected void assertSameRepositoryCount(long countBefore) {
        assertThat(countBefore).isEqualTo(getRepositoryCount());
    }

    protected GrantSettings getPersistedGrantSettings(GrantSettings grantSettings) {
        return grantSettingsRepository.findById(grantSettings.getId()).orElseThrow();
    }

    protected void assertPersistedGrantSettingsToMatchAllProperties(GrantSettings expectedGrantSettings) {
        assertGrantSettingsAllPropertiesEquals(expectedGrantSettings, getPersistedGrantSettings(expectedGrantSettings));
    }

    protected void assertPersistedGrantSettingsToMatchUpdatableProperties(GrantSettings expectedGrantSettings) {
        assertGrantSettingsAllUpdatablePropertiesEquals(expectedGrantSettings, getPersistedGrantSettings(expectedGrantSettings));
    }
}
