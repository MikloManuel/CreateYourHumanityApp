package space.createyourhumanity.app.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static space.createyourhumanity.app.domain.AssertUtils.zonedDataTimeSameInstant;

public class FormulaDataAsserts {

    /**
     * Asserts that the entity has all properties (fields/relationships) set.
     *
     * @param expected the expected entity
     * @param actual the actual entity
     */
    public static void assertFormulaDataAllPropertiesEquals(FormulaData expected, FormulaData actual) {
        assertFormulaDataAutoGeneratedPropertiesEquals(expected, actual);
        assertFormulaDataAllUpdatablePropertiesEquals(expected, actual);
    }

    /**
     * Asserts that the entity has all updatable properties (fields/relationships) set.
     *
     * @param expected the expected entity
     * @param actual the actual entity
     */
    public static void assertFormulaDataAllUpdatablePropertiesEquals(FormulaData expected, FormulaData actual) {
        assertFormulaDataUpdatableFieldsEquals(expected, actual);
        assertFormulaDataUpdatableRelationshipsEquals(expected, actual);
    }

    /**
     * Asserts that the entity has all the auto generated properties (fields/relationships) set.
     *
     * @param expected the expected entity
     * @param actual the actual entity
     */
    public static void assertFormulaDataAutoGeneratedPropertiesEquals(FormulaData expected, FormulaData actual) {
        assertThat(expected)
            .as("Verify FormulaData auto generated properties")
            .satisfies(e -> assertThat(e.getId()).as("check id").isEqualTo(actual.getId()));
    }

    /**
     * Asserts that the entity has all the updatable fields set.
     *
     * @param expected the expected entity
     * @param actual the actual entity
     */
    public static void assertFormulaDataUpdatableFieldsEquals(FormulaData expected, FormulaData actual) {
        assertThat(expected)
            .as("Verify FormulaData relevant properties")
            .satisfies(e -> assertThat(e.getMap()).as("check map").isEqualTo(actual.getMap()))
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
    public static void assertFormulaDataUpdatableRelationshipsEquals(FormulaData expected, FormulaData actual) {}
}