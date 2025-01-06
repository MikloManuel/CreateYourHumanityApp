package space.createyourhumanity.app.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static space.createyourhumanity.app.domain.GrantSettingsTestSamples.*;

import org.junit.jupiter.api.Test;
import space.createyourhumanity.app.web.rest.TestUtil;

class GrantSettingsTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(GrantSettings.class);
        GrantSettings grantSettings1 = getGrantSettingsSample1();
        GrantSettings grantSettings2 = new GrantSettings();
        assertThat(grantSettings1).isNotEqualTo(grantSettings2);

        grantSettings2.setId(grantSettings1.getId());
        assertThat(grantSettings1).isEqualTo(grantSettings2);

        grantSettings2 = getGrantSettingsSample2();
        assertThat(grantSettings1).isNotEqualTo(grantSettings2);
    }
}
