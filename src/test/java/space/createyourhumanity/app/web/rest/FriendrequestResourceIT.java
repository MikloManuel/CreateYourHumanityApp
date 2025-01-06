package space.createyourhumanity.app.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static space.createyourhumanity.app.domain.FriendrequestAsserts.*;
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
import space.createyourhumanity.app.domain.Friendrequest;
import space.createyourhumanity.app.repository.FriendrequestRepository;
import space.createyourhumanity.app.repository.UserRepository;
import space.createyourhumanity.app.repository.search.FriendrequestSearchRepository;

/**
 * Integration tests for the {@link FriendrequestResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class FriendrequestResourceIT {

    private static final ZonedDateTime DEFAULT_REQUEST_DATE = ZonedDateTime.ofInstant(Instant.ofEpochMilli(0L), ZoneOffset.UTC);
    private static final ZonedDateTime UPDATED_REQUEST_DATE = ZonedDateTime.now(ZoneId.systemDefault()).withNano(0);

    private static final String DEFAULT_REQUEST_USER_ID = "AAAAAAAAAA";
    private static final String UPDATED_REQUEST_USER_ID = "BBBBBBBBBB";

    private static final String DEFAULT_INFO = "AAAAAAAAAA";
    private static final String UPDATED_INFO = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/friendrequests";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";
    private static final String ENTITY_SEARCH_API_URL = "/api/friendrequests/_search";

    @Autowired
    private ObjectMapper om;

    @Autowired
    private FriendrequestRepository friendrequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FriendrequestSearchRepository friendrequestSearchRepository;

    @Autowired
    private MockMvc restFriendrequestMockMvc;

    private Friendrequest friendrequest;

    private Friendrequest insertedFriendrequest;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Friendrequest createEntity() {
        Friendrequest friendrequest = new Friendrequest()
            .requestDate(DEFAULT_REQUEST_DATE)
            .requestUserId(DEFAULT_REQUEST_USER_ID)
            .info(DEFAULT_INFO);
        return friendrequest;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Friendrequest createUpdatedEntity() {
        Friendrequest friendrequest = new Friendrequest()
            .requestDate(UPDATED_REQUEST_DATE)
            .requestUserId(UPDATED_REQUEST_USER_ID)
            .info(UPDATED_INFO);
        return friendrequest;
    }

    @BeforeEach
    public void initTest() {
        friendrequest = createEntity();
    }

    @AfterEach
    public void cleanup() {
        if (insertedFriendrequest != null) {
            friendrequestRepository.delete(insertedFriendrequest);
            friendrequestSearchRepository.delete(insertedFriendrequest);
            insertedFriendrequest = null;
        }
        userRepository.deleteAll();
    }

    @Test
    void createFriendrequest() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(friendrequestSearchRepository.findAll());
        // Create the Friendrequest
        var returnedFriendrequest = om.readValue(
            restFriendrequestMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(friendrequest))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            Friendrequest.class
        );

        // Validate the Friendrequest in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertFriendrequestUpdatableFieldsEquals(returnedFriendrequest, getPersistedFriendrequest(returnedFriendrequest));

        await()
            .atMost(5, TimeUnit.SECONDS)
            .untilAsserted(() -> {
                int searchDatabaseSizeAfter = IterableUtil.sizeOf(friendrequestSearchRepository.findAll());
                assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore + 1);
            });

        insertedFriendrequest = returnedFriendrequest;
    }

    @Test
    void createFriendrequestWithExistingId() throws Exception {
        // Create the Friendrequest with an existing ID
        friendrequest.setId("existing_id");

        long databaseSizeBeforeCreate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(friendrequestSearchRepository.findAll());

        // An entity with an existing ID cannot be created, so this API call must fail
        restFriendrequestMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(friendrequest)))
            .andExpect(status().isBadRequest());

        // Validate the Friendrequest in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(friendrequestSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void getAllFriendrequests() throws Exception {
        // Initialize the database
        insertedFriendrequest = friendrequestRepository.save(friendrequest);

        // Get all the friendrequestList
        restFriendrequestMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(friendrequest.getId())))
            .andExpect(jsonPath("$.[*].requestDate").value(hasItem(sameInstant(DEFAULT_REQUEST_DATE))))
            .andExpect(jsonPath("$.[*].requestUserId").value(hasItem(DEFAULT_REQUEST_USER_ID)))
            .andExpect(jsonPath("$.[*].info").value(hasItem(DEFAULT_INFO.toString())));
    }

    @Test
    void getFriendrequest() throws Exception {
        // Initialize the database
        insertedFriendrequest = friendrequestRepository.save(friendrequest);

        // Get the friendrequest
        restFriendrequestMockMvc
            .perform(get(ENTITY_API_URL_ID, friendrequest.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(friendrequest.getId()))
            .andExpect(jsonPath("$.requestDate").value(sameInstant(DEFAULT_REQUEST_DATE)))
            .andExpect(jsonPath("$.requestUserId").value(DEFAULT_REQUEST_USER_ID))
            .andExpect(jsonPath("$.info").value(DEFAULT_INFO.toString()));
    }

    @Test
    void getNonExistingFriendrequest() throws Exception {
        // Get the friendrequest
        restFriendrequestMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    void putExistingFriendrequest() throws Exception {
        // Initialize the database
        insertedFriendrequest = friendrequestRepository.save(friendrequest);

        long databaseSizeBeforeUpdate = getRepositoryCount();
        friendrequestSearchRepository.save(friendrequest);
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(friendrequestSearchRepository.findAll());

        // Update the friendrequest
        Friendrequest updatedFriendrequest = friendrequestRepository.findById(friendrequest.getId()).orElseThrow();
        updatedFriendrequest.requestDate(UPDATED_REQUEST_DATE).requestUserId(UPDATED_REQUEST_USER_ID).info(UPDATED_INFO);

        restFriendrequestMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedFriendrequest.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedFriendrequest))
            )
            .andExpect(status().isOk());

        // Validate the Friendrequest in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedFriendrequestToMatchAllProperties(updatedFriendrequest);

        await()
            .atMost(5, TimeUnit.SECONDS)
            .untilAsserted(() -> {
                int searchDatabaseSizeAfter = IterableUtil.sizeOf(friendrequestSearchRepository.findAll());
                assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
                List<Friendrequest> friendrequestSearchList = Streamable.of(friendrequestSearchRepository.findAll()).toList();
                Friendrequest testFriendrequestSearch = friendrequestSearchList.get(searchDatabaseSizeAfter - 1);

                assertFriendrequestAllPropertiesEquals(testFriendrequestSearch, updatedFriendrequest);
            });
    }

    @Test
    void putNonExistingFriendrequest() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(friendrequestSearchRepository.findAll());
        friendrequest.setId(UUID.randomUUID().toString());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restFriendrequestMockMvc
            .perform(
                put(ENTITY_API_URL_ID, friendrequest.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(friendrequest))
            )
            .andExpect(status().isBadRequest());

        // Validate the Friendrequest in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(friendrequestSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void putWithIdMismatchFriendrequest() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(friendrequestSearchRepository.findAll());
        friendrequest.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFriendrequestMockMvc
            .perform(
                put(ENTITY_API_URL_ID, UUID.randomUUID().toString())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(friendrequest))
            )
            .andExpect(status().isBadRequest());

        // Validate the Friendrequest in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(friendrequestSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void putWithMissingIdPathParamFriendrequest() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(friendrequestSearchRepository.findAll());
        friendrequest.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFriendrequestMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(friendrequest)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Friendrequest in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(friendrequestSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void partialUpdateFriendrequestWithPatch() throws Exception {
        // Initialize the database
        insertedFriendrequest = friendrequestRepository.save(friendrequest);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the friendrequest using partial update
        Friendrequest partialUpdatedFriendrequest = new Friendrequest();
        partialUpdatedFriendrequest.setId(friendrequest.getId());

        partialUpdatedFriendrequest.requestDate(UPDATED_REQUEST_DATE).requestUserId(UPDATED_REQUEST_USER_ID);

        restFriendrequestMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedFriendrequest.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedFriendrequest))
            )
            .andExpect(status().isOk());

        // Validate the Friendrequest in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertFriendrequestUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedFriendrequest, friendrequest),
            getPersistedFriendrequest(friendrequest)
        );
    }

    @Test
    void fullUpdateFriendrequestWithPatch() throws Exception {
        // Initialize the database
        insertedFriendrequest = friendrequestRepository.save(friendrequest);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the friendrequest using partial update
        Friendrequest partialUpdatedFriendrequest = new Friendrequest();
        partialUpdatedFriendrequest.setId(friendrequest.getId());

        partialUpdatedFriendrequest.requestDate(UPDATED_REQUEST_DATE).requestUserId(UPDATED_REQUEST_USER_ID).info(UPDATED_INFO);

        restFriendrequestMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedFriendrequest.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedFriendrequest))
            )
            .andExpect(status().isOk());

        // Validate the Friendrequest in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertFriendrequestUpdatableFieldsEquals(partialUpdatedFriendrequest, getPersistedFriendrequest(partialUpdatedFriendrequest));
    }

    @Test
    void patchNonExistingFriendrequest() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(friendrequestSearchRepository.findAll());
        friendrequest.setId(UUID.randomUUID().toString());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restFriendrequestMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, friendrequest.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(friendrequest))
            )
            .andExpect(status().isBadRequest());

        // Validate the Friendrequest in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(friendrequestSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void patchWithIdMismatchFriendrequest() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(friendrequestSearchRepository.findAll());
        friendrequest.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFriendrequestMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, UUID.randomUUID().toString())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(friendrequest))
            )
            .andExpect(status().isBadRequest());

        // Validate the Friendrequest in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(friendrequestSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void patchWithMissingIdPathParamFriendrequest() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(friendrequestSearchRepository.findAll());
        friendrequest.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFriendrequestMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(friendrequest))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Friendrequest in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(friendrequestSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void deleteFriendrequest() throws Exception {
        // Initialize the database
        insertedFriendrequest = friendrequestRepository.save(friendrequest);
        friendrequestRepository.save(friendrequest);
        friendrequestSearchRepository.save(friendrequest);

        long databaseSizeBeforeDelete = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(friendrequestSearchRepository.findAll());
        assertThat(searchDatabaseSizeBefore).isEqualTo(databaseSizeBeforeDelete);

        // Delete the friendrequest
        restFriendrequestMockMvc
            .perform(delete(ENTITY_API_URL_ID, friendrequest.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(friendrequestSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore - 1);
    }

    @Test
    void searchFriendrequest() throws Exception {
        // Initialize the database
        insertedFriendrequest = friendrequestRepository.save(friendrequest);
        friendrequestSearchRepository.save(friendrequest);

        // Search the friendrequest
        restFriendrequestMockMvc
            .perform(get(ENTITY_SEARCH_API_URL + "?query=id:" + friendrequest.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(friendrequest.getId())))
            .andExpect(jsonPath("$.[*].requestDate").value(hasItem(sameInstant(DEFAULT_REQUEST_DATE))))
            .andExpect(jsonPath("$.[*].requestUserId").value(hasItem(DEFAULT_REQUEST_USER_ID)))
            .andExpect(jsonPath("$.[*].info").value(hasItem(DEFAULT_INFO.toString())));
    }

    protected long getRepositoryCount() {
        return friendrequestRepository.count();
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

    protected Friendrequest getPersistedFriendrequest(Friendrequest friendrequest) {
        return friendrequestRepository.findById(friendrequest.getId()).orElseThrow();
    }

    protected void assertPersistedFriendrequestToMatchAllProperties(Friendrequest expectedFriendrequest) {
        assertFriendrequestAllPropertiesEquals(expectedFriendrequest, getPersistedFriendrequest(expectedFriendrequest));
    }

    protected void assertPersistedFriendrequestToMatchUpdatableProperties(Friendrequest expectedFriendrequest) {
        assertFriendrequestAllUpdatablePropertiesEquals(expectedFriendrequest, getPersistedFriendrequest(expectedFriendrequest));
    }
}
