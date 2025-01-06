package space.createyourhumanity.app.domain;

import java.util.UUID;

public class PrivacySettingsTestSamples {

    public static PrivacySettings getPrivacySettingsSample1() {
        return new PrivacySettings().id("id1").settingsMap("settingsMap1");
    }

    public static PrivacySettings getPrivacySettingsSample2() {
        return new PrivacySettings().id("id2").settingsMap("settingsMap2");
    }

    public static PrivacySettings getPrivacySettingsRandomSampleGenerator() {
        return new PrivacySettings().id(UUID.randomUUID().toString()).settingsMap(UUID.randomUUID().toString());
    }
}
