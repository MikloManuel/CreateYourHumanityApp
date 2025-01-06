package space.createyourhumanity.app.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static space.createyourhumanity.app.domain.PrivacySettingsTestSamples.*;

import org.junit.jupiter.api.Test;
import space.createyourhumanity.app.web.rest.TestUtil;

class PrivacySettingsTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(PrivacySettings.class);
        PrivacySettings privacySettings1 = getPrivacySettingsSample1();
        PrivacySettings privacySettings2 = new PrivacySettings();
        assertThat(privacySettings1).isNotEqualTo(privacySettings2);

        privacySettings2.setId(privacySettings1.getId());
        assertThat(privacySettings1).isEqualTo(privacySettings2);

        privacySettings2 = getPrivacySettingsSample2();
        assertThat(privacySettings1).isNotEqualTo(privacySettings2);
    }
}
