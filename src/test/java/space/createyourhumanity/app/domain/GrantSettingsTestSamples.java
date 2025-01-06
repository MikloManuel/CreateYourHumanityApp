package space.createyourhumanity.app.domain;

import java.util.UUID;

public class GrantSettingsTestSamples {

    public static GrantSettings getGrantSettingsSample1() {
        return new GrantSettings().id("id1").grantMap("grantMap1");
    }

    public static GrantSettings getGrantSettingsSample2() {
        return new GrantSettings().id("id2").grantMap("grantMap2");
    }

    public static GrantSettings getGrantSettingsRandomSampleGenerator() {
        return new GrantSettings().id(UUID.randomUUID().toString()).grantMap(UUID.randomUUID().toString());
    }
}
