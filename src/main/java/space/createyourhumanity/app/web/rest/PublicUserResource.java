package space.createyourhumanity.app.web.rest;

import java.util.*;
import java.util.stream.StreamSupport;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import space.createyourhumanity.app.domain.User;
import space.createyourhumanity.app.repository.UserRepository;
import space.createyourhumanity.app.repository.search.UserSearchRepository;
import space.createyourhumanity.app.service.UserService;
import space.createyourhumanity.app.service.dto.UserDTO;
import space.createyourhumanity.app.service.mapper.UserMapper;
import tech.jhipster.web.util.PaginationUtil;

@RestController
@RequestMapping("/api")
public class PublicUserResource {

    private static final Logger log = LoggerFactory.getLogger(PublicUserResource.class);

    private final UserService userService;
    private final UserSearchRepository userSearchRepository;
    private final UserRepository userRepository;

    public PublicUserResource(UserSearchRepository userSearchRepository, UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userSearchRepository = userSearchRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/users/updateBio")
    public void updateBioAttribute(@RequestParam String bio) {
        User user = userService.getUserWithAuthorities();
        this.userService.updateUser(user.getFirstName(), user.getLastName(), user.getEmail(), user.getLangKey(), user.getImageUrl(), bio);
    }

    public Optional<User> updateBioFromUser(String login, String bio) {
        return userRepository
            .findOneByLogin(login)
            .map(user -> {
                user.setBio(bio);
                userRepository.save(user);
                return user;
            });
    }

    /**
     * {@code GET /users} : get all users with only public information - calling
     * this method is allowed for anyone.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         all users.
     */
    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllPublicUsers(@org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        log.debug("REST request to get all public User names");

        final Page<UserDTO> page = userService.getAllPublicUsers(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
    }

    @GetMapping("/users/loggedInUser")
    public ResponseEntity<UserDTO> getLoggedInUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof DefaultOidcUser) {
            DefaultOidcUser oidcUser = (DefaultOidcUser) authentication.getPrincipal();
            String username = oidcUser.getName(); // or oidcUser.getPreferredUsername()
            User user =
                this.userService.getUserWithAuthoritiesByLogin(username).orElseThrow(
                        () -> new UsernameNotFoundException("User not found with username: " + username)
                    );
            return ResponseEntity.ok(new UserMapper().userToUserDTO(user));
        }
        return ResponseEntity.badRequest().build();
    }

    /**
     * {@code SEARCH /users/_search/:query} : search for the User corresponding to
     * the query.
     *
     * @param query the query to search.
     * @return the result of the search.
     */
    @GetMapping("/users/_search/{query}")
    public List<UserDTO> search(@PathVariable("query") String query) {
        return StreamSupport.stream(userSearchRepository.search(query).spliterator(), false).map(UserDTO::new).toList();
    }
}
