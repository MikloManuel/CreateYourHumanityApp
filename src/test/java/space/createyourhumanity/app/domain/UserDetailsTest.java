package space.createyourhumanity.app.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static space.createyourhumanity.app.domain.UserDetailsTestSamples.*;

import org.junit.jupiter.api.Test;
import space.createyourhumanity.app.web.rest.TestUtil;

class UserDetailsTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(UserDetails.class);
        UserDetails userDetails1 = getUserDetailsSample1();
        UserDetails userDetails2 = new UserDetails();
        assertThat(userDetails1).isNotEqualTo(userDetails2);

        userDetails2.setId(userDetails1.getId());
        assertThat(userDetails1).isEqualTo(userDetails2);

        userDetails2 = getUserDetailsSample2();
        assertThat(userDetails1).isNotEqualTo(userDetails2);
    }
}
