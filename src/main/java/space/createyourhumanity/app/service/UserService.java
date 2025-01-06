package space.createyourhumanity.app.service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.CacheManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import space.createyourhumanity.app.config.Constants;
import space.createyourhumanity.app.domain.Authority;
import space.createyourhumanity.app.domain.User;
import space.createyourhumanity.app.repository.AuthorityRepository;
import space.createyourhumanity.app.repository.UserRepository;
import space.createyourhumanity.app.repository.search.UserSearchRepository;
import space.createyourhumanity.app.security.SecurityUtils;
import space.createyourhumanity.app.service.dto.AdminUserDTO;
import space.createyourhumanity.app.service.dto.UserDTO;

/**
 * Service class for managing users.
 */
@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;

    private final UserSearchRepository userSearchRepository;

    private final AuthorityRepository authorityRepository;

    private final CacheManager cacheManager;

    public UserService(
        UserRepository userRepository,
        UserSearchRepository userSearchRepository,
        AuthorityRepository authorityRepository,
        CacheManager cacheManager
    ) {
        this.userRepository = userRepository;
        this.userSearchRepository = userSearchRepository;
        this.authorityRepository = authorityRepository;
        this.cacheManager = cacheManager;
    }

    /**
     * Update basic information (first name, last name, email, language) for the
     * current user.
     *
     * @param firstName first name of user.
     * @param lastName  last name of user.
     * @param email     email id of user.
     * @param langKey   language key.
     * @param imageUrl  image URL of user.
     */
    public void updateUser(String firstName, String lastName, String email, String langKey, String imageUrl, String bio) {
        SecurityUtils.getCurrentUserLogin()
            .flatMap(userRepository::findOneByLogin)
            .ifPresent(user -> {
                user.setFirstName(firstName);
                user.setLastName(lastName);
                if (email != null) {
                    user.setEmail(email.toLowerCase());
                }
                user.setLangKey(langKey);
                user.setImageUrl(imageUrl);
                user.setBio(bio);
                user.setAuthorities(
                    getAuthorities()
                        .stream()
                        .map(
                            authorityName ->
                                authorityRepository
                                    .findById(authorityName)
                                    .orElseThrow(() -> new RuntimeException("Authority not found: " + authorityName))
                        )
                        .collect(Collectors.toSet())
                );
                userRepository.save(user);
                userSearchRepository.index(user);
                this.clearUserCaches(user);
                log.debug("Changed Information for User: {}", user);
            });
    }

    public Page<AdminUserDTO> getAllManagedUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(AdminUserDTO::new);
    }

    public Page<UserDTO> getAllPublicUsers(Pageable pageable) {
        Page<UserDTO> users = userRepository.findAllByIdNotNullAndActivatedIsTrue(pageable).map(UserDTO::new);
        return users;
    }

    public Optional<User> getUserWithAuthoritiesByLogin(String login) {
        return userRepository.findOneByLogin(login);
    }

    public Optional<AdminUserDTO> getUserByLogin(String login) {
        return userRepository.findOneByLogin(login).map(AdminUserDTO::new);
    }

    /**
     * Gets a list of all the authorities.
     *
     * @return a list of all the authorities.
     */
    public List<String> getAuthorities() {
        return authorityRepository.findAll().stream().map(Authority::getName).toList();
    }

    private User syncUserWithIdP(Map<String, Object> details, User user) {
        Collection<String> dbAuthorities = getAuthorities();
        Collection<String> userAuthorities = Optional.ofNullable(user.getAuthorities())
            .orElse(Collections.emptySet())
            .stream()
            .map(Authority::getName)
            .toList();

        userAuthorities
            .stream()
            .filter(authority -> !dbAuthorities.contains(authority))
            .forEach(authority -> {
                Authority authorityToSave = new Authority();
                authorityToSave.setName(authority);
                authorityRepository.save(authorityToSave);
            });

        Optional<User> existingUser = userRepository.findOneByLogin(user.getLogin());
        if (existingUser.isPresent()) {
            if (details.get("updated_at") != null) {
                Instant dbModifiedDate = existingUser.orElseThrow().getLastModifiedDate();
                Instant idpModifiedDate = details.get("updated_at") instanceof Instant
                    ? (Instant) details.get("updated_at")
                    : Instant.ofEpochSecond((Integer) details.get("updated_at"));

                if (idpModifiedDate.isAfter(dbModifiedDate)) {
                    updateUser(
                        user.getFirstName(),
                        user.getLastName(),
                        user.getEmail(),
                        user.getLangKey(),
                        user.getImageUrl(),
                        user.getBio()
                    );
                }
            } else {
                updateUser(user.getFirstName(), user.getLastName(), user.getEmail(), user.getLangKey(), user.getImageUrl(), user.getBio());
            }
        } else {
            userRepository.save(user);
        }
        return user;
    }

    /**
     * Returns the user from an OAuth 2.0 login or resource server with JWT.
     * Synchronizes the user in the local repository.
     *
     * @param authToken the authentication token.
     * @return the user from the authentication.
     */
    public AdminUserDTO getUserFromAuthentication(AbstractAuthenticationToken authToken) {
        Map<String, Object> attributes;
        if (authToken instanceof OAuth2AuthenticationToken) {
            attributes = ((OAuth2AuthenticationToken) authToken).getPrincipal().getAttributes();
        } else if (authToken instanceof JwtAuthenticationToken) {
            attributes = ((JwtAuthenticationToken) authToken).getTokenAttributes();
        } else {
            throw new IllegalArgumentException("AuthenticationToken is not OAuth2 or JWT!");
        }
        User user = getUser(attributes);

        // Set authorities only once, from the authToken
        user.setAuthorities(
            authToken
                .getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .map(authority -> {
                    Authority auth = new Authority();
                    auth.setName(authority);
                    return auth;
                })
                .collect(Collectors.toSet())
        );

        return new AdminUserDTO(syncUserWithIdP(attributes, user));
    }

    private static User getUser(Map<String, Object> details) {
        User user = new User();
        Boolean activated = Boolean.TRUE;
        String sub = String.valueOf(details.get("sub"));
        String username = null;
        if (details.get("preferred_username") != null) {
            username = ((String) details.get("preferred_username")).toLowerCase();
        }
        // handle resource server JWT, where sub claim is email and uid is ID
        if (details.get("uid") != null) {
            user.setId((String) details.get("uid"));
            user.setLogin(sub);
        } else {
            user.setId(sub);
        }
        if (username != null) {
            user.setLogin(username);
        } else if (user.getLogin() == null) {
            user.setLogin(user.getId());
        }
        if (details.get("given_name") != null) {
            user.setFirstName((String) details.get("given_name"));
        } else if (details.get("name") != null) {
            user.setFirstName((String) details.get("name"));
        }
        if (details.get("family_name") != null) {
            user.setLastName((String) details.get("family_name"));
        }
        if (details.get("email_verified") != null) {
            activated = (Boolean) details.get("email_verified");
        }
        if (details.get("email") != null) {
            user.setEmail(((String) details.get("email")).toLowerCase());
        } else if (sub.contains("|") && (username != null && username.contains("@"))) {
            // special handling for Auth0
            user.setEmail(username);
        } else {
            user.setEmail(sub);
        }
        if (details.get("langKey") != null) {
            user.setLangKey((String) details.get("langKey"));
        } else if (details.get("locale") != null) {
            // trim off country code if it exists
            String locale = (String) details.get("locale");
            if (locale.contains("_")) {
                locale = locale.substring(0, locale.indexOf('_'));
            } else if (locale.contains("-")) {
                locale = locale.substring(0, locale.indexOf('-'));
            }
            user.setLangKey(locale.toLowerCase());
        } else {
            // set langKey to default if not specified by IdP
            user.setLangKey(Constants.DEFAULT_LANGUAGE);
        }
        if (details.get("picture") != null) {
            user.setImageUrl((String) details.get("picture"));
        }
        user.setActivated(activated);
        return user;
    }

    private void clearUserCaches(User user) {
        Objects.requireNonNull(cacheManager.getCache(UserRepository.USERS_BY_LOGIN_CACHE)).evict(user.getLogin());
        if (user.getEmail() != null) {
            Objects.requireNonNull(cacheManager.getCache(UserRepository.USERS_BY_EMAIL_CACHE)).evict(user.getEmail());
        }
    }

    public User getUserWithAuthorities() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof DefaultOidcUser) {
            DefaultOidcUser oidcUser = (DefaultOidcUser) authentication.getPrincipal();
            String username = oidcUser.getName(); // or oidcUser.getPreferredUsername()
            return this.getUserWithAuthoritiesByLogin(username).orElseThrow(
                    () -> new UsernameNotFoundException("User not found with username: " + username)
                );
        }
        throw new IllegalStateException("User not authenticated or not an OIDC user");
    }
}
