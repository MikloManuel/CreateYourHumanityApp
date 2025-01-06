package space.createyourhumanity.app.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static space.createyourhumanity.app.domain.UserMindmapTestSamples.*;

import org.junit.jupiter.api.Test;
import space.createyourhumanity.app.web.rest.TestUtil;

class UserMindmapTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(UserMindmap.class);
        UserMindmap userMindmap1 = getUserMindmapSample1();
        UserMindmap userMindmap2 = new UserMindmap();
        assertThat(userMindmap1).isNotEqualTo(userMindmap2);

        userMindmap2.setId(userMindmap1.getId());
        assertThat(userMindmap1).isEqualTo(userMindmap2);

        userMindmap2 = getUserMindmapSample2();
        assertThat(userMindmap1).isNotEqualTo(userMindmap2);
    }
}
