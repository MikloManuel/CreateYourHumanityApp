package space.createyourhumanity.app.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static space.createyourhumanity.app.domain.FormulaDataAsserts.*;
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
import space.createyourhumanity.app.domain.FormulaData;
import space.createyourhumanity.app.repository.FormulaDataRepository;
import space.createyourhumanity.app.repository.UserRepository;
import space.createyourhumanity.app.repository.search.FormulaDataSearchRepository;

/**
 * Integration tests for the {@link FormulaDataResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class FormulaDataResourceIT {

    private static final String DEFAULT_MAP = "AAAAAAAAAA";
    private static final String UPDATED_MAP = "BBBBBBBBBB";

    private static final ZonedDateTime DEFAULT_CREATED = ZonedDateTime.ofInstant(Instant.ofEpochMilli(0L), ZoneOffset.UTC);
    private static final ZonedDateTime UPDATED_CREATED = ZonedDateTime.now(ZoneId.systemDefault()).withNano(0);

    private static final ZonedDateTime DEFAULT_MODIFIED = ZonedDateTime.ofInstant(Instant.ofEpochMilli(0L), ZoneOffset.UTC);
    private static final ZonedDateTime UPDATED_MODIFIED = ZonedDateTime.now(ZoneId.systemDefault()).withNano(0);

    private static final String ENTITY_API_URL = "/api/formula-data";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";
    private static final String ENTITY_SEARCH_API_URL = "/api/formula-data/_search";

    @Autowired
    private ObjectMapper om;

    @Autowired
    private FormulaDataRepository formulaDataRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FormulaDataSearchRepository formulaDataSearchRepository;

    @Autowired
    private MockMvc restFormulaDataMockMvc;

    private FormulaData formulaData;

    private FormulaData insertedFormulaData;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static FormulaData createEntity() {
        FormulaData formulaData = new FormulaData().map(DEFAULT_MAP).created(DEFAULT_CREATED).modified(DEFAULT_MODIFIED);
        return formulaData;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static FormulaData createUpdatedEntity() {
        FormulaData formulaData = new FormulaData().map(UPDATED_MAP).created(UPDATED_CREATED).modified(UPDATED_MODIFIED);
        return formulaData;
    }

    @BeforeEach
    public void initTest() {
        formulaData = createEntity();
    }

    @AfterEach
    public void cleanup() {
        if (insertedFormulaData != null) {
            formulaDataRepository.delete(insertedFormulaData);
            formulaDataSearchRepository.delete(insertedFormulaData);
            insertedFormulaData = null;
        }
        userRepository.deleteAll();
    }

    @Test
    void createFormulaData() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(formulaDataSearchRepository.findAll());
        // Create the FormulaData
        var returnedFormulaData = om.readValue(
            restFormulaDataMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(formulaData))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            FormulaData.class
        );

        // Validate the FormulaData in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertFormulaDataUpdatableFieldsEquals(returnedFormulaData, getPersistedFormulaData(returnedFormulaData));

        await()
            .atMost(5, TimeUnit.SECONDS)
            .untilAsserted(() -> {
                int searchDatabaseSizeAfter = IterableUtil.sizeOf(formulaDataSearchRepository.findAll());
                assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore + 1);
            });

        insertedFormulaData = returnedFormulaData;
    }

    @Test
    void createFormulaDataWithExistingId() throws Exception {
        // Create the FormulaData with an existing ID
        formulaData.setId("existing_id");

        long databaseSizeBeforeCreate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(formulaDataSearchRepository.findAll());

        // An entity with an existing ID cannot be created, so this API call must fail
        restFormulaDataMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(formulaData)))
            .andExpect(status().isBadRequest());

        // Validate the FormulaData in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(formulaDataSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void getAllFormulaData() throws Exception {
        // Initialize the database
        insertedFormulaData = formulaDataRepository.save(formulaData);

        // Get all the formulaDataList
        restFormulaDataMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(formulaData.getId())))
            .andExpect(jsonPath("$.[*].map").value(hasItem(DEFAULT_MAP)))
            .andExpect(jsonPath("$.[*].created").value(hasItem(sameInstant(DEFAULT_CREATED))))
            .andExpect(jsonPath("$.[*].modified").value(hasItem(sameInstant(DEFAULT_MODIFIED))));
    }

    @Test
    void getFormulaData() throws Exception {
        // Initialize the database
        insertedFormulaData = formulaDataRepository.save(formulaData);

        // Get the formulaData
        restFormulaDataMockMvc
            .perform(get(ENTITY_API_URL_ID, formulaData.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(formulaData.getId()))
            .andExpect(jsonPath("$.map").value(DEFAULT_MAP))
            .andExpect(jsonPath("$.created").value(sameInstant(DEFAULT_CREATED)))
            .andExpect(jsonPath("$.modified").value(sameInstant(DEFAULT_MODIFIED)));
    }

    @Test
    void getNonExistingFormulaData() throws Exception {
        // Get the formulaData
        restFormulaDataMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    void putExistingFormulaData() throws Exception {
        // Initialize the database
        insertedFormulaData = formulaDataRepository.save(formulaData);

        long databaseSizeBeforeUpdate = getRepositoryCount();
        formulaDataSearchRepository.save(formulaData);
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(formulaDataSearchRepository.findAll());

        // Update the formulaData
        FormulaData updatedFormulaData = formulaDataRepository.findById(formulaData.getId()).orElseThrow();
        updatedFormulaData.map(UPDATED_MAP).created(UPDATED_CREATED).modified(UPDATED_MODIFIED);

        restFormulaDataMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedFormulaData.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedFormulaData))
            )
            .andExpect(status().isOk());

        // Validate the FormulaData in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedFormulaDataToMatchAllProperties(updatedFormulaData);

        await()
            .atMost(5, TimeUnit.SECONDS)
            .untilAsserted(() -> {
                int searchDatabaseSizeAfter = IterableUtil.sizeOf(formulaDataSearchRepository.findAll());
                assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
                List<FormulaData> formulaDataSearchList = Streamable.of(formulaDataSearchRepository.findAll()).toList();
                FormulaData testFormulaDataSearch = formulaDataSearchList.get(searchDatabaseSizeAfter - 1);

                assertFormulaDataAllPropertiesEquals(testFormulaDataSearch, updatedFormulaData);
            });
    }

    @Test
    void putNonExistingFormulaData() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(formulaDataSearchRepository.findAll());
        formulaData.setId(UUID.randomUUID().toString());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restFormulaDataMockMvc
            .perform(
                put(ENTITY_API_URL_ID, formulaData.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(formulaData))
            )
            .andExpect(status().isBadRequest());

        // Validate the FormulaData in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(formulaDataSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void putWithIdMismatchFormulaData() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(formulaDataSearchRepository.findAll());
        formulaData.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFormulaDataMockMvc
            .perform(
                put(ENTITY_API_URL_ID, UUID.randomUUID().toString())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(formulaData))
            )
            .andExpect(status().isBadRequest());

        // Validate the FormulaData in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(formulaDataSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void putWithMissingIdPathParamFormulaData() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(formulaDataSearchRepository.findAll());
        formulaData.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFormulaDataMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(formulaData)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the FormulaData in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(formulaDataSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void partialUpdateFormulaDataWithPatch() throws Exception {
        // Initialize the database
        insertedFormulaData = formulaDataRepository.save(formulaData);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the formulaData using partial update
        FormulaData partialUpdatedFormulaData = new FormulaData();
        partialUpdatedFormulaData.setId(formulaData.getId());

        partialUpdatedFormulaData.map(UPDATED_MAP).modified(UPDATED_MODIFIED);

        restFormulaDataMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedFormulaData.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedFormulaData))
            )
            .andExpect(status().isOk());

        // Validate the FormulaData in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertFormulaDataUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedFormulaData, formulaData),
            getPersistedFormulaData(formulaData)
        );
    }

    @Test
    void fullUpdateFormulaDataWithPatch() throws Exception {
        // Initialize the database
        insertedFormulaData = formulaDataRepository.save(formulaData);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the formulaData using partial update
        FormulaData partialUpdatedFormulaData = new FormulaData();
        partialUpdatedFormulaData.setId(formulaData.getId());

        partialUpdatedFormulaData.map(UPDATED_MAP).created(UPDATED_CREATED).modified(UPDATED_MODIFIED);

        restFormulaDataMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedFormulaData.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedFormulaData))
            )
            .andExpect(status().isOk());

        // Validate the FormulaData in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertFormulaDataUpdatableFieldsEquals(partialUpdatedFormulaData, getPersistedFormulaData(partialUpdatedFormulaData));
    }

    @Test
    void patchNonExistingFormulaData() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(formulaDataSearchRepository.findAll());
        formulaData.setId(UUID.randomUUID().toString());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restFormulaDataMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, formulaData.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(formulaData))
            )
            .andExpect(status().isBadRequest());

        // Validate the FormulaData in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(formulaDataSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void patchWithIdMismatchFormulaData() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(formulaDataSearchRepository.findAll());
        formulaData.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFormulaDataMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, UUID.randomUUID().toString())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(formulaData))
            )
            .andExpect(status().isBadRequest());

        // Validate the FormulaData in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(formulaDataSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void patchWithMissingIdPathParamFormulaData() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(formulaDataSearchRepository.findAll());
        formulaData.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFormulaDataMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(formulaData))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the FormulaData in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(formulaDataSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void deleteFormulaData() throws Exception {
        // Initialize the database
        insertedFormulaData = formulaDataRepository.save(formulaData);
        formulaDataRepository.save(formulaData);
        formulaDataSearchRepository.save(formulaData);

        long databaseSizeBeforeDelete = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(formulaDataSearchRepository.findAll());
        assertThat(searchDatabaseSizeBefore).isEqualTo(databaseSizeBeforeDelete);

        // Delete the formulaData
        restFormulaDataMockMvc
            .perform(delete(ENTITY_API_URL_ID, formulaData.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(formulaDataSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore - 1);
    }

    @Test
    void searchFormulaData() throws Exception {
        // Initialize the database
        insertedFormulaData = formulaDataRepository.save(formulaData);
        formulaDataSearchRepository.save(formulaData);

        // Search the formulaData
        restFormulaDataMockMvc
            .perform(get(ENTITY_SEARCH_API_URL + "?query=id:" + formulaData.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(formulaData.getId())))
            .andExpect(jsonPath("$.[*].map").value(hasItem(DEFAULT_MAP)))
            .andExpect(jsonPath("$.[*].created").value(hasItem(sameInstant(DEFAULT_CREATED))))
            .andExpect(jsonPath("$.[*].modified").value(hasItem(sameInstant(DEFAULT_MODIFIED))));
    }

    protected long getRepositoryCount() {
        return formulaDataRepository.count();
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

    protected FormulaData getPersistedFormulaData(FormulaData formulaData) {
        return formulaDataRepository.findById(formulaData.getId()).orElseThrow();
    }

    protected void assertPersistedFormulaDataToMatchAllProperties(FormulaData expectedFormulaData) {
        assertFormulaDataAllPropertiesEquals(expectedFormulaData, getPersistedFormulaData(expectedFormulaData));
    }

    protected void assertPersistedFormulaDataToMatchUpdatableProperties(FormulaData expectedFormulaData) {
        assertFormulaDataAllUpdatablePropertiesEquals(expectedFormulaData, getPersistedFormulaData(expectedFormulaData));
    }
}
