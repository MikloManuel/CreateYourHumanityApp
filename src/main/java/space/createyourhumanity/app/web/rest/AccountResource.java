package space.createyourhumanity.app.web.rest;

import jakarta.servlet.http.HttpServletRequest;
import java.security.Principal;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import space.createyourhumanity.app.service.UserService;
import space.createyourhumanity.app.service.dto.AdminUserDTO;

/**
 * REST controller for managing the current user's account.
 */
@RestController
@RequestMapping("/api")
public class AccountResource {

    private static class AccountResourceException extends RuntimeException {

        private static final long serialVersionUID = 1L;

        private AccountResourceException(String message) {
            super(message);
        }
    }

    private static final Logger log = LoggerFactory.getLogger(AccountResource.class);

    private final UserService userService;

    public AccountResource(UserService userService) {
        this.userService = userService;
    }

    /**
     * {@code GET  /account} : get the current user.
     *
     * @param principal the current user; resolves to {@code null} if not
     *                  authenticated.
     * @return the current user.
     * @throws AccountResourceException {@code 500 (Internal Server Error)} if the
     *                                  user couldn't be returned.
     */
    @GetMapping("/account")
    @SuppressWarnings("unchecked")
    public AdminUserDTO getAccount(Principal principal) {
        if (principal instanceof AbstractAuthenticationToken) {
            return userService.getUserFromAuthentication((AbstractAuthenticationToken) principal);
        } else {
            throw new AccountResourceException("User could not be found");
        }
    }

    @GetMapping("/account/{login}")
    @SuppressWarnings("unchecked")
    public Optional<AdminUserDTO> getUserByLogin(@PathVariable String login) {
        return userService.getUserWithAuthoritiesByLogin(login).map(AdminUserDTO::new);
    }

    /**
     * {@code GET  /authenticate} : check if the user is authenticated, and return
     * its login.
     *
     * @param request the HTTP request.
     * @return the login if the user is authenticated.
     */
    @GetMapping("/authenticate")
    public String isAuthenticated(HttpServletRequest request) {
        log.debug("REST request to check if the current user is authenticated");
        return request.getRemoteUser();
    }
}
