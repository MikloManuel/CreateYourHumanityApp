package space.createyourhumanity.app.domain;

import java.util.UUID;

public class FormulaDataTestSamples {

    public static FormulaData getFormulaDataSample1() {
        return new FormulaData().id("id1").map("map1");
    }

    public static FormulaData getFormulaDataSample2() {
        return new FormulaData().id("id2").map("map2");
    }

    public static FormulaData getFormulaDataRandomSampleGenerator() {
        return new FormulaData().id(UUID.randomUUID().toString()).map(UUID.randomUUID().toString());
    }
}
