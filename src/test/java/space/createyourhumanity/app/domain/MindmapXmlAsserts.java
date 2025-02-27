package space.createyourhumanity.app.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static space.createyourhumanity.app.domain.AssertUtils.zonedDataTimeSameInstant;

public class MindmapXmlAsserts {

    /**
     * Asserts that the entity has all properties (fields/relationships) set.
     *
     * @param expected the expected entity
     * @param actual the actual entity
     */
    public static void assertMindmapXmlAllPropertiesEquals(MindmapXml expected, MindmapXml actual) {
        assertMindmapXmlAutoGeneratedPropertiesEquals(expected, actual);
        assertMindmapXmlAllUpdatablePropertiesEquals(expected, actual);
    }

    /**
     * Asserts that the entity has all updatable properties (fields/relationships) set.
     *
     * @param expected the expected entity
     * @param actual the actual entity
     */
    public static void assertMindmapXmlAllUpdatablePropertiesEquals(MindmapXml expected, MindmapXml actual) {
        assertMindmapXmlUpdatableFieldsEquals(expected, actual);
        assertMindmapXmlUpdatableRelationshipsEquals(expected, actual);
    }

    /**
     * Asserts that the entity has all the auto generated properties (fields/relationships) set.
     *
     * @param expected the expected entity
     * @param actual the actual entity
     */
    public static void assertMindmapXmlAutoGeneratedPropertiesEquals(MindmapXml expected, MindmapXml actual) {
        assertThat(expected)
            .as("Verify MindmapXml auto generated properties")
            .satisfies(e -> assertThat(e.getId()).as("check id").isEqualTo(actual.getId()));
    }

    /**
     * Asserts that the entity has all the updatable fields set.
     *
     * @param expected the expected entity
     * @param actual the actual entity
     */
    public static void assertMindmapXmlUpdatableFieldsEquals(MindmapXml expected, MindmapXml actual) {
        assertThat(expected)
            .as("Verify MindmapXml relevant properties")
            .satisfies(e -> assertThat(e.getText()).as("check text").isEqualTo(actual.getText()))
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
    public static void assertMindmapXmlUpdatableRelationshipsEquals(MindmapXml expected, MindmapXml actual) {}
}
