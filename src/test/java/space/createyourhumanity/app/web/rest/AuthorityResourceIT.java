package space.createyourhumanity.app.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static space.createyourhumanity.app.domain.AuthorityAsserts.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import space.createyourhumanity.app.IntegrationTest;
import space.createyourhumanity.app.domain.Authority;
import space.createyourhumanity.app.repository.AuthorityRepository;

/**
 * Integration tests for the {@link AuthorityResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser(authorities = { "ROLE_ADMIN" })
class AuthorityResourceIT {

    private static final String ENTITY_API_URL = "/api/authorities";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{name}";

    @Autowired
    private ObjectMapper om;

    @Autowired
    private AuthorityRepository authorityRepository;

    @Autowired
    private MockMvc restAuthorityMockMvc;

    private Authority authority;

    private Authority insertedAuthority;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Authority createEntity() {
        Authority authority = new Authority().name(UUID.randomUUID().toString());
        return authority;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Authority createUpdatedEntity() {
        Authority authority = new Authority().name(UUID.randomUUID().toString());
        return authority;
    }

    @BeforeEach
    public void initTest() {
        authority = createEntity();
    }

    @AfterEach
    public void cleanup() {
        if (insertedAuthority != null) {
            authorityRepository.delete(insertedAuthority);
            insertedAuthority = null;
        }
    }

    @Test
    void createAuthority() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Authority
        var returnedAuthority = om.readValue(
            restAuthorityMockMvc
                .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(authority)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            Authority.class
        );

        // Validate the Authority in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertAuthorityUpdatableFieldsEquals(returnedAuthority, getPersistedAuthority(returnedAuthority));

        insertedAuthority = returnedAuthority;
    }

    @Test
    void createAuthorityWithExistingId() throws Exception {
        // Create the Authority with an existing ID
        insertedAuthority = authorityRepository.save(authority);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restAuthorityMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(authority)))
            .andExpect(status().isBadRequest());

        // Validate the Authority in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    void getAllAuthorities() throws Exception {
        // Initialize the database
        authority.setName(UUID.randomUUID().toString());
        insertedAuthority = authorityRepository.save(authority);

        // Get all the authorityList
        restAuthorityMockMvc
            .perform(get(ENTITY_API_URL + "?sort=name,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].name").value(hasItem(authority.getName())));
    }

    @Test
    void getAuthority() throws Exception {
        // Initialize the database
        authority.setName(UUID.randomUUID().toString());
        insertedAuthority = authorityRepository.save(authority);

        // Get the authority
        restAuthorityMockMvc
            .perform(get(ENTITY_API_URL_ID, authority.getName()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.name").value(authority.getName()));
    }

    @Test
    void getNonExistingAuthority() throws Exception {
        // Get the authority
        restAuthorityMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    void deleteAuthority() throws Exception {
        // Initialize the database
        authority.setName(UUID.randomUUID().toString());
        insertedAuthority = authorityRepository.save(authority);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the authority
        restAuthorityMockMvc
            .perform(delete(ENTITY_API_URL_ID, authority.getName()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return authorityRepository.count();
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

    protected Authority getPersistedAuthority(Authority authority) {
        return authorityRepository.findById(authority.getName()).orElseThrow();
    }

    protected void assertPersistedAuthorityToMatchAllProperties(Authority expectedAuthority) {
        assertAuthorityAllPropertiesEquals(expectedAuthority, getPersistedAuthority(expectedAuthority));
    }

    protected void assertPersistedAuthorityToMatchUpdatableProperties(Authority expectedAuthority) {
        assertAuthorityAllUpdatablePropertiesEquals(expectedAuthority, getPersistedAuthority(expectedAuthority));
    }
}
