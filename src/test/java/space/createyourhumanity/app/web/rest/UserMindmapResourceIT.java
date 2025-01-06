package space.createyourhumanity.app.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static space.createyourhumanity.app.domain.UserMindmapAsserts.*;
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
import space.createyourhumanity.app.domain.UserMindmap;
import space.createyourhumanity.app.repository.UserMindmapRepository;
import space.createyourhumanity.app.repository.UserRepository;
import space.createyourhumanity.app.repository.search.UserMindmapSearchRepository;

/**
 * Integration tests for the {@link UserMindmapResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class UserMindmapResourceIT {

    private static final String DEFAULT_TEXT = "AAAAAAAAAA";
    private static final String UPDATED_TEXT = "BBBBBBBBBB";

    private static final ZonedDateTime DEFAULT_MODIFIED = ZonedDateTime.ofInstant(Instant.ofEpochMilli(0L), ZoneOffset.UTC);
    private static final ZonedDateTime UPDATED_MODIFIED = ZonedDateTime.now(ZoneId.systemDefault()).withNano(0);

    private static final String ENTITY_API_URL = "/api/user-mindmaps";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";
    private static final String ENTITY_SEARCH_API_URL = "/api/user-mindmaps/_search";

    @Autowired
    private ObjectMapper om;

    @Autowired
    private UserMindmapRepository userMindmapRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserMindmapSearchRepository userMindmapSearchRepository;

    @Autowired
    private MockMvc restUserMindmapMockMvc;

    private UserMindmap userMindmap;

    private UserMindmap insertedUserMindmap;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static UserMindmap createEntity() {
        UserMindmap userMindmap = new UserMindmap().text(DEFAULT_TEXT).modified(DEFAULT_MODIFIED);
        return userMindmap;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static UserMindmap createUpdatedEntity() {
        UserMindmap userMindmap = new UserMindmap().text(UPDATED_TEXT).modified(UPDATED_MODIFIED);
        return userMindmap;
    }

    @BeforeEach
    public void initTest() {
        userMindmap = createEntity();
    }

    @AfterEach
    public void cleanup() {
        if (insertedUserMindmap != null) {
            userMindmapRepository.delete(insertedUserMindmap);
            userMindmapSearchRepository.delete(insertedUserMindmap);
            insertedUserMindmap = null;
        }
        userRepository.deleteAll();
    }

    @Test
    void createUserMindmap() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(userMindmapSearchRepository.findAll());
        // Create the UserMindmap
        var returnedUserMindmap = om.readValue(
            restUserMindmapMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(userMindmap))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            UserMindmap.class
        );

        // Validate the UserMindmap in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertUserMindmapUpdatableFieldsEquals(returnedUserMindmap, getPersistedUserMindmap(returnedUserMindmap));

        await()
            .atMost(5, TimeUnit.SECONDS)
            .untilAsserted(() -> {
                int searchDatabaseSizeAfter = IterableUtil.sizeOf(userMindmapSearchRepository.findAll());
                assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore + 1);
            });

        insertedUserMindmap = returnedUserMindmap;
    }

    @Test
    void createUserMindmapWithExistingId() throws Exception {
        // Create the UserMindmap with an existing ID
        userMindmap.setId("existing_id");

        long databaseSizeBeforeCreate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(userMindmapSearchRepository.findAll());

        // An entity with an existing ID cannot be created, so this API call must fail
        restUserMindmapMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(userMindmap)))
            .andExpect(status().isBadRequest());

        // Validate the UserMindmap in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(userMindmapSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void getAllUserMindmaps() throws Exception {
        // Initialize the database
        insertedUserMindmap = userMindmapRepository.save(userMindmap);

        // Get all the userMindmapList
        restUserMindmapMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(userMindmap.getId())))
            .andExpect(jsonPath("$.[*].text").value(hasItem(DEFAULT_TEXT)))
            .andExpect(jsonPath("$.[*].modified").value(hasItem(sameInstant(DEFAULT_MODIFIED))));
    }

    @Test
    void getUserMindmap() throws Exception {
        // Initialize the database
        insertedUserMindmap = userMindmapRepository.save(userMindmap);

        // Get the userMindmap
        restUserMindmapMockMvc
            .perform(get(ENTITY_API_URL_ID, userMindmap.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(userMindmap.getId()))
            .andExpect(jsonPath("$.text").value(DEFAULT_TEXT))
            .andExpect(jsonPath("$.modified").value(sameInstant(DEFAULT_MODIFIED)));
    }

    @Test
    void getNonExistingUserMindmap() throws Exception {
        // Get the userMindmap
        restUserMindmapMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    void putExistingUserMindmap() throws Exception {
        // Initialize the database
        insertedUserMindmap = userMindmapRepository.save(userMindmap);

        long databaseSizeBeforeUpdate = getRepositoryCount();
        userMindmapSearchRepository.save(userMindmap);
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(userMindmapSearchRepository.findAll());

        // Update the userMindmap
        UserMindmap updatedUserMindmap = userMindmapRepository.findById(userMindmap.getId()).orElseThrow();
        updatedUserMindmap.text(UPDATED_TEXT).modified(UPDATED_MODIFIED);

        restUserMindmapMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedUserMindmap.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedUserMindmap))
            )
            .andExpect(status().isOk());

        // Validate the UserMindmap in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedUserMindmapToMatchAllProperties(updatedUserMindmap);

        await()
            .atMost(5, TimeUnit.SECONDS)
            .untilAsserted(() -> {
                int searchDatabaseSizeAfter = IterableUtil.sizeOf(userMindmapSearchRepository.findAll());
                assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
                List<UserMindmap> userMindmapSearchList = Streamable.of(userMindmapSearchRepository.findAll()).toList();
                UserMindmap testUserMindmapSearch = userMindmapSearchList.get(searchDatabaseSizeAfter - 1);

                assertUserMindmapAllPropertiesEquals(testUserMindmapSearch, updatedUserMindmap);
            });
    }

    @Test
    void putNonExistingUserMindmap() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(userMindmapSearchRepository.findAll());
        userMindmap.setId(UUID.randomUUID().toString());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restUserMindmapMockMvc
            .perform(
                put(ENTITY_API_URL_ID, userMindmap.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(userMindmap))
            )
            .andExpect(status().isBadRequest());

        // Validate the UserMindmap in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(userMindmapSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void putWithIdMismatchUserMindmap() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(userMindmapSearchRepository.findAll());
        userMindmap.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restUserMindmapMockMvc
            .perform(
                put(ENTITY_API_URL_ID, UUID.randomUUID().toString())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(userMindmap))
            )
            .andExpect(status().isBadRequest());

        // Validate the UserMindmap in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(userMindmapSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void putWithMissingIdPathParamUserMindmap() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(userMindmapSearchRepository.findAll());
        userMindmap.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restUserMindmapMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(userMindmap)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the UserMindmap in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(userMindmapSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void partialUpdateUserMindmapWithPatch() throws Exception {
        // Initialize the database
        insertedUserMindmap = userMindmapRepository.save(userMindmap);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the userMindmap using partial update
        UserMindmap partialUpdatedUserMindmap = new UserMindmap();
        partialUpdatedUserMindmap.setId(userMindmap.getId());

        restUserMindmapMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedUserMindmap.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedUserMindmap))
            )
            .andExpect(status().isOk());

        // Validate the UserMindmap in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertUserMindmapUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedUserMindmap, userMindmap),
            getPersistedUserMindmap(userMindmap)
        );
    }

    @Test
    void fullUpdateUserMindmapWithPatch() throws Exception {
        // Initialize the database
        insertedUserMindmap = userMindmapRepository.save(userMindmap);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the userMindmap using partial update
        UserMindmap partialUpdatedUserMindmap = new UserMindmap();
        partialUpdatedUserMindmap.setId(userMindmap.getId());

        partialUpdatedUserMindmap.text(UPDATED_TEXT).modified(UPDATED_MODIFIED);

        restUserMindmapMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedUserMindmap.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedUserMindmap))
            )
            .andExpect(status().isOk());

        // Validate the UserMindmap in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertUserMindmapUpdatableFieldsEquals(partialUpdatedUserMindmap, getPersistedUserMindmap(partialUpdatedUserMindmap));
    }

    @Test
    void patchNonExistingUserMindmap() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(userMindmapSearchRepository.findAll());
        userMindmap.setId(UUID.randomUUID().toString());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restUserMindmapMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, userMindmap.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(userMindmap))
            )
            .andExpect(status().isBadRequest());

        // Validate the UserMindmap in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(userMindmapSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void patchWithIdMismatchUserMindmap() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(userMindmapSearchRepository.findAll());
        userMindmap.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restUserMindmapMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, UUID.randomUUID().toString())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(userMindmap))
            )
            .andExpect(status().isBadRequest());

        // Validate the UserMindmap in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(userMindmapSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void patchWithMissingIdPathParamUserMindmap() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(userMindmapSearchRepository.findAll());
        userMindmap.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restUserMindmapMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(userMindmap))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the UserMindmap in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(userMindmapSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void deleteUserMindmap() throws Exception {
        // Initialize the database
        insertedUserMindmap = userMindmapRepository.save(userMindmap);
        userMindmapRepository.save(userMindmap);
        userMindmapSearchRepository.save(userMindmap);

        long databaseSizeBeforeDelete = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(userMindmapSearchRepository.findAll());
        assertThat(searchDatabaseSizeBefore).isEqualTo(databaseSizeBeforeDelete);

        // Delete the userMindmap
        restUserMindmapMockMvc
            .perform(delete(ENTITY_API_URL_ID, userMindmap.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(userMindmapSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore - 1);
    }

    @Test
    void searchUserMindmap() throws Exception {
        // Initialize the database
        insertedUserMindmap = userMindmapRepository.save(userMindmap);
        userMindmapSearchRepository.save(userMindmap);

        // Search the userMindmap
        restUserMindmapMockMvc
            .perform(get(ENTITY_SEARCH_API_URL + "?query=id:" + userMindmap.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(userMindmap.getId())))
            .andExpect(jsonPath("$.[*].text").value(hasItem(DEFAULT_TEXT)))
            .andExpect(jsonPath("$.[*].modified").value(hasItem(sameInstant(DEFAULT_MODIFIED))));
    }

    protected long getRepositoryCount() {
        return userMindmapRepository.count();
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

    protected UserMindmap getPersistedUserMindmap(UserMindmap userMindmap) {
        return userMindmapRepository.findById(userMindmap.getId()).orElseThrow();
    }

    protected void assertPersistedUserMindmapToMatchAllProperties(UserMindmap expectedUserMindmap) {
        assertUserMindmapAllPropertiesEquals(expectedUserMindmap, getPersistedUserMindmap(expectedUserMindmap));
    }

    protected void assertPersistedUserMindmapToMatchUpdatableProperties(UserMindmap expectedUserMindmap) {
        assertUserMindmapAllUpdatablePropertiesEquals(expectedUserMindmap, getPersistedUserMindmap(expectedUserMindmap));
    }
}
