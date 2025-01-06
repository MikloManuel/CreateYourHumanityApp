package space.createyourhumanity.app.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static space.createyourhumanity.app.domain.PrivacySettingsAsserts.*;
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
import space.createyourhumanity.app.domain.PrivacySettings;
import space.createyourhumanity.app.repository.PrivacySettingsRepository;
import space.createyourhumanity.app.repository.UserRepository;
import space.createyourhumanity.app.repository.search.PrivacySettingsSearchRepository;

/**
 * Integration tests for the {@link PrivacySettingsResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class PrivacySettingsResourceIT {

    private static final String DEFAULT_SETTINGS_MAP = "AAAAAAAAAA";
    private static final String UPDATED_SETTINGS_MAP = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/privacy-settings";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";
    private static final String ENTITY_SEARCH_API_URL = "/api/privacy-settings/_search";

    @Autowired
    private ObjectMapper om;

    @Autowired
    private PrivacySettingsRepository privacySettingsRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PrivacySettingsSearchRepository privacySettingsSearchRepository;

    @Autowired
    private MockMvc restPrivacySettingsMockMvc;

    private PrivacySettings privacySettings;

    private PrivacySettings insertedPrivacySettings;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static PrivacySettings createEntity() {
        PrivacySettings privacySettings = new PrivacySettings().settingsMap(DEFAULT_SETTINGS_MAP);
        return privacySettings;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static PrivacySettings createUpdatedEntity() {
        PrivacySettings privacySettings = new PrivacySettings().settingsMap(UPDATED_SETTINGS_MAP);
        return privacySettings;
    }

    @BeforeEach
    public void initTest() {
        privacySettings = createEntity();
    }

    @AfterEach
    public void cleanup() {
        if (insertedPrivacySettings != null) {
            privacySettingsRepository.delete(insertedPrivacySettings);
            privacySettingsSearchRepository.delete(insertedPrivacySettings);
            insertedPrivacySettings = null;
        }
        userRepository.deleteAll();
    }

    @Test
    void createPrivacySettings() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(privacySettingsSearchRepository.findAll());
        // Create the PrivacySettings
        var returnedPrivacySettings = om.readValue(
            restPrivacySettingsMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(privacySettings))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            PrivacySettings.class
        );

        // Validate the PrivacySettings in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertPrivacySettingsUpdatableFieldsEquals(returnedPrivacySettings, getPersistedPrivacySettings(returnedPrivacySettings));

        await()
            .atMost(5, TimeUnit.SECONDS)
            .untilAsserted(() -> {
                int searchDatabaseSizeAfter = IterableUtil.sizeOf(privacySettingsSearchRepository.findAll());
                assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore + 1);
            });

        insertedPrivacySettings = returnedPrivacySettings;
    }

    @Test
    void createPrivacySettingsWithExistingId() throws Exception {
        // Create the PrivacySettings with an existing ID
        privacySettings.setId("existing_id");

        long databaseSizeBeforeCreate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(privacySettingsSearchRepository.findAll());

        // An entity with an existing ID cannot be created, so this API call must fail
        restPrivacySettingsMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(privacySettings))
            )
            .andExpect(status().isBadRequest());

        // Validate the PrivacySettings in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(privacySettingsSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void getAllPrivacySettings() throws Exception {
        // Initialize the database
        insertedPrivacySettings = privacySettingsRepository.save(privacySettings);

        // Get all the privacySettingsList
        restPrivacySettingsMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(privacySettings.getId())))
            .andExpect(jsonPath("$.[*].settingsMap").value(hasItem(DEFAULT_SETTINGS_MAP)));
    }

    @Test
    void getPrivacySettings() throws Exception {
        // Initialize the database
        insertedPrivacySettings = privacySettingsRepository.save(privacySettings);

        // Get the privacySettings
        restPrivacySettingsMockMvc
            .perform(get(ENTITY_API_URL_ID, privacySettings.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(privacySettings.getId()))
            .andExpect(jsonPath("$.settingsMap").value(DEFAULT_SETTINGS_MAP));
    }

    @Test
    void getNonExistingPrivacySettings() throws Exception {
        // Get the privacySettings
        restPrivacySettingsMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    void putExistingPrivacySettings() throws Exception {
        // Initialize the database
        insertedPrivacySettings = privacySettingsRepository.save(privacySettings);

        long databaseSizeBeforeUpdate = getRepositoryCount();
        privacySettingsSearchRepository.save(privacySettings);
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(privacySettingsSearchRepository.findAll());

        // Update the privacySettings
        PrivacySettings updatedPrivacySettings = privacySettingsRepository.findById(privacySettings.getId()).orElseThrow();
        updatedPrivacySettings.settingsMap(UPDATED_SETTINGS_MAP);

        restPrivacySettingsMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedPrivacySettings.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedPrivacySettings))
            )
            .andExpect(status().isOk());

        // Validate the PrivacySettings in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedPrivacySettingsToMatchAllProperties(updatedPrivacySettings);

        await()
            .atMost(5, TimeUnit.SECONDS)
            .untilAsserted(() -> {
                int searchDatabaseSizeAfter = IterableUtil.sizeOf(privacySettingsSearchRepository.findAll());
                assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
                List<PrivacySettings> privacySettingsSearchList = Streamable.of(privacySettingsSearchRepository.findAll()).toList();
                PrivacySettings testPrivacySettingsSearch = privacySettingsSearchList.get(searchDatabaseSizeAfter - 1);

                assertPrivacySettingsAllPropertiesEquals(testPrivacySettingsSearch, updatedPrivacySettings);
            });
    }

    @Test
    void putNonExistingPrivacySettings() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(privacySettingsSearchRepository.findAll());
        privacySettings.setId(UUID.randomUUID().toString());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restPrivacySettingsMockMvc
            .perform(
                put(ENTITY_API_URL_ID, privacySettings.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(privacySettings))
            )
            .andExpect(status().isBadRequest());

        // Validate the PrivacySettings in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(privacySettingsSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void putWithIdMismatchPrivacySettings() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(privacySettingsSearchRepository.findAll());
        privacySettings.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPrivacySettingsMockMvc
            .perform(
                put(ENTITY_API_URL_ID, UUID.randomUUID().toString())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(privacySettings))
            )
            .andExpect(status().isBadRequest());

        // Validate the PrivacySettings in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(privacySettingsSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void putWithMissingIdPathParamPrivacySettings() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(privacySettingsSearchRepository.findAll());
        privacySettings.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPrivacySettingsMockMvc
            .perform(
                put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(privacySettings))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the PrivacySettings in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(privacySettingsSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void partialUpdatePrivacySettingsWithPatch() throws Exception {
        // Initialize the database
        insertedPrivacySettings = privacySettingsRepository.save(privacySettings);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the privacySettings using partial update
        PrivacySettings partialUpdatedPrivacySettings = new PrivacySettings();
        partialUpdatedPrivacySettings.setId(privacySettings.getId());

        restPrivacySettingsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedPrivacySettings.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedPrivacySettings))
            )
            .andExpect(status().isOk());

        // Validate the PrivacySettings in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPrivacySettingsUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedPrivacySettings, privacySettings),
            getPersistedPrivacySettings(privacySettings)
        );
    }

    @Test
    void fullUpdatePrivacySettingsWithPatch() throws Exception {
        // Initialize the database
        insertedPrivacySettings = privacySettingsRepository.save(privacySettings);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the privacySettings using partial update
        PrivacySettings partialUpdatedPrivacySettings = new PrivacySettings();
        partialUpdatedPrivacySettings.setId(privacySettings.getId());

        partialUpdatedPrivacySettings.settingsMap(UPDATED_SETTINGS_MAP);

        restPrivacySettingsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedPrivacySettings.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedPrivacySettings))
            )
            .andExpect(status().isOk());

        // Validate the PrivacySettings in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPrivacySettingsUpdatableFieldsEquals(
            partialUpdatedPrivacySettings,
            getPersistedPrivacySettings(partialUpdatedPrivacySettings)
        );
    }

    @Test
    void patchNonExistingPrivacySettings() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(privacySettingsSearchRepository.findAll());
        privacySettings.setId(UUID.randomUUID().toString());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restPrivacySettingsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, privacySettings.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(privacySettings))
            )
            .andExpect(status().isBadRequest());

        // Validate the PrivacySettings in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(privacySettingsSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void patchWithIdMismatchPrivacySettings() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(privacySettingsSearchRepository.findAll());
        privacySettings.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPrivacySettingsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, UUID.randomUUID().toString())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(privacySettings))
            )
            .andExpect(status().isBadRequest());

        // Validate the PrivacySettings in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(privacySettingsSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void patchWithMissingIdPathParamPrivacySettings() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(privacySettingsSearchRepository.findAll());
        privacySettings.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPrivacySettingsMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(privacySettings))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the PrivacySettings in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(privacySettingsSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void deletePrivacySettings() throws Exception {
        // Initialize the database
        insertedPrivacySettings = privacySettingsRepository.save(privacySettings);
        privacySettingsRepository.save(privacySettings);
        privacySettingsSearchRepository.save(privacySettings);

        long databaseSizeBeforeDelete = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(privacySettingsSearchRepository.findAll());
        assertThat(searchDatabaseSizeBefore).isEqualTo(databaseSizeBeforeDelete);

        // Delete the privacySettings
        restPrivacySettingsMockMvc
            .perform(delete(ENTITY_API_URL_ID, privacySettings.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(privacySettingsSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore - 1);
    }

    @Test
    void searchPrivacySettings() throws Exception {
        // Initialize the database
        insertedPrivacySettings = privacySettingsRepository.save(privacySettings);
        privacySettingsSearchRepository.save(privacySettings);

        // Search the privacySettings
        restPrivacySettingsMockMvc
            .perform(get(ENTITY_SEARCH_API_URL + "?query=id:" + privacySettings.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(privacySettings.getId())))
            .andExpect(jsonPath("$.[*].settingsMap").value(hasItem(DEFAULT_SETTINGS_MAP)));
    }

    protected long getRepositoryCount() {
        return privacySettingsRepository.count();
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

    protected PrivacySettings getPersistedPrivacySettings(PrivacySettings privacySettings) {
        return privacySettingsRepository.findById(privacySettings.getId()).orElseThrow();
    }

    protected void assertPersistedPrivacySettingsToMatchAllProperties(PrivacySettings expectedPrivacySettings) {
        assertPrivacySettingsAllPropertiesEquals(expectedPrivacySettings, getPersistedPrivacySettings(expectedPrivacySettings));
    }

    protected void assertPersistedPrivacySettingsToMatchUpdatableProperties(PrivacySettings expectedPrivacySettings) {
        assertPrivacySettingsAllUpdatablePropertiesEquals(expectedPrivacySettings, getPersistedPrivacySettings(expectedPrivacySettings));
    }
}
