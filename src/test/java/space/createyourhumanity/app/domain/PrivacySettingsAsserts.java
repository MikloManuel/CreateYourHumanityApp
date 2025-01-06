package space.createyourhumanity.app.domain;

import static org.assertj.core.api.Assertions.assertThat;

public class PrivacySettingsAsserts {

    /**
     * Asserts that the entity has all properties (fields/relationships) set.
     *
     * @param expected the expected entity
     * @param actual the actual entity
     */
    public static void assertPrivacySettingsAllPropertiesEquals(PrivacySettings expected, PrivacySettings actual) {
        assertPrivacySettingsAutoGeneratedPropertiesEquals(expected, actual);
        assertPrivacySettingsAllUpdatablePropertiesEquals(expected, actual);
    }

    /**
     * Asserts that the entity has all updatable properties (fields/relationships) set.
     *
     * @param expected the expected entity
     * @param actual the actual entity
     */
    public static void assertPrivacySettingsAllUpdatablePropertiesEquals(PrivacySettings expected, PrivacySettings actual) {
        assertPrivacySettingsUpdatableFieldsEquals(expected, actual);
        assertPrivacySettingsUpdatableRelationshipsEquals(expected, actual);
    }

    /**
     * Asserts that the entity has all the auto generated properties (fields/relationships) set.
     *
     * @param expected the expected entity
     * @param actual the actual entity
     */
    public static void assertPrivacySettingsAutoGeneratedPropertiesEquals(PrivacySettings expected, PrivacySettings actual) {
        assertThat(expected)
            .as("Verify PrivacySettings auto generated properties")
            .satisfies(e -> assertThat(e.getId()).as("check id").isEqualTo(actual.getId()));
    }

    /**
     * Asserts that the entity has all the updatable fields set.
     *
     * @param expected the expected entity
     * @param actual the actual entity
     */
    public static void assertPrivacySettingsUpdatableFieldsEquals(PrivacySettings expected, PrivacySettings actual) {
        assertThat(expected)
            .as("Verify PrivacySettings relevant properties")
            .satisfies(e -> assertThat(e.getSettingsMap()).as("check settingsMap").isEqualTo(actual.getSettingsMap()));
    }

    /**
     * Asserts that the entity has all the updatable relationships set.
     *
     * @param expected the expected entity
     * @param actual the actual entity
     */
    public static void assertPrivacySettingsUpdatableRelationshipsEquals(PrivacySettings expected, PrivacySettings actual) {}
}