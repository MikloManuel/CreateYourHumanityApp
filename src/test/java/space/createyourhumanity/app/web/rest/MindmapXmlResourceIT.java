package space.createyourhumanity.app.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static space.createyourhumanity.app.domain.MindmapXmlAsserts.*;
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
import space.createyourhumanity.app.domain.MindmapXml;
import space.createyourhumanity.app.repository.MindmapXmlRepository;
import space.createyourhumanity.app.repository.search.MindmapXmlSearchRepository;

/**
 * Integration tests for the {@link MindmapXmlResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class MindmapXmlResourceIT {

    private static final String DEFAULT_TEXT = "AAAAAAAAAA";
    private static final String UPDATED_TEXT = "BBBBBBBBBB";

    private static final ZonedDateTime DEFAULT_MODIFIED = ZonedDateTime.ofInstant(Instant.ofEpochMilli(0L), ZoneOffset.UTC);
    private static final ZonedDateTime UPDATED_MODIFIED = ZonedDateTime.now(ZoneId.systemDefault()).withNano(0);

    private static final String ENTITY_API_URL = "/api/mindmap-xmls";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";
    private static final String ENTITY_SEARCH_API_URL = "/api/mindmap-xmls/_search";

    @Autowired
    private ObjectMapper om;

    @Autowired
    private MindmapXmlRepository mindmapXmlRepository;

    @Autowired
    private MindmapXmlSearchRepository mindmapXmlSearchRepository;

    @Autowired
    private MockMvc restMindmapXmlMockMvc;

    private MindmapXml mindmapXml;

    private MindmapXml insertedMindmapXml;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static MindmapXml createEntity() {
        MindmapXml mindmapXml = new MindmapXml().text(DEFAULT_TEXT).modified(DEFAULT_MODIFIED);
        return mindmapXml;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static MindmapXml createUpdatedEntity() {
        MindmapXml mindmapXml = new MindmapXml().text(UPDATED_TEXT).modified(UPDATED_MODIFIED);
        return mindmapXml;
    }

    @BeforeEach
    public void initTest() {
        mindmapXml = createEntity();
    }

    @AfterEach
    public void cleanup() {
        if (insertedMindmapXml != null) {
            mindmapXmlRepository.delete(insertedMindmapXml);
            mindmapXmlSearchRepository.delete(insertedMindmapXml);
            insertedMindmapXml = null;
        }
    }

    @Test
    void createMindmapXml() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(mindmapXmlSearchRepository.findAll());
        // Create the MindmapXml
        var returnedMindmapXml = om.readValue(
            restMindmapXmlMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(mindmapXml))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            MindmapXml.class
        );

        // Validate the MindmapXml in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertMindmapXmlUpdatableFieldsEquals(returnedMindmapXml, getPersistedMindmapXml(returnedMindmapXml));

        await()
            .atMost(5, TimeUnit.SECONDS)
            .untilAsserted(() -> {
                int searchDatabaseSizeAfter = IterableUtil.sizeOf(mindmapXmlSearchRepository.findAll());
                assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore + 1);
            });

        insertedMindmapXml = returnedMindmapXml;
    }

    @Test
    void createMindmapXmlWithExistingId() throws Exception {
        // Create the MindmapXml with an existing ID
        mindmapXml.setId("existing_id");

        long databaseSizeBeforeCreate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(mindmapXmlSearchRepository.findAll());

        // An entity with an existing ID cannot be created, so this API call must fail
        restMindmapXmlMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(mindmapXml)))
            .andExpect(status().isBadRequest());

        // Validate the MindmapXml in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(mindmapXmlSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void getAllMindmapXmls() throws Exception {
        // Initialize the database
        insertedMindmapXml = mindmapXmlRepository.save(mindmapXml);

        // Get all the mindmapXmlList
        restMindmapXmlMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(mindmapXml.getId())))
            .andExpect(jsonPath("$.[*].text").value(hasItem(DEFAULT_TEXT)))
            .andExpect(jsonPath("$.[*].modified").value(hasItem(sameInstant(DEFAULT_MODIFIED))));
    }

    @Test
    void getMindmapXml() throws Exception {
        // Initialize the database
        insertedMindmapXml = mindmapXmlRepository.save(mindmapXml);

        // Get the mindmapXml
        restMindmapXmlMockMvc
            .perform(get(ENTITY_API_URL_ID, mindmapXml.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(mindmapXml.getId()))
            .andExpect(jsonPath("$.text").value(DEFAULT_TEXT))
            .andExpect(jsonPath("$.modified").value(sameInstant(DEFAULT_MODIFIED)));
    }

    @Test
    void getNonExistingMindmapXml() throws Exception {
        // Get the mindmapXml
        restMindmapXmlMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    void putExistingMindmapXml() throws Exception {
        // Initialize the database
        insertedMindmapXml = mindmapXmlRepository.save(mindmapXml);

        long databaseSizeBeforeUpdate = getRepositoryCount();
        mindmapXmlSearchRepository.save(mindmapXml);
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(mindmapXmlSearchRepository.findAll());

        // Update the mindmapXml
        MindmapXml updatedMindmapXml = mindmapXmlRepository.findById(mindmapXml.getId()).orElseThrow();
        updatedMindmapXml.text(UPDATED_TEXT).modified(UPDATED_MODIFIED);

        restMindmapXmlMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedMindmapXml.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedMindmapXml))
            )
            .andExpect(status().isOk());

        // Validate the MindmapXml in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedMindmapXmlToMatchAllProperties(updatedMindmapXml);

        await()
            .atMost(5, TimeUnit.SECONDS)
            .untilAsserted(() -> {
                int searchDatabaseSizeAfter = IterableUtil.sizeOf(mindmapXmlSearchRepository.findAll());
                assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
                List<MindmapXml> mindmapXmlSearchList = Streamable.of(mindmapXmlSearchRepository.findAll()).toList();
                MindmapXml testMindmapXmlSearch = mindmapXmlSearchList.get(searchDatabaseSizeAfter - 1);

                assertMindmapXmlAllPropertiesEquals(testMindmapXmlSearch, updatedMindmapXml);
            });
    }

    @Test
    void putNonExistingMindmapXml() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(mindmapXmlSearchRepository.findAll());
        mindmapXml.setId(UUID.randomUUID().toString());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restMindmapXmlMockMvc
            .perform(
                put(ENTITY_API_URL_ID, mindmapXml.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(mindmapXml))
            )
            .andExpect(status().isBadRequest());

        // Validate the MindmapXml in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(mindmapXmlSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void putWithIdMismatchMindmapXml() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(mindmapXmlSearchRepository.findAll());
        mindmapXml.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restMindmapXmlMockMvc
            .perform(
                put(ENTITY_API_URL_ID, UUID.randomUUID().toString())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(mindmapXml))
            )
            .andExpect(status().isBadRequest());

        // Validate the MindmapXml in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(mindmapXmlSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void putWithMissingIdPathParamMindmapXml() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(mindmapXmlSearchRepository.findAll());
        mindmapXml.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restMindmapXmlMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(mindmapXml)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the MindmapXml in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(mindmapXmlSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void partialUpdateMindmapXmlWithPatch() throws Exception {
        // Initialize the database
        insertedMindmapXml = mindmapXmlRepository.save(mindmapXml);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the mindmapXml using partial update
        MindmapXml partialUpdatedMindmapXml = new MindmapXml();
        partialUpdatedMindmapXml.setId(mindmapXml.getId());

        partialUpdatedMindmapXml.modified(UPDATED_MODIFIED);

        restMindmapXmlMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedMindmapXml.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedMindmapXml))
            )
            .andExpect(status().isOk());

        // Validate the MindmapXml in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertMindmapXmlUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedMindmapXml, mindmapXml),
            getPersistedMindmapXml(mindmapXml)
        );
    }

    @Test
    void fullUpdateMindmapXmlWithPatch() throws Exception {
        // Initialize the database
        insertedMindmapXml = mindmapXmlRepository.save(mindmapXml);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the mindmapXml using partial update
        MindmapXml partialUpdatedMindmapXml = new MindmapXml();
        partialUpdatedMindmapXml.setId(mindmapXml.getId());

        partialUpdatedMindmapXml.text(UPDATED_TEXT).modified(UPDATED_MODIFIED);

        restMindmapXmlMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedMindmapXml.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedMindmapXml))
            )
            .andExpect(status().isOk());

        // Validate the MindmapXml in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertMindmapXmlUpdatableFieldsEquals(partialUpdatedMindmapXml, getPersistedMindmapXml(partialUpdatedMindmapXml));
    }

    @Test
    void patchNonExistingMindmapXml() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(mindmapXmlSearchRepository.findAll());
        mindmapXml.setId(UUID.randomUUID().toString());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restMindmapXmlMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, mindmapXml.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(mindmapXml))
            )
            .andExpect(status().isBadRequest());

        // Validate the MindmapXml in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(mindmapXmlSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void patchWithIdMismatchMindmapXml() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(mindmapXmlSearchRepository.findAll());
        mindmapXml.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restMindmapXmlMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, UUID.randomUUID().toString())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(mindmapXml))
            )
            .andExpect(status().isBadRequest());

        // Validate the MindmapXml in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(mindmapXmlSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void patchWithMissingIdPathParamMindmapXml() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(mindmapXmlSearchRepository.findAll());
        mindmapXml.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restMindmapXmlMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(mindmapXml))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the MindmapXml in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(mindmapXmlSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void deleteMindmapXml() throws Exception {
        // Initialize the database
        insertedMindmapXml = mindmapXmlRepository.save(mindmapXml);
        mindmapXmlRepository.save(mindmapXml);
        mindmapXmlSearchRepository.save(mindmapXml);

        long databaseSizeBeforeDelete = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(mindmapXmlSearchRepository.findAll());
        assertThat(searchDatabaseSizeBefore).isEqualTo(databaseSizeBeforeDelete);

        // Delete the mindmapXml
        restMindmapXmlMockMvc
            .perform(delete(ENTITY_API_URL_ID, mindmapXml.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(mindmapXmlSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore - 1);
    }

    @Test
    void searchMindmapXml() throws Exception {
        // Initialize the database
        insertedMindmapXml = mindmapXmlRepository.save(mindmapXml);
        mindmapXmlSearchRepository.save(mindmapXml);

        // Search the mindmapXml
        restMindmapXmlMockMvc
            .perform(get(ENTITY_SEARCH_API_URL + "?query=id:" + mindmapXml.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(mindmapXml.getId())))
            .andExpect(jsonPath("$.[*].text").value(hasItem(DEFAULT_TEXT)))
            .andExpect(jsonPath("$.[*].modified").value(hasItem(sameInstant(DEFAULT_MODIFIED))));
    }

    protected long getRepositoryCount() {
        return mindmapXmlRepository.count();
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

    protected MindmapXml getPersistedMindmapXml(MindmapXml mindmapXml) {
        return mindmapXmlRepository.findById(mindmapXml.getId()).orElseThrow();
    }

    protected void assertPersistedMindmapXmlToMatchAllProperties(MindmapXml expectedMindmapXml) {
        assertMindmapXmlAllPropertiesEquals(expectedMindmapXml, getPersistedMindmapXml(expectedMindmapXml));
    }

    protected void assertPersistedMindmapXmlToMatchUpdatableProperties(MindmapXml expectedMindmapXml) {
        assertMindmapXmlAllUpdatablePropertiesEquals(expectedMindmapXml, getPersistedMindmapXml(expectedMindmapXml));
    }
}
