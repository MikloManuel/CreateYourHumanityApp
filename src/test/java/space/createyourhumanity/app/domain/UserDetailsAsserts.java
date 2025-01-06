package space.createyourhumanity.app.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static space.createyourhumanity.app.domain.AssertUtils.zonedDataTimeSameInstant;

public class UserDetailsAsserts {

    /**
     * Asserts that the entity has all properties (fields/relationships) set.
     *
     * @param expected the expected entity
     * @param actual the actual entity
     */
    public static void assertUserDetailsAllPropertiesEquals(UserDetails expected, UserDetails actual) {
        assertUserDetailsAutoGeneratedPropertiesEquals(expected, actual);
        assertUserDetailsAllUpdatablePropertiesEquals(expected, actual);
    }

    /**
     * Asserts that the entity has all updatable properties (fields/relationships) set.
     *
     * @param expected the expected entity
     * @param actual the actual entity
     */
    public static void assertUserDetailsAllUpdatablePropertiesEquals(UserDetails expected, UserDetails actual) {
        assertUserDetailsUpdatableFieldsEquals(expected, actual);
        assertUserDetailsUpdatableRelationshipsEquals(expected, actual);
    }

    /**
     * Asserts that the entity has all the auto generated properties (fields/relationships) set.
     *
     * @param expected the expected entity
     * @param actual the actual entity
     */
    public static void assertUserDetailsAutoGeneratedPropertiesEquals(UserDetails expected, UserDetails actual) {
        assertThat(expected)
            .as("Verify UserDetails auto generated properties")
            .satisfies(e -> assertThat(e.getId()).as("check id").isEqualTo(actual.getId()));
    }

    /**
     * Asserts that the entity has all the updatable fields set.
     *
     * @param expected the expected entity
     * @param actual the actual entity
     */
    public static void assertUserDetailsUpdatableFieldsEquals(UserDetails expected, UserDetails actual) {
        assertThat(expected)
            .as("Verify UserDetails relevant properties")
            .satisfies(e -> assertThat(e.getDob()).as("check dob").usingComparator(zonedDataTimeSameInstant).isEqualTo(actual.getDob()))
            .satisfies(
                e -> assertThat(e.getCreated()).as("check created").usingComparator(zonedDataTimeSameInstant).isEqualTo(actual.getCreated())
            )
            .satisfies(
                e ->
                    assertThat(e.getModified())
                        .as("check modified")
                        .usingComparator(zonedDataTimeSameInstant)
                        .isEqualTo(actual.getModified())
            );
    }

    /**
     * Asserts that the entity has all the updatable relationships set.
     *
     * @param expected the expected entity
     * @param actual the actual entity
     */
    public static void assertUserDetailsUpdatableRelationshipsEquals(UserDetails expected, UserDetails actual) {}
}