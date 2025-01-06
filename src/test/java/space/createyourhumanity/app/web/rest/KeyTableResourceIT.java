package space.createyourhumanity.app.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static space.createyourhumanity.app.domain.KeyTableAsserts.*;
import static space.createyourhumanity.app.web.rest.TestUtil.createUpdateProxyForBean;
import static space.createyourhumanity.app.web.rest.TestUtil.sameInstant;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
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
import space.createyourhumanity.app.domain.KeyTable;
import space.createyourhumanity.app.repository.KeyTableRepository;
import space.createyourhumanity.app.repository.search.KeyTableSearchRepository;

/**
 * Integration tests for the {@link KeyTableResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class KeyTableResourceIT {

    private static final String DEFAULT_KEY = "AAAAAAAAAA";
    private static final String UPDATED_KEY = "BBBBBBBBBB";

    private static final ZonedDateTime DEFAULT_CREATED = ZonedDateTime.ofInstant(Instant.ofEpochMilli(0L), ZoneOffset.UTC);
    private static final ZonedDateTime UPDATED_CREATED = ZonedDateTime.now(ZoneId.systemDefault()).withNano(0);

    private static final ZonedDateTime DEFAULT_MODIFIED = ZonedDateTime.ofInstant(Instant.ofEpochMilli(0L), ZoneOffset.UTC);
    private static final ZonedDateTime UPDATED_MODIFIED = ZonedDateTime.now(ZoneId.systemDefault()).withNano(0);

    private static final String ENTITY_API_URL = "/api/key-tables";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";
    private static final String ENTITY_SEARCH_API_URL = "/api/key-tables/_search";

    @Autowired
    private ObjectMapper om;

    @Autowired
    private KeyTableRepository keyTableRepository;

    @Autowired
    private KeyTableSearchRepository keyTableSearchRepository;

    @Autowired
    private MockMvc restKeyTableMockMvc;

    private KeyTable keyTable;

    private KeyTable insertedKeyTable;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static KeyTable createEntity() {
        KeyTable keyTable = new KeyTable().key(DEFAULT_KEY).created(DEFAULT_CREATED).modified(DEFAULT_MODIFIED);
        return keyTable;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static KeyTable createUpdatedEntity() {
        KeyTable keyTable = new KeyTable().key(UPDATED_KEY).created(UPDATED_CREATED).modified(UPDATED_MODIFIED);
        return keyTable;
    }

    @BeforeEach
    public void initTest() {
        keyTable = createEntity();
    }

    @AfterEach
    public void cleanup() {
        if (insertedKeyTable != null) {
            keyTableRepository.delete(insertedKeyTable);
            keyTableSearchRepository.delete(insertedKeyTable);
            insertedKeyTable = null;
        }
    }

    @Test
    void createKeyTable() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(keyTableSearchRepository.findAll());
        // Create the KeyTable
        var returnedKeyTable = om.readValue(
            restKeyTableMockMvc
                .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(keyTable)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            KeyTable.class
        );

        // Validate the KeyTable in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertKeyTableUpdatableFieldsEquals(returnedKeyTable, getPersistedKeyTable(returnedKeyTable));

        await()
            .atMost(5, TimeUnit.SECONDS)
            .untilAsserted(() -> {
                int searchDatabaseSizeAfter = IterableUtil.sizeOf(keyTableSearchRepository.findAll());
                assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore + 1);
            });

        insertedKeyTable = returnedKeyTable;
    }

    @Test
    void createKeyTableWithExistingId() throws Exception {
        // Create the KeyTable with an existing ID
        keyTable.setId("existing_id");

        long databaseSizeBeforeCreate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(keyTableSearchRepository.findAll());

        // An entity with an existing ID cannot be created, so this API call must fail
        restKeyTableMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(keyTable)))
            .andExpect(status().isBadRequest());

        // Validate the KeyTable in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(keyTableSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void getAllKeyTables() throws Exception {
        // Initialize the database
        insertedKeyTable = keyTableRepository.save(keyTable);

        // Get all the keyTableList
        restKeyTableMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(keyTable.getId())))
            .andExpect(jsonPath("$.[*].key").value(hasItem(DEFAULT_KEY)))
            .andExpect(jsonPath("$.[*].created").value(hasItem(sameInstant(DEFAULT_CREATED))))
            .andExpect(jsonPath("$.[*].modified").value(hasItem(sameInstant(DEFAULT_MODIFIED))));
    }

    @Test
    void getKeyTable() throws Exception {
        // Initialize the database
        insertedKeyTable = keyTableRepository.save(keyTable);

        // Get the keyTable
        restKeyTableMockMvc
            .perform(get(ENTITY_API_URL_ID, keyTable.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(keyTable.getId()))
            .andExpect(jsonPath("$.key").value(DEFAULT_KEY))
            .andExpect(jsonPath("$.created").value(sameInstant(DEFAULT_CREATED)))
            .andExpect(jsonPath("$.modified").value(sameInstant(DEFAULT_MODIFIED)));
    }

    @Test
    void getNonExistingKeyTable() throws Exception {
        // Get the keyTable
        restKeyTableMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    void putExistingKeyTable() throws Exception {
        // Initialize the database
        insertedKeyTable = keyTableRepository.save(keyTable);

        long databaseSizeBeforeUpdate = getRepositoryCount();
        keyTableSearchRepository.save(keyTable);
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(keyTableSearchRepository.findAll());

        // Update the keyTable
        KeyTable updatedKeyTable = keyTableRepository.findById(keyTable.getId()).orElseThrow();
        updatedKeyTable.key(UPDATED_KEY).created(UPDATED_CREATED).modified(UPDATED_MODIFIED);

        restKeyTableMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedKeyTable.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedKeyTable))
            )
            .andExpect(status().isOk());

        // Validate the KeyTable in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedKeyTableToMatchAllProperties(updatedKeyTable);

        await()
            .atMost(5, TimeUnit.SECONDS)
            .untilAsserted(() -> {
                int searchDatabaseSizeAfter = IterableUtil.sizeOf(keyTableSearchRepository.findAll());
                assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
                List<KeyTable> keyTableSearchList = Streamable.of(keyTableSearchRepository.findAll()).toList();
                KeyTable testKeyTableSearch = keyTableSearchList.get(searchDatabaseSizeAfter - 1);

                assertKeyTableAllPropertiesEquals(testKeyTableSearch, updatedKeyTable);
            });
    }

    @Test
    void putNonExistingKeyTable() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(keyTableSearchRepository.findAll());
        keyTable.setId(UUID.randomUUID().toString());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restKeyTableMockMvc
            .perform(
                put(ENTITY_API_URL_ID, keyTable.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(keyTable))
            )
            .andExpect(status().isBadRequest());

        // Validate the KeyTable in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(keyTableSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void putWithIdMismatchKeyTable() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(keyTableSearchRepository.findAll());
        keyTable.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restKeyTableMockMvc
            .perform(
                put(ENTITY_API_URL_ID, UUID.randomUUID().toString())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(keyTable))
            )
            .andExpect(status().isBadRequest());

        // Validate the KeyTable in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(keyTableSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void putWithMissingIdPathParamKeyTable() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(keyTableSearchRepository.findAll());
        keyTable.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restKeyTableMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(keyTable)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the KeyTable in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(keyTableSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void partialUpdateKeyTableWithPatch() throws Exception {
        // Initialize the database
        insertedKeyTable = keyTableRepository.save(keyTable);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the keyTable using partial update
        KeyTable partialUpdatedKeyTable = new KeyTable();
        partialUpdatedKeyTable.setId(keyTable.getId());

        restKeyTableMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedKeyTable.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedKeyTable))
            )
            .andExpect(status().isOk());

        // Validate the KeyTable in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertKeyTableUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedKeyTable, keyTable), getPersistedKeyTable(keyTable));
    }

    @Test
    void fullUpdateKeyTableWithPatch() throws Exception {
        // Initialize the database
        insertedKeyTable = keyTableRepository.save(keyTable);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the keyTable using partial update
        KeyTable partialUpdatedKeyTable = new KeyTable();
        partialUpdatedKeyTable.setId(keyTable.getId());

        partialUpdatedKeyTable.key(UPDATED_KEY).created(UPDATED_CREATED).modified(UPDATED_MODIFIED);

        restKeyTableMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedKeyTable.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedKeyTable))
            )
            .andExpect(status().isOk());

        // Validate the KeyTable in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertKeyTableUpdatableFieldsEquals(partialUpdatedKeyTable, getPersistedKeyTable(partialUpdatedKeyTable));
    }

    @Test
    void patchNonExistingKeyTable() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(keyTableSearchRepository.findAll());
        keyTable.setId(UUID.randomUUID().toString());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restKeyTableMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, keyTable.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(keyTable))
            )
            .andExpect(status().isBadRequest());

        // Validate the KeyTable in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(keyTableSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void patchWithIdMismatchKeyTable() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(keyTableSearchRepository.findAll());
        keyTable.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restKeyTableMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, UUID.randomUUID().toString())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(keyTable))
            )
            .andExpect(status().isBadRequest());

        // Validate the KeyTable in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(keyTableSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void patchWithMissingIdPathParamKeyTable() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(keyTableSearchRepository.findAll());
        keyTable.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restKeyTableMockMvc
            .perform(patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(keyTable)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the KeyTable in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(keyTableSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void deleteKeyTable() throws Exception {
        // Initialize the database
        insertedKeyTable = keyTableRepository.save(keyTable);
        keyTableRepository.save(keyTable);
        keyTableSearchRepository.save(keyTable);

        long databaseSizeBeforeDelete = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(keyTableSearchRepository.findAll());
        assertThat(searchDatabaseSizeBefore).isEqualTo(databaseSizeBeforeDelete);

        // Delete the keyTable
        restKeyTableMockMvc
            .perform(delete(ENTITY_API_URL_ID, keyTable.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(keyTableSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore - 1);
    }

    @Test
    void searchKeyTable() throws Exception {
        // Initialize the database
        insertedKeyTable = keyTableRepository.save(keyTable);
        keyTableSearchRepository.save(keyTable);

        // Search the keyTable
        restKeyTableMockMvc
            .perform(get(ENTITY_SEARCH_API_URL + "?query=id:" + keyTable.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(keyTable.getId())))
            .andExpect(jsonPath("$.[*].key").value(hasItem(DEFAULT_KEY)))
            .andExpect(jsonPath("$.[*].created").value(hasItem(sameInstant(DEFAULT_CREATED))))
            .andExpect(jsonPath("$.[*].modified").value(hasItem(sameInstant(DEFAULT_MODIFIED))));
    }

    protected long getRepositoryCount() {
        return keyTableRepository.count();
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

    protected KeyTable getPersistedKeyTable(KeyTable keyTable) {
        return keyTableRepository.findById(keyTable.getId()).orElseThrow();
    }

    protected void assertPersistedKeyTableToMatchAllProperties(KeyTable expectedKeyTable) {
        assertKeyTableAllPropertiesEquals(expectedKeyTable, getPersistedKeyTable(expectedKeyTable));
    }

    protected void assertPersistedKeyTableToMatchUpdatableProperties(KeyTable expectedKeyTable) {
        assertKeyTableAllUpdatablePropertiesEquals(expectedKeyTable, getPersistedKeyTable(expectedKeyTable));
    }
}
