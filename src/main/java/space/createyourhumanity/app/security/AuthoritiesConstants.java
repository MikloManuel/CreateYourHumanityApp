package space.createyourhumanity.app.security;

/**
 * Constants for Spring Security authorities.
 */
public final class AuthoritiesConstants {

    public static final String ADMIN = "ROLE_ADMIN";

    public static final String USER = "ROLE_USER";

    public static final String ANONYMOUS = "ROLE_ANONYMOUS";

    public static final String ORGANIZER = "ROLE_ORGANISATOR";

    public static final String SUPPLIER = "ROLE_SUPPLIER";

    public static final String SERVICE = "ROLE_SERVICE";

    private AuthoritiesConstants() {}
}
