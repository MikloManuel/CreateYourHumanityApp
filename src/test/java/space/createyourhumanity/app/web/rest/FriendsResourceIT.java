package space.createyourhumanity.app.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static space.createyourhumanity.app.domain.FriendsAsserts.*;
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
import space.createyourhumanity.app.domain.Friends;
import space.createyourhumanity.app.repository.FriendsRepository;
import space.createyourhumanity.app.repository.UserRepository;
import space.createyourhumanity.app.repository.search.FriendsSearchRepository;

/**
 * Integration tests for the {@link FriendsResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class FriendsResourceIT {

    private static final ZonedDateTime DEFAULT_CONNECT_DATE = ZonedDateTime.ofInstant(Instant.ofEpochMilli(0L), ZoneOffset.UTC);
    private static final ZonedDateTime UPDATED_CONNECT_DATE = ZonedDateTime.now(ZoneId.systemDefault()).withNano(0);

    private static final String DEFAULT_FRIEND_ID = "AAAAAAAAAA";
    private static final String UPDATED_FRIEND_ID = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/friends";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";
    private static final String ENTITY_SEARCH_API_URL = "/api/friends/_search";

    @Autowired
    private ObjectMapper om;

    @Autowired
    private FriendsRepository friendsRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FriendsSearchRepository friendsSearchRepository;

    @Autowired
    private MockMvc restFriendsMockMvc;

    private Friends friends;

    private Friends insertedFriends;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Friends createEntity() {
        Friends friends = new Friends().connectDate(DEFAULT_CONNECT_DATE).friendId(DEFAULT_FRIEND_ID);
        return friends;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Friends createUpdatedEntity() {
        Friends friends = new Friends().connectDate(UPDATED_CONNECT_DATE).friendId(UPDATED_FRIEND_ID);
        return friends;
    }

    @BeforeEach
    public void initTest() {
        friends = createEntity();
    }

    @AfterEach
    public void cleanup() {
        if (insertedFriends != null) {
            friendsRepository.delete(insertedFriends);
            friendsSearchRepository.delete(insertedFriends);
            insertedFriends = null;
        }
        userRepository.deleteAll();
    }

    @Test
    void createFriends() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(friendsSearchRepository.findAll());
        // Create the Friends
        var returnedFriends = om.readValue(
            restFriendsMockMvc
                .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(friends)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            Friends.class
        );

        // Validate the Friends in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertFriendsUpdatableFieldsEquals(returnedFriends, getPersistedFriends(returnedFriends));

        await()
            .atMost(5, TimeUnit.SECONDS)
            .untilAsserted(() -> {
                int searchDatabaseSizeAfter = IterableUtil.sizeOf(friendsSearchRepository.findAll());
                assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore + 1);
            });

        insertedFriends = returnedFriends;
    }

    @Test
    void createFriendsWithExistingId() throws Exception {
        // Create the Friends with an existing ID
        friends.setId("existing_id");

        long databaseSizeBeforeCreate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(friendsSearchRepository.findAll());

        // An entity with an existing ID cannot be created, so this API call must fail
        restFriendsMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(friends)))
            .andExpect(status().isBadRequest());

        // Validate the Friends in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(friendsSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void getAllFriends() throws Exception {
        // Initialize the database
        insertedFriends = friendsRepository.save(friends);

        // Get all the friendsList
        restFriendsMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(friends.getId())))
            .andExpect(jsonPath("$.[*].connectDate").value(hasItem(sameInstant(DEFAULT_CONNECT_DATE))))
            .andExpect(jsonPath("$.[*].friendId").value(hasItem(DEFAULT_FRIEND_ID)));
    }

    @Test
    void getFriends() throws Exception {
        // Initialize the database
        insertedFriends = friendsRepository.save(friends);

        // Get the friends
        restFriendsMockMvc
            .perform(get(ENTITY_API_URL_ID, friends.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(friends.getId()))
            .andExpect(jsonPath("$.connectDate").value(sameInstant(DEFAULT_CONNECT_DATE)))
            .andExpect(jsonPath("$.friendId").value(DEFAULT_FRIEND_ID));
    }

    @Test
    void getNonExistingFriends() throws Exception {
        // Get the friends
        restFriendsMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    void putExistingFriends() throws Exception {
        // Initialize the database
        insertedFriends = friendsRepository.save(friends);

        long databaseSizeBeforeUpdate = getRepositoryCount();
        friendsSearchRepository.save(friends);
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(friendsSearchRepository.findAll());

        // Update the friends
        Friends updatedFriends = friendsRepository.findById(friends.getId()).orElseThrow();
        updatedFriends.connectDate(UPDATED_CONNECT_DATE).friendId(UPDATED_FRIEND_ID);

        restFriendsMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedFriends.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedFriends))
            )
            .andExpect(status().isOk());

        // Validate the Friends in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedFriendsToMatchAllProperties(updatedFriends);

        await()
            .atMost(5, TimeUnit.SECONDS)
            .untilAsserted(() -> {
                int searchDatabaseSizeAfter = IterableUtil.sizeOf(friendsSearchRepository.findAll());
                assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
                List<Friends> friendsSearchList = Streamable.of(friendsSearchRepository.findAll()).toList();
                Friends testFriendsSearch = friendsSearchList.get(searchDatabaseSizeAfter - 1);

                assertFriendsAllPropertiesEquals(testFriendsSearch, updatedFriends);
            });
    }

    @Test
    void putNonExistingFriends() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(friendsSearchRepository.findAll());
        friends.setId(UUID.randomUUID().toString());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restFriendsMockMvc
            .perform(
                put(ENTITY_API_URL_ID, friends.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(friends))
            )
            .andExpect(status().isBadRequest());

        // Validate the Friends in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(friendsSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void putWithIdMismatchFriends() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(friendsSearchRepository.findAll());
        friends.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFriendsMockMvc
            .perform(
                put(ENTITY_API_URL_ID, UUID.randomUUID().toString())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(friends))
            )
            .andExpect(status().isBadRequest());

        // Validate the Friends in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(friendsSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void putWithMissingIdPathParamFriends() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(friendsSearchRepository.findAll());
        friends.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFriendsMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(friends)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Friends in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(friendsSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void partialUpdateFriendsWithPatch() throws Exception {
        // Initialize the database
        insertedFriends = friendsRepository.save(friends);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the friends using partial update
        Friends partialUpdatedFriends = new Friends();
        partialUpdatedFriends.setId(friends.getId());

        partialUpdatedFriends.connectDate(UPDATED_CONNECT_DATE).friendId(UPDATED_FRIEND_ID);

        restFriendsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedFriends.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedFriends))
            )
            .andExpect(status().isOk());

        // Validate the Friends in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertFriendsUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedFriends, friends), getPersistedFriends(friends));
    }

    @Test
    void fullUpdateFriendsWithPatch() throws Exception {
        // Initialize the database
        insertedFriends = friendsRepository.save(friends);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the friends using partial update
        Friends partialUpdatedFriends = new Friends();
        partialUpdatedFriends.setId(friends.getId());

        partialUpdatedFriends.connectDate(UPDATED_CONNECT_DATE).friendId(UPDATED_FRIEND_ID);

        restFriendsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedFriends.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedFriends))
            )
            .andExpect(status().isOk());

        // Validate the Friends in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertFriendsUpdatableFieldsEquals(partialUpdatedFriends, getPersistedFriends(partialUpdatedFriends));
    }

    @Test
    void patchNonExistingFriends() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(friendsSearchRepository.findAll());
        friends.setId(UUID.randomUUID().toString());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restFriendsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, friends.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(friends))
            )
            .andExpect(status().isBadRequest());

        // Validate the Friends in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(friendsSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void patchWithIdMismatchFriends() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(friendsSearchRepository.findAll());
        friends.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFriendsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, UUID.randomUUID().toString())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(friends))
            )
            .andExpect(status().isBadRequest());

        // Validate the Friends in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(friendsSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void patchWithMissingIdPathParamFriends() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(friendsSearchRepository.findAll());
        friends.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFriendsMockMvc
            .perform(patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(friends)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Friends in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(friendsSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore);
    }

    @Test
    void deleteFriends() throws Exception {
        // Initialize the database
        insertedFriends = friendsRepository.save(friends);
        friendsRepository.save(friends);
        friendsSearchRepository.save(friends);

        long databaseSizeBeforeDelete = getRepositoryCount();
        int searchDatabaseSizeBefore = IterableUtil.sizeOf(friendsSearchRepository.findAll());
        assertThat(searchDatabaseSizeBefore).isEqualTo(databaseSizeBeforeDelete);

        // Delete the friends
        restFriendsMockMvc
            .perform(delete(ENTITY_API_URL_ID, friends.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
        int searchDatabaseSizeAfter = IterableUtil.sizeOf(friendsSearchRepository.findAll());
        assertThat(searchDatabaseSizeAfter).isEqualTo(searchDatabaseSizeBefore - 1);
    }

    @Test
    void searchFriends() throws Exception {
        // Initialize the database
        insertedFriends = friendsRepository.save(friends);
        friendsSearchRepository.save(friends);

        // Search the friends
        restFriendsMockMvc
            .perform(get(ENTITY_SEARCH_API_URL + "?query=id:" + friends.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(friends.getId())))
            .andExpect(jsonPath("$.[*].connectDate").value(hasItem(sameInstant(DEFAULT_CONNECT_DATE))))
            .andExpect(jsonPath("$.[*].friendId").value(hasItem(DEFAULT_FRIEND_ID)));
    }

    protected long getRepositoryCount() {
        return friendsRepository.count();
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

    protected Friends getPersistedFriends(Friends friends) {
        return friendsRepository.findById(friends.getId()).orElseThrow();
    }

    protected void assertPersistedFriendsToMatchAllProperties(Friends expectedFriends) {
        assertFriendsAllPropertiesEquals(expectedFriends, getPersistedFriends(expectedFriends));
    }

    protected void assertPersistedFriendsToMatchUpdatableProperties(Friends expectedFriends) {
        assertFriendsAllUpdatablePropertiesEquals(expectedFriends, getPersistedFriends(expectedFriends));
    }
}
